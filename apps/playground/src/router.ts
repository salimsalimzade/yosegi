import { createRouter } from "@solidjs/router";
import { Shell } from "./layout/shell";
import { ComponentPage } from "./pages/component-page";
import { Home } from "./pages/home";
import { NotFound } from "./pages/not-found";
import { Overview } from "./pages/overview";

export const Router = createRouter({
  routes: [
    { path: "/", component: Home },
    {
      path: "/playground",
      component: Shell,
      children: [
        { path: "/", component: Overview },
        { path: "/:slug", component: ComponentPage },
      ],
    },
    { path: "*404", component: NotFound },
  ],
});

export const { paths } = Router;
