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
const RuleApplier = require('./src/rule-applier');

/**
 * Entry point for Probot App
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  app.on('*', async context => {

    // @todo: parse this config from a YAML file
    const config = {
      kanbanColumns: {
        toDoColumnId: 3311230,
        inProgressColumnId: 3311231,
        toBeReviewedColumnId: 3311232,
        toBeTestedColumnId: 3329346,
        toBerMergedColumnId: 3329347,
        doneColumnId: 3329348,
      },
      milestones: {
        next_patch_milestone: '1.7.4.3',
        next_minor_milestone: '1.7.5.0',
      }
    };

    const issueDataProvider = new IssueDataProvider(config, context.github, context.log);
    const ruleComputer = new RuleComputer(config, issueDataProvider, context.log);
    const ruleApplier = new RuleApplier(config, issueDataProvider, context.github, context.log);

    let rulePromise = ruleComputer.findRule(context);
    let rule = await rulePromise;

    if (rule != null) {
      context.log.info('[Index] Received webhook matches rule ' + rule + ' requirements');
      ruleApplier.applyRule(rule, context);
    } else {
      context.log.info('[Index] No rule applies to received webhook: ' + context.name);
    }
  });
};
