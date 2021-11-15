# JSON driven STX NFT bot

Report marketplace actions (listings, purchases, and offers) for some [Blockstack](https://www.stacks.co/) NFT collection to Discord/Twitter.

## Media
[View sample tweet](https://twitter.com/MegapontApeBot/status/1459968934858432512)

![Sample Discord embed](https://user-images.githubusercontent.com/31711053/141709717-1f9ccb2d-46bb-41da-a7c5-c24afbf3bed1.png)

## Description

This program will periodically query the [Stacks Blockchain API](https://hirosystems.github.io/stacks-blockchain-api/) to fetch NFT events for user defined NFT collections across user defined Marketplace contracts.

## Getting Started

You will want to create a new repo using this project as a template.

### Dependencies

- If you want to report events to Twitter, you will need a [Twitter Developer Account](https://developer.twitter.com/en/docs/twitter-api/getting-started/getting-access-to-the-twitter-api) along with relevant API credentials.
- If you want to report events to Discord, you will need a [Discord Bot Account](https://docs.discord.red/en/stable/bot_application_guide.html) along with the bot token.

It may be a good idea to have at least two sets of Twitter/Discord API credentials, for local development and production deployments.

### Installing

- Create a new `.env` file in the root directory, following the template outlined in `.env.template`

### Executing program

- To run locally, use `npm run start:dev`. This will use [nodemon](https://nodemon.io/) to enable automatic reloading.
- To run in a production environment, use `npm start`

The program will start listening for new NFT events starting at the current block height.

For local development, you may want to start listening at an earlier block so that you dont have to wait for new events.

You can do this by specifying the `INITIAL_BLOCKHEIGHT` environment variable. Take care that you are NOT setting this variable in any production deployment, and that you do not set it too far off from the current blockheight, otherwise the app will be overloaded with hundreds of events. 

## Using JSON configurations

There are two key files used for configuring the behavior of this app:

- [collections.json](./data/collections.json)
  - This file contains configurations for the different NFT collections you are interested in tracking. A configiguration here is used to specify the NFT contract address and name, templates for formatting Twitter and Discord messages, and instructions on where to fetch metadata and images.
- [marketplaces.json](./data/marketplaces.json)
  - This file contains configurations for the different marketplace contracts to scan for events. A configuration here specifies how to parse a Blockstack transaction to extract necessary variables (collection contract, NFT ID, STX amount) for a given market action.

Sample configurations have been provided for a few existing STX collections and marketplaces which should help you in creating any new configuration.

Configurations use [eval](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/eval) and [mustache.js](https://github.com/janl/mustache.js/) for evaluating and rendering templates.

A breakdown of the file contents can be found at [collection.ts](./src/model/collection.ts) and [marketplace.ts](./src/model/marketplace.ts)

Values which are rendered with `Mustache` will be marked with `(mustache)`, and values which are evaluated with `eval` will be marked with `(eval)`

NOTE - `eval` expects a valid JS expression, so string values must be wrapped in `'`single quotes`'` and the newline character must have an escaped backslash: `\\n`

## Mustache templating

It may be worthwhile to first familiarize yourself with the [mustache.js](https://github.com/janl/mustache.js/) documents.

The view which is passed to all `Mustache` renders can be found at [nft.ts](./src/model/nft.ts), and any of these variables can be referenced in the templates.

## Deploying

This is just a simple nodeJS app, so you should be able to deploy it anywhere you wish. Heroku is a good platform if you are just getting started, as you can [deploy straight from a git repo](https://devcenter.heroku.com/articles/git).

(note: if using Heroku, make sure to use a Worker dyno, not a Web dyno)

## License

This project is licensed under the GNU GENERAL PUBLIC LICENSE - see the [LICENSE](./LICENSE) file for details