import { createRouter } from "@solidjs/router";
import { Docs } from "./pages/docs";
import { Home } from "./pages/home";
import { NotFound } from "./pages/not-found";

export const Router = createRouter({
  routes: [
    { path: "/", component: Home },
    { path: "/docs", component: Docs },
    { path: "*404", component: NotFound },
  ],
});

export const { paths } = Router;
