import type { Component } from "solid-js";
import { AccordionPage } from "./cases/accordion";
import { ButtonGroupPage } from "./cases/button-group";
import { ButtonPage } from "./cases/button";
import { CheckboxPage } from "./cases/checkbox";
import { ComboboxPage } from "./cases/combobox";
import { CommandPage } from "./cases/command";
import { DatePickerPage } from "./cases/date-picker";
import { DialogPage } from "./cases/dialog";
import { EmptyStatePage } from "./cases/empty-state";
import { ErrorStatePage } from "./cases/error-state";
import { FilterPage } from "./cases/filter";
import { IconsPage } from "./cases/icons";
import { ItemPage } from "./cases/item";
import { NotFoundPage } from "./cases/not-found";
import { NumberFieldPage } from "./cases/number-field";
import { PaginationPage } from "./cases/pagination";
import { PopoverPage } from "./cases/popover";
import { SelectPage } from "./cases/select";
import { SeparatorPage } from "./cases/separator";
import { SpinnerPage } from "./cases/spinner";
import { TablePage } from "./cases/table";
import { TabsPage } from "./cases/tabs";
import { TextFieldPage } from "./cases/text-field";
import { ToastPage } from "./cases/toast";
import { TooltipPage } from "./cases/tooltip";

export interface Entry {
  slug: string;
  name: string;
  group: Group;
  summary: string;
  /** The component and its parts, as the design system lists them. */
  parts: string;
  page: Component;
}

/** The design system's groups, in the order its page shows them, then its asset groups. */
export const groups = [
  "Actions",
  "Forms",
  "Disclosure",
  "Navigation",
  "Overlays",
  "Feedback",
  "Layout",
  "Assets",
] as const;
export type Group = (typeof groups)[number];

export const catalog: Entry[] = [
  {
    slug: "button",
    name: "Button",
    group: "Actions",
    page: ButtonPage,
    parts: "One level: <Button label variant size icon iconPosition loading loadingText>",
    summary: "A single clickable action, with variants, sizes, an optional icon, and loading and disabled states.",
  },
  {
    slug: "button-group",
    name: "ButtonGroup",
    group: "Actions",
    page: ButtonGroupPage,
    parts: "One level: <ButtonGroup attached orientation> around Buttons",
    summary: "A row or column of related Buttons, either spaced apart or attached into one control.",
  },
  {
    slug: "text-field",
    name: "TextField",
    group: "Forms",
    page: TextFieldPage,
    parts:
      "<TextField label placeholder description errorMessage icon multiline loading>, or: TextField · Label · Input or TextArea · Group · Icon · Description · ErrorMessage",
    summary: "A labelled single-line or multi-line text input with an optional hint and error message.",
  },
  {
    slug: "number-field",
    name: "NumberField",
    group: "Forms",
    page: NumberFieldPage,
    parts:
      "<NumberField label placeholder description errorMessage>, or: NumberField · Label · Group · Input · DecrementTrigger · IncrementTrigger · Description · ErrorMessage",
    summary: "A labelled input for a number, with − and + buttons, limits and steps.",
  },
  {
    slug: "date-picker",
    name: "DatePicker",
    group: "Forms",
    page: DatePickerPage,
    parts:
      "<DatePicker label description errorMessage>, or: DatePicker · Label · Control · Input · Trigger · Portal · Content · Header · PrevTrigger · Heading · NextTrigger · Grid",
    summary: "A labelled date input that people can type into or fill from a calendar that opens below it.",
  },
  {
    slug: "checkbox",
    name: "Checkbox",
    group: "Forms",
    page: CheckboxPage,
    parts:
      "<Checkbox label description errorMessage>, or: Checkbox · Input · Control · Indicator · Label · Description · ErrorMessage",
    summary: "A box a person ticks to turn one option on or off, with a label and optional hint or error.",
  },
  {
    slug: "select",
    name: "Select",
    group: "Forms",
    page: SelectPage,
    parts:
      "<Select options label placeholder description errorMessage>, or: Select · Label · Trigger · Value · Description · ErrorMessage · Portal · Content · Listbox",
    summary:
      "A button that opens a short list, for about 3 to 10 options: open, pick, done. No search; for longer lists use Combobox.",
  },
  {
    slug: "combobox",
    name: "Combobox",
    group: "Forms",
    page: ComboboxPage,
    parts:
      "<Combobox options label placeholder searchPlaceholder description errorMessage emptyText>, or: Combobox · Label · Trigger · Value · Control · Chips · Description · ErrorMessage · Portal · Content · Search · Listbox",
    summary:
      "The search select: a box that opens a list with a search box at the top, for long lists or ones that come from a server. With multiple, it picks several, shown as chips.",
  },
  {
    slug: "filter",
    name: "Filter",
    group: "Forms",
    page: FilterPage,
    parts: "Filter · Trigger · Chips · Portal · Overlay · Content · Header · Section · Option · Range · Footer",
    summary:
      "A Filter button and a side panel with every filterable column at once; Show applies them together, and each active filter becomes a chip.",
  },
  {
    slug: "accordion",
    name: "Accordion",
    group: "Disclosure",
    page: AccordionPage,
    parts: "Accordion · Item · Header · Trigger · Content",
    summary:
      "A stack of headings that each show or hide a section of content, for FAQs, settings groups and long forms.",
  },
  {
    slug: "tabs",
    name: "Tabs",
    group: "Navigation",
    page: TabsPage,
    parts: "Tabs · List · Trigger · Content",
    summary: "A row of labels that switches between views of the same place, showing one panel at a time.",
  },
  {
    slug: "command",
    name: "Command",
    group: "Navigation",
    page: CommandPage,
    parts: "Command · Input · List · Group · Item · Shortcut · Separator · Empty · Dialog",
    summary: "A searchable list of actions, for a command palette or a quick switcher.",
  },
  {
    slug: "pagination",
    name: "Pagination",
    group: "Navigation",
    page: PaginationPage,
    parts: "Pagination · Previous · Items · Item · Ellipsis · Next",
    summary: "Numbered pages with Previous and Next, for moving through a table or a long list a page at a time.",
  },
  {
    slug: "dialog",
    name: "Dialog",
    group: "Overlays",
    page: DialogPage,
    parts: "Dialog · Trigger · Portal · Overlay · Content · Header · Title · Description · Body · Footer · CloseButton",
    summary:
      "A window over the page for a decision or a short form that has to be finished, or cancelled, before going on.",
  },
  {
    slug: "popover",
    name: "Popover",
    group: "Overlays",
    page: PopoverPage,
    parts:
      "Popover · Trigger · Anchor · Portal · Content · Arrow · Header · Title · Description · CloseButton · Footer",
    summary:
      "A small panel that opens next to a button for a quick task, like sharing or filtering, without leaving the page.",
  },
  {
    slug: "tooltip",
    name: "Tooltip",
    group: "Overlays",
    page: TooltipPage,
    parts: "Tooltip · Trigger · Portal · Content · Arrow",
    summary:
      "A short text label that appears when a person hovers or focuses an element, for naming icon buttons and adding a hint.",
  },
  {
    slug: "toast",
    name: "Toast",
    group: "Feedback",
    page: ToastPage,
    parts: "toast() · toast.success · toast.error · toast.loading · toast.promise · toast.dismiss · <Toaster>",
    summary: "A short message in a corner of the screen that confirms something happened, and goes away by itself.",
  },
  {
    slug: "spinner",
    name: "Spinner",
    group: "Feedback",
    page: SpinnerPage,
    parts: "One level: <Spinner size label>",
    summary:
      "A small turning ring that says something is in progress; used inside Button and TextField loading states.",
  },
  {
    slug: "empty-state",
    name: "EmptyState",
    group: "Feedback",
    page: EmptyStatePage,
    parts: "EmptyState · Icon · Title · Description · Actions",
    summary: "A centred message for a list or page that has nothing in it yet, with the action that fills it.",
  },
  {
    slug: "error-state",
    name: "ErrorState",
    group: "Feedback",
    page: ErrorStatePage,
    parts: "ErrorState · Icon · Title · Description · Detail · Actions",
    summary:
      "A centred message for something that failed to load or save, with a reference people can quote and a way to retry.",
  },
  {
    slug: "not-found",
    name: "NotFound",
    group: "Feedback",
    page: NotFoundPage,
    parts: "NotFound · Code · Title · Description · Actions",
    summary: "A centred message for a page or item that doesn't exist, with a large code and a way back.",
  },
  {
    slug: "item",
    name: "Item",
    group: "Layout",
    page: ItemPage,
    parts: "Item · Media · Content · Title · Description · Actions · Header · Footer · Group · Separator",
    summary: "A row of content with media, a title, a description and actions: a person, a file, a setting or a link.",
  },
  {
    slug: "separator",
    name: "Separator",
    group: "Layout",
    page: SeparatorPage,
    parts: "One level: <Separator orientation decorative>",
    summary: "A hairline between groups of content, across or down, or with a word in the middle like “or”.",
  },
  {
    slug: "table",
    name: "Table",
    group: "Layout",
    page: TablePage,
    parts:
      "<Table data columns rowKey pageSize selectable onRowClick rowHref manual …>, or by hand: Table · Box · TopBar · Title · Description · Actions · Toolbar · SelectionBar · Caption · Header · Body · Footer · Row · Head · Cell · Empty · BottomBar · PageSize · Range",
    summary:
      "Rows of data with headings. Give it data and columns and it builds the box: a title and actions, search and Filter, sortable headings, selection, then the range and Pagination at the foot.",
  },
  {
    slug: "icons",
    name: "Icons",
    group: "Assets",
    page: IconsPage,
    parts: '25 icons · import { PlusIcon } from "yosegi" · <PlusIcon width height />',
    summary:
      "Yosegi's outline icons: a 16px grid, a 1.5px stroke and currentColor, so each follows the text around it.",
  },
];

/** Where the playground lives, and where one entry's page is. */
export const playgroundPath = (slug?: string) => (slug ? `/playground/${slug}` : "/playground");

export const findEntry = (slug: string | undefined) => catalog.find((entry) => entry.slug === slug);
