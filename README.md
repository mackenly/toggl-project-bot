# toggl-project-bot
Bot to create new Toggl projects every month

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/mackenly/toggl-project-bot/tests.yml?branch=main)

## Setup
Configure `wrangler.example.toml` with your correct values. You may need to find some of the Toggl API IDs manually by making requests to the Toggl API (I'd suggest using Postman). Once done, rename `wrangler.example.toml` to `wrangler.toml`.

Now set `TOGGL_AUTH` secret using the [Worker dashboard or Wrangler](https://developers.cloudflare.com/workers/configuration/secrets/). The secret should be your email and password in the format `email:password`.

Important note, the `PREMIUM_TOGGL` environment variable enables or disables certain features not available to free Toggl accounts. If you have a free Toggl account, set this to `false`. If you have a premium Toggl account, set this to `true`.

## Running
To run locally run `npm start`. To deploy to Cloudflare run `npm deploy`. To test, use Wrangler's `--test-scheduled` flag on `wrangler dev --test-scheduled`. This will allow you to simulate CRON runs without waiting a month.

## Testing
This project uses vitest for testing. To run tests run `npm test`.

## Contributing
Have any suggestions or found any bugs? Open a PR or issue on [mackenly/toggl-project-bot](https://github.com/mackenly/toggl-project-bot/issues).

If you'd like to support this project, please consider sponsoring me on [GitHub](https://github.com/sponsors/mackenly).