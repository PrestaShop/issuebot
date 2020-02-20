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

const RuleComputer = require('./src/rule-computer.js');
const IssueDataProvider = require('./src/issue-data-provider.js');
const PullRequestDataProvider = require('./src/pull-request-data-provider.js');
const RuleApplier = require('./src/rule-applier');

/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Application} app
 */
module.exports = app => {
  // Your code here
  app.log('IssueBot app loaded!')

  app.on('issues.opened', async context => {
    const issueComment = context.issue({ body: 'Thanks for opening this issue!' })
    return context.github.issues.createComment(issueComment)
  })

  app.on('*', async context => {
    // @todo: parse this config from a YAML file
    const config = {
      kanbanColumns: {
        notReadyColumnId: 8032025,
        backlogColumnId: 8032027,
        toDoColumnId: 8032010,
        inProgressColumnId: 8032011,
        toBeReviewedColumnId: 8032031,
        toBeTestedColumnId: 8032032,
        toBerMergedColumnId: 8032037,
        doneColumnId: 8032012
      },
      labels: {
        todo: { name: 'To Do', automatic: true },
        toBeReproduced: { name: 'TBR', automatic: true },
        toBeSpecified: { name: 'TBS', automatic: true },
        needsMoreInfo: { name: 'NMI', automatic: true },
        toBeTested: { name: 'waiting for QA', automatic: false },
        toBeMerged: { name: 'QA ✔️', automatic: false },
        fixed: { name: 'Fixed', automatic: true }
      },
      milestones: {
        next_patch_milestone: '1.7.4.3',
        next_minor_milestone: '1.7.5.0'
      }
    };

    const issueDataProvider = new IssueDataProvider(config, context.github, context.log);
    const pullRequestDataProvider = new PullRequestDataProvider(config, context.github, context.log);
    const ruleComputer = new RuleComputer(config, issueDataProvider, pullRequestDataProvider, context.log);
    const ruleApplier = new RuleApplier(config, issueDataProvider, pullRequestDataProvider, context.github, context.log);

    const rulePromise = ruleComputer.findRules(context);
    const rules = await rulePromise;

    if (rules != null) {
      for (const rule of rules) {
        context.log.info('[Index] Received webhook matches rule ' + rule + ' requirements');
      }
      ruleApplier.applyRules(rules, context);
    } else {
      context.log.info('[Index] No rule applies to received webhook: ' + context.name);
    }
  })
}
