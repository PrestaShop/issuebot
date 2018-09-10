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
const PrestashopPullRequestParser = require('./src/prestashop-pull-request-parser');

/**
 * Entry point for Probot App
 * @param {import('probot').Application} app - Probot's Application class.
 */
module.exports = app => {
  app.on('*', async context => {

    /* Services initialization */
    const issueDataProvider = new IssueDataProvider(context.github, context.log);
    const prestashopPullRequestParser = new PrestashopPullRequestParser(context.log);
    const ruleComputer = new RuleComputer(issueDataProvider, prestashopPullRequestParser, context.log);
    const ruleApplier = new RuleApplier(issueDataProvider, context.github, prestashopPullRequestParser, context.log);

    /* Attempts to match webhook data with a Rule */
    let rulePromise = ruleComputer.findRule(context);
    let rule = await rulePromise;

    /* If Rule found, apply it */
    if (rule != null) {
      context.log.info('[Index] Received webhook matches rule ' + rule + ' requirements');
      ruleApplier.applyRule(rule, context);
    } else {
      context.log.info('[Index] No rule applies to received webhook: ' + context.name);
    }
  });
};
