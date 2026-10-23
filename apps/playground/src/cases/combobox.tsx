import { createSignal, onCleanup } from "solid-js";
import {
  Combobox,
  type ComboboxOption,
  type ComboboxSingleProps,
} from "yosegi";
import { Case, Cases } from "../ui/case";

const cities: ComboboxOption[] = [
  ["kyoto", "Kyoto", "Asia"],
  ["osaka", "Osaka", "Asia"],
  ["tokyo", "Tokyo", "Asia"],
  ["seoul", "Seoul", "Asia"],
  ["baku", "Baku", "Asia"],
  ["tbilisi", "Tbilisi", "Asia"],
  ["amsterdam", "Amsterdam", "Europe"],
  ["berlin", "Berlin", "Europe"],
  ["istanbul", "Istanbul", "Europe"],
  ["kyiv", "Kyiv", "Europe"],
  ["lisbon", "Lisbon", "Europe"],
  ["london", "London", "Europe"],
  ["paris", "Paris", "Europe"],
  ["cairo", "Cairo", "Africa"],
  ["nairobi", "Nairobi", "Africa"],
  ["buenos-aires", "Buenos Aires", "Americas"],
  ["mexico-city", "Mexico City", "Americas"],
].map(([value, label, group]) => ({
  value,
  label,
  group,
  disabled: value === "lisbon",
}));

/** Your own objects: the API's shape, not { value, label }. */
interface Customer {
  id: string;
  name: string;
  country: string;
  closed?: boolean;
}

const customers: Customer[] = [
  { id: "c-101", name: "Aiko Tanaka", country: "Japan" },
  { id: "c-102", name: "Kenji Mori", country: "Japan", closed: true },
  { id: "c-201", name: "Lena Fischer", country: "Germany" },
  { id: "c-202", name: "Jonas Weber", country: "Germany" },
  { id: "c-301", name: "Nia Okafor", country: "Nigeria" },
];

const tagNames = [
  "design",
  "research",
  "writing",
  "urgent",
  "client",
  "internal",
  "q4",
  "travel",
  "finance",
  "hiring",
  "ops",
  "later",
];
const startingTags: ComboboxOption[] = tagNames.map((tag) => ({
  value: tag,
  label: tag,
}));

// A pretend server: 2,400 cities would be too many to send, so it searches.
const world = [
  "Aarhus",
  "Abuja",
  "Accra",
  "Adelaide",
  "Almaty",
  "Amman",
  "Ankara",
  "Antwerp",
  "Athens",
  "Auckland",
  "Baghdad",
  "Bangkok",
  "Barcelona",
  "Basel",
  "Beirut",
  "Belgrade",
  "Bergen",
  "Bogotá",
  "Bordeaux",
  "Boston",
  "Brisbane",
  "Brussels",
  "Bucharest",
  "Budapest",
  "Calgary",
  "Cape Town",
  "Chicago",
  "Copenhagen",
  "Dakar",
  "Delhi",
  "Denver",
  "Doha",
  "Dubai",
  "Dublin",
  "Edinburgh",
  "Florence",
  "Geneva",
  "Ghent",
  "Glasgow",
  "Hamburg",
  "Hanoi",
  "Helsinki",
  "Kraków",
  "Lagos",
  "Lima",
  "Lyon",
  "Madrid",
  "Manila",
  "Marseille",
  "Melbourne",
  "Milan",
  "Montréal",
  "Mumbai",
  "Munich",
  "Naples",
  "Oslo",
  "Porto",
  "Prague",
  "Quito",
  "Riga",
  "Rome",
  "Santiago",
  "Seville",
  "Sydney",
  "Tallinn",
  "Toronto",
  "Valencia",
  "Vienna",
  "Vilnius",
  "Warsaw",
  "Zagreb",
  "Zürich",
].map((name) => ({ value: name.toLowerCase(), label: name }));

/** A city, searched in the panel. */
function Box(props: Partial<ComboboxSingleProps>) {
  return (
    <Combobox
      options={cities}
      placeholder="Choose a city"
      searchPlaceholder="Search cities…"
      {...props}
    />
  );
}

function Tags(props: {
  value?: string[];
  max?: number;
  create?: boolean;
  label?: string;
  description?: string;
}) {
  const [options, setOptions] = createSignal(startingTags);
  const [chosen, setChosen] = createSignal(props.value ?? []);
  return (
    <Combobox
      multiple
      style={{ width: "300px", "max-width": "100%" }}
      max={props.max}
      options={options()}
      value={chosen()}
      onChange={setChosen}
      onCreate={
        props.create
          ? (query) => {
              const value = query.toLowerCase();
              setOptions((list) => [...list, { value, label: value }]);
              setChosen((list) => [...list, value]);
            }
          : undefined
      }
      label={props.label ?? "Tags"}
      placeholder="Add tags"
      searchPlaceholder="Search tags…"
      description={props.description}
    />
  );
}

/** Searching on a pretend server: recent picks before searching, a minimum length, loading, and a failure every so often. */
function ServerSearch() {
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
        setResults(
          world.filter((city) => city.label.toLowerCase().includes(q)),
        );
      }, 900);
    }, 200);
  };

  return (
    <div style={{ display: "grid", gap: "12px" }}>
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
      <label
        style={{
          display: "flex",
          gap: "8px",
          "align-items": "center",
          font: "var(--yosegi-text-small)",
        }}
      >
        <input
          type="checkbox"
          checked={failNext()}
          onChange={(event) => setFailNext(event.currentTarget.checked)}
        />
        Make the next search fail
      </label>
    </div>
  );
}

export function ComboboxPage() {
  const [city, setCity] = createSignal<string | null>(null);
  const [customer, setCustomer] = createSignal<Customer | null>(null);

  return (
    <Cases>
      <Case
        title="One option"
        description="Opening it puts focus in the search box. Lisbon can't be picked."
        layout="stack"
      >
        <Box label="City" description="Search 2,400 cities." />
      </Case>
      <Case
        title="Chosen"
        description="Controlled: the value lives in the page."
        layout="stack"
      >
        <Combobox
          label="City"
          placeholder="Choose a city"
          options={cities}
          value={city()}
          onChange={setCity}
        />
        <p>
          Chosen: <code>{city() ?? "nothing"}</code>
        </p>
      </Case>
      <Case
        title="Tags"
        description="multiple: rows get checkboxes and the list stays open after each pick."
        layout="stack"
      >
        <Tags
          value={["design", "research"]}
          description="Pick as many as fit the note."
        />
      </Case>
      <Case
        title="Many chosen"
        description="As many chips as fit, then a +N counter that opens the rest. The box never grows."
        layout="stack"
      >
        <Tags
          value={[
            "design",
            "research",
            "writing",
            "urgent",
            "client",
            "internal",
          ]}
        />
      </Case>
      <Case
        title="Limit"
        description="max={3}: once reached, the other rows are unavailable and the foot says so."
        layout="stack"
      >
        <Tags
          value={["design", "urgent", "client"]}
          max={3}
          description="Up to 3 tags."
        />
      </Case>
      <Case
        title="Create"
        description="onCreate adds a “Create …” row when nothing matches exactly. Try “roadmap”."
        layout="stack"
      >
        <Tags create description="Pick a tag, or make a new one." />
      </Case>
      <Case
        title="Searching on a server"
        description="Recent picks and the hint before searching; “Type 2 or more letters”; skeleton rows, then results; a spinner when searching again; Try again after a failure."
        layout="stack"
      >
        <ServerSearch />
      </Case>
      <Case
        title="Your own rows"
        description="renderOption draws each row; yosegi-combobox-item-detail sits on the right."
        layout="stack"
      >
        <Box
          label="City"
          renderOption={(option) => (
            <>
              {option.label}
              <span class="yosegi-combobox-item-detail">{option.value}</span>
            </>
          )}
        />
      </Case>
      <Case
        title="Your own objects"
        description="options are { id, name, country, closed }: getOptionValue, getOptionLabel, getOptionGroup and getOptionDisabled read them. onChange gets the id and the object."
        layout="stack"
      >
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
          Chosen:{" "}
          <code>{customer() ? JSON.stringify(customer()) : "nothing"}</code>
        </p>
      </Case>
      <Case title="Invalid" layout="stack">
        <Box
          label="Home city"
          description="Where you live."
          errorMessage="Choose your home city."
        />
      </Case>
      <Case
        title="Disabled and read-only"
        description="Read-only: a muted box, no chevron, no remove buttons."
        layout="stack"
      >
        <Box label="City" defaultValue="baku" disabled />
        <Box label="City" defaultValue="kyoto" readOnly />
      </Case>
    </Cases>
  );
}
