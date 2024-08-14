# Toggl Project Bot Automation
CRON bot to create new Toggl projects every month using a Cloudflare Worker.

![GitHub CI Workflow Status](https://img.shields.io/github/actions/workflow/status/mackenly/toggl-project-bot/ci.yml?branch=main&label=CI)
![GitHub CD Workflow Status](https://img.shields.io/github/actions/workflow/status/mackenly/toggl-project-bot/cd.yml?branch=main&label=CD)
![GitHub Release](https://img.shields.io/github/v/release/mackenly/toggl-project-bot?label=Latest%20Release)
![GitHub License](https://img.shields.io/github/license/mackenly/toggl-project-bot?label=License)
![GitHub Sponsors](https://img.shields.io/github/sponsors/mackenly?label=Sponsor)


## Setup
Configure `wrangler.toml` with your correct values. You may need to find some of the Toggl API IDs manually by making requests to the Toggl API (I'd suggest using Postman) or seeing them in the Toggl web app's URLs.

> [!IMPORTANT]
> For the GitHub Action CD to work, you have to include your `wrangler.toml` in the repository. This is because the GitHub Action uses the `wrangler.toml` to deploy the Worker to Cloudflare. The IDs used in the `wrangler.toml` could potentially be used for malicious purposes, so you might want to not include them publicly depending on your use case.

Now set `TOGGL_AUTH` secret using the [Worker dashboard or Wrangler](https://developers.cloudflare.com/workers/configuration/secrets/). The secret should be your email and password in the format `email:password`.

Important note, the `PREMIUM_TOGGL` environment variable enables or disables certain features not available to free Toggl accounts. If you have a free Toggl account, set this to `false`. If you have a premium Toggl account, set this to `true`.

## Deploying
### Manual
After completing the setup, run `npm deploy` to deploy the Worker to Cloudflare and follow the instructions in the terminal.

### GitHub Actions (Recommended)
This project is set up to deploy automatically to Cloudflare using GitHub Actions. To set this up, follow these steps:
1. Create a repository secret called `CLOUDFLARE_API_TOKEN` with a profile token [using the 'Edit Cloudflare Workers' permission template](https://dash.cloudflare.com/profile/api-tokens).
2. Create a repository secret called `CLOUDFLARE_ACCOUNT_ID` with your Cloudflare account ID [found in the Workers dashboard](https://dash.cloudflare.com/?to=/:account/workers-and-pages).
3. Commit changes to the `main` branch and watch the magic happen! 🪄

## Running / Testing
To run locally run `npm start`. To deploy to Cloudflare run `npm deploy`. To test, use Wrangler's `--test-scheduled` flag on `wrangler dev --test-scheduled`. This will allow you to simulate CRON runs without waiting a month.

This project uses vitest for testing. To run tests run `npm test`.

## Contributing
Have any suggestions or found any bugs? Open a PR or issue on [mackenly/toggl-project-bot](https://github.com/mackenly/toggl-project-bot/issues).

If you'd like to support this project, please consider sponsoring me on [GitHub](https://github.com/sponsors/mackenly).