import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { createSignal, onCleanup } from "solid-js";
import { Combobox, type ComboboxOption } from "yosegi-solid";
import { type Customer, cities, customers, startingTags, world } from "../ui/cities";

const meta = {
  title: "Forms/Combobox",
  component: Combobox,
  parameters: {
    stage: "field",
    docs: {
      description: {
        component:
          "The search select: a box that opens a list with a search box at the top, for long lists or ones that come from a server. With multiple, it picks several, shown as chips.",
      },
    },
  },
  args: {
    label: "City",
    options: cities,
    placeholder: "Choose a city",
    searchPlaceholder: "Search cities…",
    description: "Search 2,400 cities.",
    disabled: false,
    readOnly: false,
  },
  argTypes: {
    label: { control: "text" },
    description: { control: "text" },
    errorMessage: { control: "text" },
    options: { control: "object" },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Every prop on a control. */
export const Playground: Story = {};

/** Opening it puts focus in the search box. Lisbon can't be picked. */
export const OneOption: Story = {
  name: "One option",
  render: () => (
    <Combobox
      label="City"
      options={cities}
      placeholder="Choose a city"
      searchPlaceholder="Search cities…"
      description="Search 2,400 cities."
    />
  ),
};

/** Controlled: the value lives in the page. */
export const Chosen: Story = {
  render: () => {
    const [city, setCity] = createSignal<string | null>(null);
    return (
      <>
        <Combobox label="City" placeholder="Choose a city" options={cities} value={city()} onChange={setCity} />
        <p>
          Chosen: <code>{city() ?? "nothing"}</code>
        </p>
      </>
    );
  },
};

/** multiple: rows get checkboxes and the list stays open after each pick. */
export const Tags: Story = {
  render: () => {
    const [tags, setTags] = createSignal(["design", "research"]);
    return (
      <Combobox
        multiple
        label="Tags"
        options={startingTags}
        value={tags()}
        onChange={setTags}
        placeholder="Add tags"
        searchPlaceholder="Search tags…"
        description="Pick as many as fit the note."
      />
    );
  },
};

/** As many chips as fit, then a +N counter that opens the rest. The box never grows. */
export const ManyChosen: Story = {
  name: "Many chosen",
  render: () => {
    const [tags, setTags] = createSignal(["design", "research", "writing", "urgent", "client", "internal"]);
    return (
      <Combobox
        multiple
        label="Tags"
        options={startingTags}
        value={tags()}
        onChange={setTags}
        placeholder="Add tags"
        searchPlaceholder="Search tags…"
        style={{ width: "300px", "max-width": "100%" }}
      />
    );
  },
};

/** max={3}: once reached, the other rows are unavailable and the foot says so. */
export const Limit: Story = {
  render: () => {
    const [tags, setTags] = createSignal(["design", "urgent", "client"]);
    return (
      <Combobox
        multiple
        max={3}
        label="Tags"
        options={startingTags}
        value={tags()}
        onChange={setTags}
        placeholder="Add tags"
        searchPlaceholder="Search tags…"
        description="Up to 3 tags."
      />
    );
  },
};

/** onCreate adds a “Create …” row when nothing matches exactly. Try “roadmap”. */
export const Create: Story = {
  render: () => {
    const [options, setOptions] = createSignal(startingTags);
    const [tags, setTags] = createSignal<string[]>([]);
    return (
      <Combobox
        multiple
        label="Tags"
        options={options()}
        value={tags()}
        onChange={setTags}
        onCreate={(query) => {
          const value = query.toLowerCase();
          setOptions((list) => [...list, { value, label: value }]);
          setTags((list) => [...list, value]);
        }}
        placeholder="Add tags"
        searchPlaceholder="Search tags…"
        description="Pick a tag, or make a new one."
      />
    );
  },
};

/**
 * Recent picks and the hint before searching; “Type 2 or more letters”; skeleton rows, then results;
 * a spinner when searching again; Try again after a failure.
 */
export const SearchingOnAServer: Story = {
  name: "Searching on a server",
  render: () => {
    const recent: ComboboxOption[] = [
      { value: "lisbon-pt", label: "Lisbon", group: "Recent" },
      { value: "oslo", label: "Oslo", group: "Recent" },
    ];
    const [results, setResults] = createSignal<ComboboxOption[]>(recent);
    const [searching, setSearching] = createSignal(false);
    const [failed, setFailed] = createSignal(false);
    const [failNext, setFailNext] = createSignal(false);
    let lastQuery = "";
    let ticket = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    onCleanup(() => clearTimeout(timer));

    const search = (query: string) => {
      lastQuery = query;
      clearTimeout(timer);
      const q = query.trim().toLowerCase();
      if (!q) {
        setSearching(false);
        setFailed(false);
        setResults(recent);
        return;
      }
      // A fresh search shows skeleton rows; searching again keeps the old results.
      if (results() === recent) setResults([]);
      // Wait for typing to pause, then “fetch”. Answers to old queries are dropped.
      const mine = ++ticket;
      timer = setTimeout(() => {
        setSearching(true);
        setFailed(false);
        setTimeout(() => {
          if (mine !== ticket) return;
          setSearching(false);
          if (failNext()) {
            setFailNext(false);
            setFailed(true);
            return;
          }
          setResults(world.filter((city) => city.label.toLowerCase().includes(q)));
        }, 900);
      }, 200);
    };

    return (
      <>
        <Combobox
          options={results()}
          onInputChange={search}
          minQueryLength={2}
          loading={searching()}
          loadingText="Loading cities…"
          error={failed()}
          errorText="Couldn’t load cities."
          onRetry={() => search(lastQuery)}
          hint="Type to search 2,400 cities."
          label="City"
          placeholder="Choose a city"
          description="Searches as you type, after two letters."
          emptyText={(query) => (
            <>
              <strong>No city matches “{query}”.</strong>
              <span>Check the spelling, or try another name.</span>
            </>
          )}
        />
        <label style={{ display: "flex", gap: "8px", "align-items": "center", font: "var(--yosegi-text-small)" }}>
          <input type="checkbox" checked={failNext()} onChange={(event) => setFailNext(event.currentTarget.checked)} />
          Make the next search fail
        </label>
      </>
    );
  },
};

/** renderOption draws each row; yosegi-combobox-item-detail sits on the right. */
export const YourOwnRows: Story = {
  name: "Your own rows",
  render: () => (
    <Combobox
      label="City"
      options={cities}
      placeholder="Choose a city"
      renderOption={(option) => (
        <>
          {option.label}
          <span class="yosegi-combobox-item-detail">{option.value}</span>
        </>
      )}
    />
  ),
};

/**
 * options are { id, name, country, closed }: getOptionValue, getOptionLabel, getOptionGroup and getOptionDisabled
 * read them. onChange gets the id and the object.
 */
export const YourOwnObjects: Story = {
  name: "Your own objects",
  render: () => {
    const [customer, setCustomer] = createSignal<Customer | null>(null);
    return (
      <>
        <Combobox
          label="Customer"
          placeholder="Choose a customer"
          options={customers}
          getOptionValue={(c) => c.id}
          getOptionLabel={(c) => c.name}
          getOptionGroup={(c) => c.country}
          getOptionDisabled={(c) => !!c.closed}
          renderOption={(c) => (
            <>
              {c.name}
              <span class="yosegi-combobox-item-detail">{c.id}</span>
            </>
          )}
          onChange={(_, picked) => setCustomer(picked)}
        />
        <p>
          Chosen: <code>{customer() ? JSON.stringify(customer()) : "nothing"}</code>
        </p>
      </>
    );
  },
};

export const Invalid: Story = {
  render: () => (
    <Combobox
      label="Home city"
      options={cities}
      placeholder="Choose a city"
      description="Where you live."
      errorMessage="Choose your home city."
    />
  ),
};

/** Read-only: a muted box, no chevron, no remove buttons. */
export const DisabledAndReadOnly: Story = {
  name: "Disabled and read-only",
  render: () => (
    <>
      <Combobox label="City" options={cities} defaultValue="baku" disabled />
      <Combobox label="City" options={cities} defaultValue="kyoto" readOnly />
    </>
  ),
};
