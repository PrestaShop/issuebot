/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const RuleComputer = require('./src/rule-computer');
const IssueDataProvider = require('./src/issue-data-provider');
const IssueCommentsDataProvider = require('./src/issue-comments-data-provider');
const PullRequestDataProvider = require('./src/pull-request-data-provider');
const ProjectCardDataProvider = require('./src/project-card-data-provider');
const ConfigProvider = require('./src/config-provider');
const ProjectDataProvider = require('./src/project-data-provider');
const RuleApplier = require('./src/rule-applier');
let config = require('./config');

if (process.env.NODE_ENV === 'test') {
  // eslint-disable-next-line global-require
  config = require('./tests/config');
}

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = (app) => {
  app.log('IssueBot app loaded!');

  app.on('*', async (context) => {
    const projectDataProvider = new ProjectDataProvider(config, context.github, context.log);
    const issueDataProvider = new IssueDataProvider(config, context.github, context.log);
    const issueCommentsDataProvider = new IssueCommentsDataProvider(config, context.github, context.log);
    const configProvider = new ConfigProvider(
      config,
      context.github,
      issueDataProvider,
      projectDataProvider,
      context.log,
    );
    const pullRequestDataProvider = new PullRequestDataProvider(config, context.github, context.log);
    const projectCardDataProvider = new ProjectCardDataProvider(config, context.github, context.log);
    const ruleComputer = new RuleComputer(
      config,
      issueDataProvider,
      issueCommentsDataProvider,
      pullRequestDataProvider,
      projectCardDataProvider,
      configProvider,
      context.log,
    );
    const ruleApplier = new RuleApplier(
      config,
      issueDataProvider,
      pullRequestDataProvider,
      projectCardDataProvider,
      configProvider,
      context.github,
      context.log,
    );

    const rulePromise = ruleComputer.findRules(context);
    const rules = await rulePromise;

    if (rules) {
      rules.forEach((rule) => {
        context.log.info(`[Index] Received webhook matches rule ${rule} requirements`);
      });
      ruleApplier.applyRules(rules, context);
    } else {
      context.log.info(`[Index] No rule applies to received webhook: ${context.name}`);
    }
  });
};
