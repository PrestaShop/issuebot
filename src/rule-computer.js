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
var Rule = require('./rule.js');

module.exports = class RuleComputer {
  /**
   * @param config
   * @param {IssueDataProvider} issueDataProvider
   * @param {Logger} logger
   */
  constructor (config, issueDataProvider, logger) {
    this.config = config;
    this.logger = logger;
    this.issueDataProvider = issueDataProvider;
  }

  /**
   * Try to find whether webhook context matches a rule requirements.
   *
   * @param {Context} context
   *
   * @returns {Promise<*>}
   */
  async findRule (context) {

    switch (context.name) {
      case 'issues':
        this.logger.debug('Rule debug: is issue');
        return this.findIssueRule(context);
        break;

      case 'issue_comment':
        this.logger.debug('Rule debug: is issue comment');
        break;

      default:
        this.logger.debug('No rule applies to ' + context.name);
    }
  }

  /**
   * Try to find whether webhook context matches an Issue rule requirements.
   *
   * @param {Context} context
   *
   * @returns {Promise<*>}
   *
   * @private
   */
  async findIssueRule (context) {

    if (context.payload.action == 'milestoned') {
      this.logger.debug('Rule debug: milestoned');

      const milestone = context.payload.issue.milestone.title;

      if ((milestone == this.config.milestones.next_minor_milestone) || (milestone == this.config.milestones.next_patch_milestone)) {
        const issueId = context.payload.issue.number;

        const isIssueInKanbanPromise = this.issueDataProvider.isIssueInTheKanban(issueId);
        const isIssueInKanban = await isIssueInKanbanPromise;

        if (isIssueInKanban === false) {
          return Rule.A1;
        }
      }
    }

    if (context.payload.action == 'demilestoned') {
      this.logger.debug('Rule debug: demilestoned');
      const issueId = context.payload.issue.number;

      const isIssueInKanbanPromise = this.issueDataProvider.isIssueInTheKanban(issueId);
      const isIssueInKanban = await isIssueInKanbanPromise;

      if (isIssueInKanban === true) {
        return Rule.B2;
      }
    }

    if (context.payload.action === 'labeled') {
      this.logger.debug('Rule debug: labeled');
      const issueId = context.payload.issue.number;

      const getCardInKanbanPromise = this.issueDataProvider.getRelatedCardInKanban(issueId);
      const getCardInKanban = await getCardInKanbanPromise;

      if (getCardInKanban !== null) {
        let cardColumnId = this.issueDataProvider.parseCardUrlForId(getCardInKanban.column_url);

        if (this.config.kanbanColumns.toDoColumnId != cardColumnId) {
          return Rule.C1;
        }
      }
    }

    return null;
  }
};
