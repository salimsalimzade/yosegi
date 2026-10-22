import { Button } from "@yosegi/ui";
import { createSignal } from "solid-js";

export function App() {
  const [count, setCount] = createSignal(0);

  return (
    <main>
      <h1>Yosegi Playground</h1>
      <Button onClick={() => setCount((c) => c + 1)}>Clicked {count()} times</Button>
    </main>
  );
}
