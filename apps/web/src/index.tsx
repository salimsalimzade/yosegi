import "yosegi/styles.css";
import "./app.css";
import { render } from "@solidjs/web";
import { Router } from "./router";

render(() => <Router />, document.getElementById("root")!);
