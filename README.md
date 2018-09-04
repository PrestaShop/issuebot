# Issue Bot

> A GitHub App built with [Probot](https://probot.github.io) to automate PrestaShop project workflow

## Setup

```sh
# Install dependencies
npm install

# Run the bot
npm start
```

## Development environment

See Probot doc [for local development](https://probot.github.io/docs/development/) and
[simulating github webhooks](https://probot.github.io/docs/simulating-webhooks/)

## Test

Incoming

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
