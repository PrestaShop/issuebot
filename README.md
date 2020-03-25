# Issue Bot

> A GitHub App built with [Probot](https://probot.github.io) to automate PrestaShop project workflow

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

If you want to use multiple node versions on your development environment, consider using NVM

[See NVM installation guide](https://github.com/nvm-sh/nvm#install-script)

```shell script
nvm install 12.16.0

nvm use 12.16.0

node --version #will output v12.16.0
```

## Development environment

See Probot doc [for local development](https://probot.github.io/docs/development/) and
[simulating github webhooks](https://probot.github.io/docs/simulating-webhooks/)

## Test

```
npm run test
```

## Deployment

See [Probot doc](https://probot.github.io/docs/deployment/)

## Insights

The entry point is file `index.js`.
In this file, upon receiving a webhook, the bot performs 3 steps:
1) setup the app, setup javascript components
2) analyze incoming github webhook to find whether this matches one of the registered Rules
```
let rulePromise = ruleComputer.findRule(context);
```
3) if the analysis is successfull, apply the rule
```
ruleApplier.applyRule(rule, context);
```

The idea behind is to define a set of Rules for PrestaShop
project workflow and the bot applies them.

Rules are described in `src/rule.js` file.

A config file have been introduced to setup your repositories


