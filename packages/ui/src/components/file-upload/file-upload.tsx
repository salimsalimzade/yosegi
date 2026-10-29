import type { JSX } from "@solidjs/web";
import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  flush,
  For,
  omit,
  Show,
  untrack,
  useContext,
} from "solid-js";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { createField, type Field, type FieldState, type FieldTextProps } from "../../primitives/create-field";
import { callHandler, dataAttr } from "../../primitives/dom";
import { createFieldParts } from "../../primitives/field-parts";
import { CloseIcon, RetryIcon, UploadIcon } from "../../primitives/icons";
import { useLabels, useLocale } from "../locale-provider/locale-provider";
import styles from "./file-upload.module.scss";

export type FileUploadStatus = "queued" | "uploading" | "done" | "error";

/** One file in the list, as `value` and `onChange` carry it. */
export interface FileUploadFile {
  id: string;
  file: File;
  name: string;
  /** In bytes. */
  size: number;
  /** queued and uploading only happen with `upload`. Without it, files are done as soon as they're added. */
  status: FileUploadStatus;
  /** 0–100 while uploading. */
  progress: number;
  /** Why it was refused or failed, shown on its row. */
  error?: string;
  /** Refused for its type or size: it can only be removed, not retried. */
  rejected?: boolean;
}

export interface FileUploadRejection {
  file: File;
  reason: "type" | "size" | "count";
  message: string;
}

export interface FileUploadUploadContext {
  /** Call with 0–100 as the file goes. */
  onProgress: (percent: number) => void;
  /** Aborts when the file is cancelled or removed; stop the request then. */
  signal: AbortSignal;
}

/**
 * A dashed dropzone to drag files onto, or click to browse; each file becomes
 * a row below it with its own progress. With no children it builds itself
 * from label, hint, description and errorMessage; pass the parts as children
 * to arrange them yourself.
 */
export interface FileUploadProps
  extends FieldState,
    FieldTextProps,
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /** File types, as in `<input accept>`: ".pdf,.png,.jpg" or "image/*". */
  accept?: string;
  /** The largest file, in bytes. Bigger files are refused with the reason on their row. */
  maxFileSize?: number;
  /** How many files can be added. At the limit the dropzone says so and takes no more. */
  maxFiles?: number;
  /** True by default. With false it takes one file, and a new one replaces it. */
  multiple?: boolean;
  /**
   * Sends one file. Call `onProgress` as it goes and stop when `signal` aborts.
   * Resolve when it's done; reject with a string to show that reason on the row.
   * Without it, files are only collected, and go with a form through `name`.
   */
  upload?: (file: File, context: FileUploadUploadContext) => Promise<unknown>;
  /** How many files upload at once; the rest wait. 2 by default. */
  concurrency?: number;
  value?: FileUploadFile[];
  defaultValue?: FileUploadFile[];
  onChange?: (files: FileUploadFile[]) => void;
  /** Files refused for their type, their size or the limit. */
  onReject?: (rejections: FileUploadRejection[]) => void;
  /** Sends the files with a form, from a hidden file input. */
  name?: string;
  /** What can be added, under the dropzone's title. Built from accept and maxFileSize when it isn't set. */
  hint?: JSX.Element;
  /** For the file sizes. The nearest LocaleProvider's, or English (en-US), by default. */
  locale?: string;
  /** The text it writes itself, for another language. */
  labels?: Partial<FileUploadLabels>;
}

/** The text FileUpload writes itself, for another language. */
export interface FileUploadLabels {
  /** The dropzone's title before the browse link. “Drag files here, or” by default. */
  drop: string;
  /** The same, when it takes one file. “Drag a file here, or” by default. */
  dropOne: string;
  /** The link that opens the file picker. “browse” by default. */
  browse: string;
  /** The dropzone's name for screen readers. “Upload files: drag them here, or press to browse” by default. */
  dropzone: string;
  /** While files are dragged over. “Drop to upload” by default. */
  dragging: string;
  /** Under it: how many are coming. “3 files” by default. */
  draggingCount: (count: number) => string;
  /** At maxFiles. “5 of 5 files added” by default. */
  full: (count: number, max: number) => string;
  /** Under it. “Remove one to add another” by default. */
  fullHint: string;
  /** The hint built from accept and maxFileSize: “PDF, PNG or JPG · up to 10 MB each”. */
  hint: (types: string | undefined, maxSize: string | undefined) => string;
  /** A row waiting its turn. “Waiting…” by default. */
  queued: string;
  /** A row that's done. “Uploaded” by default. */
  uploaded: string;
  /** The progress bar's name: “Uploading Kyoto itinerary.pdf”. */
  uploading: (name: string) => string;
  cancel: (name: string) => string;
  retry: (name: string) => string;
  remove: (name: string) => string;
  /** A refused file's reason: “Too big: 48 MB. Files can be up to 10 MB.” */
  tooBig: (size: string, max: string) => string;
  /** A refused file's reason: “This type of file can't be added. Use PDF, PNG or JPG.” */
  wrongType: (types: string | undefined) => string;
  /** Said when files are dropped past the limit: “Only 5 files can be added.” */
  tooMany: (max: number) => string;
  /** A failed upload's reason, when `upload` rejects without one. */
  failed: string;
  /** Under the dropzone while some rows have errors: “2 files weren't added.” */
  notAdded: (count: number) => string;
  /** Said when a file finishes: “Kyoto itinerary.pdf uploaded”. */
  done: (name: string) => string;
}

const defaultLabels: FileUploadLabels = {
  drop: "Drag files here, or",
  dropOne: "Drag a file here, or",
  browse: "browse",
  dropzone: "Upload files: drag them here, or press to browse",
  dragging: "Drop to upload",
  draggingCount: (count) => (count === 1 ? "1 file" : `${count} files`),
  full: (count, max) => `${count} of ${max} files added`,
  fullHint: "Remove one to add another",
  hint: (types, maxSize) => [types, maxSize && `up to ${maxSize} each`].filter(Boolean).join(" · "),
  queued: "Waiting…",
  uploaded: "Uploaded",
  uploading: (name) => `Uploading ${name}`,
  cancel: (name) => `Cancel ${name}`,
  retry: (name) => `Retry ${name}`,
  remove: (name) => `Remove ${name}`,
  tooBig: (size, max) => `Too big: ${size}. Files can be up to ${max}.`,
  wrongType: (types) => `This type of file can't be added.${types ? ` Use ${types}.` : ""}`,
  tooMany: (max) => (max === 1 ? "Only 1 file can be added." : `Only ${max} files can be added.`),
  failed: "Couldn't upload. Check your connection and try again.",
  notAdded: (count) => (count === 1 ? "1 file wasn't added." : `${count} files weren't added.`),
  done: (name) => `${name} uploaded`,
};

interface FileUploadContextValue {
  field: Field;
  files: () => FileUploadFile[];
  labels: () => FileUploadLabels;
  formatSize: (bytes: number) => string;
  multiple: () => boolean;
  /** How many files can be kept: maxFiles, or 1 without multiple. */
  max: () => number | undefined;
  /** The files that count toward the limit: everything but refused rows. */
  kept: () => FileUploadFile[];
  full: () => boolean;
  canEdit: () => boolean;
  dragging: () => number;
  setDragging: (count: number) => void;
  hint: () => JSX.Element;
  hasUpload: () => boolean;
  accept: () => string | undefined;
  name: () => string | undefined;
  add: (files: Iterable<File>) => void;
  remove: (id: string) => void;
  retry: (id: string) => void;
  browse: () => void;
  setInput: (input: HTMLInputElement) => void;
  titleId: string;
  hintId: string;
}

const FileUploadContext = createContext<FileUploadContextValue>();
const useFileUpload = () => useContext(FileUploadContext);

const UNITS = ["B", "KB", "MB", "GB"];

/** The extension, upper case, for a row's type tile: “PDF”. */
const extensionOf = (name: string) => {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(dot + 1, dot + 5).toUpperCase() : "FILE";
};

/** Whether a file matches an `accept` list: extensions, exact types or wildcards like image/*. */
function accepts(file: File, accept: string | undefined) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = file.type.toLowerCase();
  return accept
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean)
    .some((entry) =>
      entry.startsWith(".")
        ? name.endsWith(entry)
        : entry.endsWith("/*")
          ? type.startsWith(entry.slice(0, -1))
          : type === entry,
    );
}

/** An `accept` list in words: “.pdf,image/*” → “PDF or images”. */
function describeTypes(accept: string | undefined, locale: string) {
  if (!accept) return undefined;
  const words = accept
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      if (entry.startsWith(".")) return entry.slice(1).toUpperCase();
      if (entry.endsWith("/*")) return `${entry.slice(0, -2)}s`;
      const sub = entry.split("/")[1] ?? entry;
      return sub.toUpperCase();
    });
  return new Intl.ListFormat(locale, { type: "disjunction" }).format(words);
}

let counter = 0;

function FileUploadRoot(props: FileUploadProps) {
  const labels = useLabels("fileUpload", defaultLabels, () => props.labels);
  const locale = useLocale(() => props.locale);
  const number = createMemo(() => new Intl.NumberFormat(locale(), { maximumFractionDigits: 1 }));
  const formatSize = (bytes: number) => {
    let size = bytes;
    let unit = 0;
    while (size >= 1024 && unit < UNITS.length - 1) {
      size /= 1024;
      unit += 1;
    }
    return `${number().format(unit === 0 ? size : Math.round(size * 10) / 10)} ${UNITS[unit]}`;
  };

  const [files, setFiles] = createControllableSignal<FileUploadFile[]>({
    value: () => props.value,
    defaultValue: () => props.defaultValue ?? [],
    onChange: (next) => props.onChange?.(next),
  });
  // Writes are batched, so each one is flushed at once: the queue reads the
  // list straight after changing it, and a controlled value has come back by then.
  const write = (next: FileUploadFile[]) => {
    setFiles(next);
    flush();
  };
  const kept = () => files().filter((file) => !file.rejected);
  const errorCount = () => files().filter((file) => file.status === "error").length;

  // Rows with errors make the field invalid and say so, unless the app has its own message.
  const field = createField(
    {
      get validationState() {
        return props.validationState;
      },
      get required() {
        return props.required;
      },
      get disabled() {
        return props.disabled;
      },
      get readOnly() {
        return props.readOnly;
      },
      get errorMessage() {
        return props.errorMessage ?? (errorCount() > 0 ? labels().notAdded(errorCount()) : undefined);
      },
    },
    "yosegi-file-upload",
  );

  const multiple = () => props.multiple !== false;
  const max = () => (multiple() ? props.maxFiles : 1);
  const full = () => multiple() && max() !== undefined && kept().length >= (max() as number);
  const canEdit = () => !field.disabled() && !field.readOnly();
  const [dragging, setDragging] = createSignal(0);
  const [announcement, setAnnouncement] = createSignal("");
  let input: HTMLInputElement | undefined;
  const controllers = new Map<string, AbortController>();

  const update = (id: string, patch: Partial<FileUploadFile>) =>
    write(untrack(files).map((file) => (file.id === id ? { ...file, ...patch } : file)));

  // Starts queued files until `concurrency` are uploading.
  const pump = () => {
    const upload = props.upload;
    if (!upload) return;
    const current = untrack(files);
    let free = (props.concurrency ?? 2) - current.filter((file) => file.status === "uploading").length;
    for (const item of current) {
      if (free <= 0) break;
      if (item.status !== "queued") continue;
      free -= 1;
      start(item, upload);
    }
  };

  const start = (item: FileUploadFile, upload: NonNullable<FileUploadProps["upload"]>) => {
    const controller = new AbortController();
    controllers.set(item.id, controller);
    update(item.id, { status: "uploading", progress: 0, error: undefined });
    const alive = () => !controller.signal.aborted && untrack(files).some((file) => file.id === item.id);

    upload(item.file, {
      signal: controller.signal,
      onProgress: (percent) => {
        if (alive()) update(item.id, { progress: Math.max(0, Math.min(100, Math.round(percent))) });
      },
    })
      .then(
        () => {
          if (!alive()) return;
          update(item.id, { status: "done", progress: 100 });
          setAnnouncement(labels().done(item.name));
        },
        (reason) => {
          if (!alive()) return;
          const message = typeof reason === "string" && reason ? reason : labels().failed;
          update(item.id, { status: "error", error: message });
          setAnnouncement(`${item.name}: ${message}`);
        },
      )
      .finally(() => {
        controllers.delete(item.id);
        pump();
      });
  };

  const add = (incoming: Iterable<File>) => {
    if (!canEdit()) return;
    const list = [...incoming];
    if (list.length === 0) return;
    const rejections: FileUploadRejection[] = [];
    const added: FileUploadFile[] = [];
    const types = describeTypes(props.accept, locale());
    // One file at a time: the new one replaces whatever was there.
    let current = untrack(files);
    if (!multiple()) {
      current.forEach((file) => controllers.get(file.id)?.abort());
      current = [];
      list.splice(1);
    }
    let room = max() === undefined ? Infinity : (max() as number) - current.filter((file) => !file.rejected).length;

    for (const file of list) {
      const id = `yosegi-file-${++counter}`;
      const base = { id, file, name: file.name, size: file.size, progress: 0 };
      let reason: FileUploadRejection["reason"] | undefined;
      let message = "";
      if (!accepts(file, props.accept)) {
        reason = "type";
        message = labels().wrongType(types);
      } else if (props.maxFileSize !== undefined && file.size > props.maxFileSize) {
        reason = "size";
        message = labels().tooBig(formatSize(file.size), formatSize(props.maxFileSize));
      } else if (room <= 0) {
        reason = "count";
        message = labels().tooMany(max() as number);
      }
      if (reason) {
        rejections.push({ file, reason, message });
        // Past the limit there is no row: the dropzone already says the list is full.
        if (reason !== "count") added.push({ ...base, status: "error", error: message, rejected: true });
        continue;
      }
      room -= 1;
      added.push({ ...base, status: props.upload ? "queued" : "done", progress: props.upload ? 0 : 100 });
    }

    write([...current, ...added]);
    if (rejections.length) {
      props.onReject?.(rejections);
      setAnnouncement(rejections.map((r) => `${r.file.name}: ${r.message}`).join(" "));
    }
    pump();
  };

  const remove = (id: string) => {
    controllers.get(id)?.abort();
    controllers.delete(id);
    write(untrack(files).filter((file) => file.id !== id));
    pump();
  };

  const retry = (id: string) => {
    update(id, { status: "queued", progress: 0, error: undefined });
    pump();
  };

  // A form gets the files from the hidden input, so it follows the list.
  createEffect(
    () => kept().map((file) => file.file),
    (list) => {
      if (!input || !props.name) return;
      try {
        const transfer = new DataTransfer();
        list.forEach((file) => transfer.items.add(file));
        input.files = transfer.files;
      } catch {
        // Older browsers can't set files; the app's own upload still works.
      }
    },
  );

  const rest = omit(
    props,
    "accept",
    "maxFileSize",
    "maxFiles",
    "multiple",
    "upload",
    "concurrency",
    "value",
    "defaultValue",
    "onChange",
    "onReject",
    "name",
    "hint",
    "locale",
    "labels",
    "label",
    "description",
    "errorMessage",
    "validationState",
    "required",
    "disabled",
    "readOnly",
    "class",
    "children",
  );

  const id = createUniqueId();
  const context: FileUploadContextValue = {
    field,
    files,
    labels,
    formatSize,
    multiple,
    max,
    kept,
    full,
    canEdit,
    dragging,
    setDragging,
    hint: () =>
      props.hint ??
      labels().hint(
        describeTypes(props.accept, locale()),
        props.maxFileSize !== undefined ? formatSize(props.maxFileSize) : undefined,
      ),
    hasUpload: () => !!props.upload,
    accept: () => props.accept,
    name: () => props.name,
    add,
    remove,
    retry,
    browse: () => input?.click(),
    setInput: (el) => {
      input = el;
    },
    titleId: `yosegi-file-upload-${id}-title`,
    hintId: `yosegi-file-upload-${id}-hint`,
  };

  return (
    <FileUploadContext value={context}>
      <div
        {...rest}
        class={[styles.root, "yosegi-file-upload", props.class]}
        data-invalid={dataAttr(field.invalid())}
        data-disabled={dataAttr(field.disabled())}
        data-readonly={dataAttr(field.readOnly())}
        data-required={dataAttr(field.required())}
        data-dragging={dataAttr(dragging() > 0)}
        data-full={dataAttr(full())}
      >
        {"children" in props ? (
          props.children
        ) : (
          <Layout label={props.label} description={props.description}>
            <Show when={!field.readOnly()}>
              <Dropzone />
            </Show>
            <HiddenInput />
            <List />
          </Layout>
        )}
        <p class={[styles.live, "yosegi-file-upload-live"]} aria-live="polite">
          {announcement()}
        </p>
      </div>
    </FileUploadContext>
  );
}

/** The dashed area. Renders its icon, title, Trigger and hint unless you pass children. */
function Dropzone(props: JSX.HTMLAttributes<HTMLDivElement>) {
  const ctx = useFileUpload();
  const rest = omit(
    props,
    "class",
    "children",
    "onClick",
    "onKeyDown",
    "onDragEnter",
    "onDragOver",
    "onDragLeave",
    "onDrop",
  );
  const blocked = () => !ctx.canEdit() || ctx.full();
  let depth = 0;

  const leave = () => {
    depth = 0;
    ctx.setDragging(0);
  };

  return (
    <div
      role="button"
      tabindex={ctx.field.disabled() ? -1 : 0}
      aria-label={ctx.labels().dropzone}
      aria-describedby={[ctx.hintId, ctx.field.describedBy()].filter(Boolean).join(" ") || undefined}
      aria-disabled={blocked() ? "true" : undefined}
      {...rest}
      class={[styles.dropzone, "yosegi-file-upload-dropzone", props.class]}
      data-dragging={dataAttr(ctx.dragging() > 0 && !blocked())}
      data-full={dataAttr(ctx.full())}
      onClick={(event) => {
        callHandler(props.onClick, event);
        if (!blocked()) ctx.browse();
      }}
      onKeyDown={(event) => {
        callHandler(props.onKeyDown, event);
        if ((event.key === "Enter" || event.key === " ") && !blocked()) {
          event.preventDefault();
          ctx.browse();
        }
      }}
      onDragEnter={(event) => {
        callHandler(props.onDragEnter, event);
        if (blocked()) return;
        event.preventDefault();
        depth += 1;
        ctx.setDragging(Math.max(1, event.dataTransfer?.items.length ?? 1));
      }}
      onDragOver={(event) => {
        callHandler(props.onDragOver, event);
        if (blocked()) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
      }}
      onDragLeave={(event) => {
        callHandler(props.onDragLeave, event);
        depth -= 1;
        if (depth <= 0) leave();
      }}
      onDrop={(event) => {
        callHandler(props.onDrop, event);
        event.preventDefault();
        leave();
        if (!blocked() && event.dataTransfer) ctx.add(event.dataTransfer.files);
      }}
    >
      {"children" in props ? (
        props.children
      ) : (
        <>
          <span class={[styles["dropzone-icon"], "yosegi-file-upload-dropzone-icon"]} aria-hidden="true">
            <UploadIcon />
          </span>
          <span id={ctx.titleId} class={[styles["dropzone-title"], "yosegi-file-upload-dropzone-title"]}>
            <Show
              when={ctx.dragging() > 0 && !blocked()}
              fallback={
                <Show
                  when={ctx.full()}
                  fallback={
                    <>
                      {ctx.multiple() ? ctx.labels().drop : ctx.labels().dropOne} <Trigger />
                    </>
                  }
                >
                  {ctx.labels().full(ctx.kept().length, ctx.max() as number)}
                </Show>
              }
            >
              {ctx.labels().dragging}
            </Show>
          </span>
          <span id={ctx.hintId} class={[styles["dropzone-hint"], "yosegi-file-upload-dropzone-hint"]}>
            {ctx.dragging() > 0 && !blocked()
              ? ctx.labels().draggingCount(ctx.dragging())
              : ctx.full()
                ? ctx.labels().fullHint
                : ctx.hint()}
          </span>
        </>
      )}
    </div>
  );
}

/** The “browse” link inside the Dropzone's title. The Dropzone opens the picker; this only shows where. */
function Trigger(props: JSX.HTMLAttributes<HTMLSpanElement>) {
  const ctx = useFileUpload();
  const rest = omit(props, "class", "children");
  return (
    <span {...rest} class={[styles.trigger, "yosegi-file-upload-trigger", props.class]}>
      {props.children ?? ctx.labels().browse}
    </span>
  );
}

/** `<input type="file" hidden>`: what the Label points at, and what sends the files with a form. */
function HiddenInput(props: JSX.InputHTMLAttributes<HTMLInputElement>) {
  const ctx = useFileUpload();
  const rest = omit(props, "class", "onChange", "ref");
  return (
    <input
      type="file"
      hidden
      id={ctx.field.controlId}
      name={ctx.name()}
      accept={ctx.accept()}
      multiple={ctx.multiple()}
      disabled={!ctx.canEdit()}
      required={ctx.field.required() && ctx.files().length === 0}
      {...rest}
      ref={[(el: HTMLInputElement) => ctx.setInput(el), props.ref as any]}
      class={[styles["hidden-input"], "yosegi-file-upload-hidden-input", props.class]}
      onChange={(event) => {
        const picked = [...(event.currentTarget.files ?? [])];
        // Cleared first, so picking the same file again still counts as a change.
        event.currentTarget.value = "";
        ctx.add(picked);
        callHandler(props.onChange, event);
      }}
    />
  );
}

export interface FileUploadListProps extends Omit<JSX.HTMLAttributes<HTMLUListElement>, "children"> {
  /** Render each row yourself; FileUpload.Item by default. */
  children?: (file: () => FileUploadFile) => JSX.Element;
}

/** A row per file. Renders nothing while the list is empty. */
function List(props: FileUploadListProps) {
  const ctx = useFileUpload();
  const rest = omit(props, "class", "children");
  return (
    <Show when={ctx.files().length > 0}>
      <ul {...rest} class={[styles.list, "yosegi-file-upload-list", props.class]}>
        <For each={ctx.files()} keyed={(file) => file.id}>
          {(file) => (props.children ? props.children(file) : <Item file={file()} />)}
        </For>
      </ul>
    </Show>
  );
}

export interface FileUploadItemProps extends Omit<JSX.HTMLAttributes<HTMLLIElement>, "children"> {
  file: FileUploadFile;
}

/** One file's row: its type, name, size and status, progress while it uploads, and its buttons. */
function Item(props: FileUploadItemProps) {
  const ctx = useFileUpload();
  const rest = omit(props, "class", "file");
  const labels = () => ctx.labels();
  const meta = () => {
    const file = props.file;
    const size = ctx.formatSize(file.size);
    if (file.status === "error") return file.error;
    if (file.status === "uploading") return `${size} · ${file.progress}%`;
    if (file.status === "queued") return `${size} · ${labels().queued}`;
    return ctx.hasUpload() ? `${size} · ${labels().uploaded}` : size;
  };

  // After a remove, focus moves to the next row's first button, or back to the dropzone.
  const removeAndRefocus = (event: MouseEvent) => {
    const row = (event.currentTarget as HTMLElement).closest("li");
    const root = row?.closest(".yosegi-file-upload");
    const next = (row?.nextElementSibling ?? row?.previousElementSibling) as HTMLElement | null;
    ctx.remove(props.file.id);
    flush();
    const target = next?.isConnected ? next.querySelector<HTMLElement>("button") : null;
    (target ?? root?.querySelector<HTMLElement>(".yosegi-file-upload-dropzone"))?.focus();
  };

  return (
    <li
      {...rest}
      class={[styles.item, "yosegi-file-upload-item", props.class]}
      data-state={props.file.status}
      data-rejected={dataAttr(props.file.rejected)}
    >
      <span class={[styles["item-type"], "yosegi-file-upload-item-type"]} aria-hidden="true">
        {extensionOf(props.file.name)}
      </span>
      <span class={[styles["item-text"], "yosegi-file-upload-item-text"]}>
        <span class={[styles["item-name"], "yosegi-file-upload-item-name"]} title={props.file.name}>
          {props.file.name}
        </span>
        <span class={[styles["item-meta"], "yosegi-file-upload-item-meta"]}>{meta()}</span>
        <Show when={props.file.status === "uploading"}>
          <span
            class={[styles["item-progress"], "yosegi-file-upload-item-progress"]}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={props.file.progress}
            aria-label={labels().uploading(props.file.name)}
          >
            <span style={{ width: `${props.file.progress}%` }} />
          </span>
        </Show>
      </span>
      <Show when={ctx.canEdit()}>
        <span class={[styles["item-actions"], "yosegi-file-upload-item-actions"]}>
          <Show when={props.file.status === "error" && !props.file.rejected}>
            <button
              type="button"
              class={[styles["item-action"], "yosegi-file-upload-item-action"]}
              aria-label={labels().retry(props.file.name)}
              onClick={() => ctx.retry(props.file.id)}
            >
              <RetryIcon />
            </button>
          </Show>
          <button
            type="button"
            class={[styles["item-action"], "yosegi-file-upload-item-action"]}
            aria-label={
              props.file.status === "uploading" ? labels().cancel(props.file.name) : labels().remove(props.file.name)
            }
            onClick={removeAndRefocus}
          >
            <CloseIcon />
          </button>
        </span>
      </Show>
    </li>
  );
}

const { Layout, ...parts } = createFieldParts(
  () => useFileUpload().field,
  {
    label: styles.label,
    description: styles.description,
    errorMessage: styles["error-message"],
  },
  "yosegi-file-upload",
);

export const FileUpload = Object.assign(FileUploadRoot, {
  ...parts,
  Dropzone,
  Trigger,
  HiddenInput,
  List,
  Item,
});
