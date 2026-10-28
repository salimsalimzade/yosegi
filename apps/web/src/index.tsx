import "yosegi-solid/styles.css";
import "./app.css";
import { render } from "@solidjs/web";
import { Loading } from "solid-js";
import { Router } from "./router";

// The examples load lazily: the boundary lets the page mount while their code arrives.
render(
  () => (
    <Loading>
      <Router />
    </Loading>
  ),
  document.getElementById("root")!,
);
