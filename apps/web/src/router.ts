import { createRouter } from "@solidjs/router";
import { lazy } from "solid-js";
import { Examples } from "./pages/examples";
import { Home } from "./pages/home";

export const Router = createRouter({
  routes: [
    { path: "/", component: Home },
    { path: "/examples", component: Examples },
    // The examples load on their own, so the front page stays small.
    {
      path: "/examples/dashboard",
      component: lazy(() => import("./pages/dashboard").then((m) => ({ default: m.Dashboard }))),
    },
    {
      path: "/examples/job-application",
      component: lazy(() => import("./pages/job-application").then((m) => ({ default: m.JobApplication }))),
    },
  ],
});

export const { paths } = Router;
