/**
 * 2007-2018 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2018 PrestaShop SA
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */
const RuleComputer = require('./src/rule-computer');
const IssueDataProvider = require('./src/issue-data-provider');
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

  app.on('issues.opened', async (context) => {
    const issueComment = context.issue({body: 'Thanks for opening this issue!'});
    return context.github.issues.createComment(issueComment);
  });

  app.on('*', async (context) => {
    const projectDataProvider = new ProjectDataProvider(config, context.github, context.log);
    const issueDataProvider = new IssueDataProvider(config, context.github, context.log);
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
