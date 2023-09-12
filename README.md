# toggl-project-bot
Bot to create new Toggl projects every month

![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/mackenly/toggl-project-bot/tests.yml?branch=main)

## Setup
Configure `wrangler.example.toml` with your correct values. You may need to find some of the Toggl API IDs manually by making requests to the Toggl API (I'd suggest using Postman). Once done, rename `wrangler.example.toml` to `wrangler.toml`.

Important note, the `PREMIUM_TOGGL` environment variable enables or disables certain features not available to free Toggl accounts. If you have a free Toggl account, set this to `false`. If you have a premium Toggl account, set this to `true`.

## Running
To run locally run `npm start`. To deploy to Cloudflare run `npm deploy`. You may want to uncomment the fetch listener within the worker if you've made changes to the worker and want to test them without waiting for the scheduled run.

## Testing
This project uses vitest for testing. To run tests run `npm test`.

## Contributing
Feel free to open a PR or issue if you have any suggestions or find any bugs.

If you'd like to support this project, please consider sponsoring me on [GitHub](https://github.com/sponsors/mackenly).