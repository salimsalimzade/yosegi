import { createRouter } from "@solidjs/router";
import { lazy } from "solid-js";
import { Examples } from "./pages/examples";
import { Home } from "./pages/home";

export const Router = createRouter({
  routes: [
    { path: "/", component: Home },
    { path: "/examples", component: Examples },
    // The example loads on its own, so the front page stays small.
    {
      path: "/examples/dashboard",
      component: lazy(() => import("./pages/dashboard").then((m) => ({ default: m.Dashboard }))),
    },
  ],
});

export const { paths } = Router;
