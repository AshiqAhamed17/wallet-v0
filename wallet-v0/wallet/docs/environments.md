# Environments

We have several environments where the app can be deployed:

| Env        | URL                                            | Purpose                              | How it's deployed                                 |
| ---------- | ---------------------------------------------- | ------------------------------------ | ------------------------------------------------- |
| local      | http://localhost:3000/                         | local development                    | `yarn start`                                      |
| staging    | https://eternalsafe.vercel.app/                | preview of features before a release | on push to the `eternal-safe` branch              |
| production | eternalsafe.eth (https://eternalsafe.eth.limo) | live app on IFPS                     | see the [Release Procedure](release-procedure.md) |

## Lifecycle of a feature

Any feature which is in the issue list will be developed as follows:

### Development & QA

1. Developer starts working on the feature
2. Developer creates a Pull Request and assigns a reviewer
3. Reviewer leaves feedback until the PR is approved
4. QA engineer starts testing the branch on a deployed site
5. Once QA gives a green light, the branch is merged to the `eternal-safe` branch

### Release

1. All merged branches sit on `eternal-safe`, which is occasionally reviewed on the [staging site](https://eternalsafe.vercel.app).
2. In case some regression is noticed, it's fixed.
3. Once a sufficient amount of features are ready for a release and final testing has been done, a release tag is made (normally from the HEAD of `eternal-safe`).
4. The code is deployed automatically to IPFS using the [GitHub workflow](../.github/workflows/deploy.yml)
5. A new version subdomain is created on eternalsafe.eth e.g. v2.eternalsafe.eth and the root domain is updated to point to the latest version.
