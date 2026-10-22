# yosegi

Yosegi is my personal design system for SolidJS applications.

The name comes from yosegi-zaiku, a Japanese woodcraft where many small pieces of wood are fitted together into one pattern. That’s the idea here too: small, consistent components that fit together into one interface.

There are already plenty of great design systems out there. I built this one anyway, to learn how they really work and to have something that fits exactly how I build apps.

## Structure

This repo is a pnpm workspace built on SolidJS 2.

- `packages/ui`: the component library, published to npm as `yosegi`
- `apps/docs`: the documentation site
- `apps/playground`: a sandbox for building components
- `apps/web`: the web app

Apps use `yosegi` through `workspace:*`, so they compile the library's source directly. `pnpm publish` swaps in the `publishConfig.exports` that point at `dist/`.

## Releasing

Run `pnpm changeset` to describe any change to `yosegi` and commit the file it creates. The Release workflow is paused for now, so nothing is published. Once it's turned on, while there are changesets on `main` it keeps a "version packages" pull request open. Merging it bumps the version, updates `CHANGELOG.md` and publishes to npm using trusted publishing.

## Deploying

The Deploy workflow builds each app and deploys it to its own Cloudflare Pages project. It's paused for now and only runs when started by hand from the Actions tab. Once Cloudflare is set up, it will deploy pushes to `main` to production and give pull requests preview URLs.

| App | Pages project |
| --- | --- |
| `apps/web` | `yosegi-web` |
| `apps/playground` | `yosegi-playground` |
| `apps/docs` | `yosegi-docs` |

It needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets. Subdomains are set as custom domains on each Pages project.
