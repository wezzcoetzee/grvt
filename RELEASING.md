# Releasing

This document describes how to release new versions of the GRVT TypeScript SDK.

## Prerequisites

- Maintainer access to the repository
- [Deno](https://deno.land/) installed locally
- Repository secrets configured:
  - `NPM_TOKEN` for npm publishing
  - JSR uses OIDC (no token needed)

## Pre-Release Checklist

Before creating a release, ensure all checks pass locally:

```bash
# Format check
deno fmt --check

# Lint
deno lint

# Type check
deno check --doc

# Run tests
deno test -A
```

## Version Bump

Update the version in `deno.json`:

```json
{
  "version": "X.Y.Z"
}
```

Commit the version bump:

```bash
git add deno.json
git commit -m "chore: bump version to X.Y.Z"
git push
```

## Creating a Release

1. Go to [GitHub Releases](../../releases/new)
2. Click **"Choose a tag"** and create a new tag matching your version (e.g., `v0.1.0`)
3. Set the release title (e.g., `v0.1.0`)
4. Write release notes describing changes
5. For pre-releases, check **"Set as a pre-release"**
6. Click **"Publish release"**

This triggers the publish workflows automatically:

- **JSR**: Publishes to `jsr:@wezzcoetzee/grvt`
- **npm**: Builds and publishes to `@wezzcoetzee/grvt`

## Version Naming Conventions

| Version Format  | npm Tag      | Example         |
| --------------- | ------------ | --------------- |
| `X.Y.Z`         | `latest`     | `1.0.0`         |
| `X.Y.Z-alpha.N` | `alpha`      | `1.0.0-alpha.1` |
| `X.Y.Z-beta.N`  | `beta`       | `1.0.0-beta.1`  |
| `X.Y.Z-rc.N`    | `rc`         | `1.0.0-rc.1`    |
| `X.Y.Z-other`   | `prerelease` | `1.0.0-dev.1`   |

## Post-Release Verification

After the workflows complete, verify the packages are published:

```bash
# Check JSR
deno info jsr:@wezzcoetzee/grvt@X.Y.Z

# Check npm
npm view @wezzcoetzee/grvt@X.Y.Z
```

## Manual Publishing

Both workflows support `workflow_dispatch` for manual triggering from the Actions tab. Use this if automatic publishing
fails and you need to retry.
