import { createRouter } from "@solidjs/router";
import { Home } from "./pages/home";

export const Router = createRouter({
  routes: [{ path: "/", component: Home }],
});

export const { paths } = Router;
