import { createRouter } from "@solidjs/router";
import { Examples } from "./pages/examples";
import { Home } from "./pages/home";

export const Router = createRouter({
  routes: [
    { path: "/", component: Home },
    { path: "/examples", component: Examples },
  ],
});

export const { paths } = Router;
