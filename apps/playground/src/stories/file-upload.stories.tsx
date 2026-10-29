import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, Show } from "solid-js";
import { Button, FileUpload, type FileUploadFile } from "yosegi-solid";
import { fakeUpload, sampleFile, tenMegabytes } from "../ui/uploads";

const meta = {
  title: "Forms/FileUpload",
  component: FileUpload,
  parameters: {
    stage: "field",
    docs: {
      description: {
        component:
          "A dashed dropzone to drag files onto, or click to browse; each file then becomes a row below it with its own progress, for attachments, imports and galleries.",
      },
    },
  },
  args: {
    label: "Attachments",
    description: "Up to 5 files.",
    accept: ".pdf,.png,.jpg",
    maxFileSize: tenMegabytes,
    maxFiles: 5,
    multiple: true,
    concurrency: 2,
    disabled: false,
    readOnly: false,
    required: false,
    upload: fakeUpload,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    accept: { control: "text" },
    maxFileSize: { control: "number" },
    maxFiles: { control: "number" },
    concurrency: { control: "number" },
    upload: { control: false },
    hint: { control: false },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. The upload is pretend: a file with “fail” in its name fails once. */
export const Playground: Story = {};

/** Empty: drag files on, or click to browse. The hint is built from accept and maxFileSize. */
export const Default: Story = {
  render: () => (
    <FileUpload
      label="Attachments"
      description="Up to 5 files."
      accept=".pdf,.png,.jpg"
      maxFileSize={10 * 1024 * 1024}
      maxFiles={5}
      upload={fakeUpload}
    />
  ),
};

/** Every row state at once: waiting, uploading, done, refused and failed. */
export const RowStates: Story = {
  name: "Row states",
  render: () => {
    const [files, setFiles] = createSignal<FileUploadFile[]>([
      sampleFile("Kyoto itinerary.pdf", 2.4, { status: "uploading", progress: 64 }),
      sampleFile("Hotel booking.pdf", 3.8, { status: "queued", progress: 0 }),
      sampleFile("Menu.jpg", 1.2),
      sampleFile("Hotel video.mov", 48, {
        status: "error",
        rejected: true,
        error: "This type of file can't be added. Use PDF, PNG or JPG.",
      }),
      sampleFile("Budget.pdf", 0.4, {
        status: "error",
        error: "Couldn't upload. Check your connection and try again.",
      }),
    ]);
    return (
      <FileUpload
        label="Attachments"
        accept=".pdf,.png,.jpg"
        maxFileSize={10 * 1024 * 1024}
        upload={fakeUpload}
        value={files()}
        onChange={setFiles}
      />
    );
  },
};

/** Files that fail: refused for size, or failed to send. The ErrorMessage says how many weren't added, until they're removed or retried. */
export const SomeFailed: Story = {
  name: "Some failed",
  render: () => (
    <FileUpload
      label="Attachments"
      accept=".pdf,.png,.jpg"
      maxFileSize={10 * 1024 * 1024}
      upload={fakeUpload}
      defaultValue={[
        sampleFile("Kyoto itinerary.pdf", 2.4),
        sampleFile("Scans.pdf", 48, {
          status: "error",
          rejected: true,
          error: "Too big: 48 MB. Files can be up to 10 MB.",
        }),
        sampleFile("Budget fail.pdf", 0.4, {
          status: "error",
          error: "Couldn't upload. Check your connection and try again.",
        }),
      ]}
    />
  ),
};

/** At maxFiles the dropzone says so and takes no more, until one is removed. */
export const LimitReached: Story = {
  name: "Limit reached",
  render: () => (
    <FileUpload
      label="Photos"
      description="Up to 3 photos."
      accept="image/*"
      maxFiles={3}
      upload={fakeUpload}
      defaultValue={[sampleFile("Beach.jpg", 3.1), sampleFile("Temple.jpg", 2.7), sampleFile("Market.png", 1.9)]}
    />
  ),
};

/** multiple={false}: one file, and a new one replaces it. */
export const SingleFile: Story = {
  name: "Single file",
  render: () => (
    <FileUpload
      label="Profile photo"
      accept="image/*"
      maxFileSize={2 * 1024 * 1024}
      multiple={false}
      upload={fakeUpload}
    />
  ),
};

/** Can't be used; say why in the description. */
export const Disabled: Story = {
  render: () => (
    <FileUpload
      label="Attachments"
      description="Attachments are off while the project is archived."
      accept=".pdf,.png,.jpg"
      disabled
      upload={fakeUpload}
    />
  ),
};

/** Shown, not changed: the rows without the dropzone or their buttons. */
export const ReadOnly: Story = {
  name: "Read-only",
  render: () => (
    <FileUpload
      label="Attachments"
      readOnly
      upload={fakeUpload}
      defaultValue={[sampleFile("Kyoto itinerary.pdf", 2.4), sampleFile("Menu.jpg", 1.2)]}
    />
  ),
};

/** Without upload: the files are only collected, and go with the form through name. */
export const InAForm: Story = {
  name: "In a form",
  render: () => {
    const [sent, setSent] = createSignal<string[]>();
    return (
      <form
        style={{ display: "grid", gap: "16px" }}
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          setSent(data.getAll("attachments").map((file) => (file as File).name));
        }}
      >
        <FileUpload label="Attachments" name="attachments" accept=".pdf,.png,.jpg" maxFiles={5} required />
        <div>
          <Button type="submit" label="Send" />
        </div>
        <Show when={sent()}>{(names) => <p>Sent: {names().length ? names().join(", ") : "no files"}</p>}</Show>
      </form>
    );
  },
};

/** The same field built from its parts, for full control over the markup. */
export const FromParts: Story = {
  name: "From parts",
  render: () => (
    <FileUpload accept=".pdf,.png,.jpg" maxFileSize={10 * 1024 * 1024} maxFiles={5} upload={fakeUpload}>
      <FileUpload.Label>Attachments</FileUpload.Label>
      <FileUpload.Dropzone />
      <FileUpload.HiddenInput name="attachments" />
      <FileUpload.List />
      <FileUpload.Description>Up to 5 files.</FileUpload.Description>
      <FileUpload.ErrorMessage>Some files weren't added.</FileUpload.ErrorMessage>
    </FileUpload>
  ),
};
