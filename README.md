# yosegi

Yosegi is my personal design system for SolidJS applications.

The name comes from yosegi-zaiku, a Japanese woodcraft where many small pieces of wood are fitted together into one pattern. That’s the idea here too: small, consistent components that fit together into one interface.

There are already plenty of great design systems out there. I built this one anyway, to learn how they really work and to have something that fits exactly how I build apps.

## Development

This repo is a [pnpm workspace](https://pnpm.io/workspaces) built on SolidJS 2.

- `packages/ui` is the component library (`@yosegi/ui`).
- `apps/playground` is a Vite app for trying components out locally.

```sh
pnpm install
pnpm dev        # start the playground
pnpm typecheck  # typecheck every package
pnpm build      # build every package
```

Shared dependency versions live in the `catalog` in `pnpm-workspace.yaml`.
