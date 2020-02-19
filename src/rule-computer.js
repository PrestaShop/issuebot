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
  async findRules (context) {

    switch (context.name) {
      case 'issues':
        this.logger.debug('[Rule Computer] Context type is issue');
        return this.findIssueRules(context);

      case 'issue_comment':
        this.logger.debug('[Rule Computer] Context type is issue comment');
        break;

      default:
        this.logger.debug('[Rule Computer] No rule applies to ' + context.name);
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
  async findIssueRules (context) {

    const rules = [];
    if (this.contextHasAction(context, 'milestoned')) {
      const milestone = context.payload.issue.milestone.title;

      if ((milestone === this.config.milestones.next_minor_milestone) ||
        (milestone === this.config.milestones.next_patch_milestone)) {
        const issueId = context.payload.issue.number;
        const isIssueInKanbanPromise = this.issueDataProvider.isIssueInTheKanban(issueId);
        const isIssueInKanban = await isIssueInKanbanPromise;

        if (isIssueInKanban === false) {
          rules.push(Rule.A1);
        }
      }
    }

    if (this.contextHasAction(context, 'demilestoned')) {
      const issueId = context.payload.issue.number;
      const isIssueInKanbanPromise = this.issueDataProvider.isIssueInTheKanban(issueId);
      const isIssueInKanban = await isIssueInKanbanPromise;

      if (isIssueInKanban === true) {
        rules.push(Rule.B2);
      }
    }

    if (this.contextHasAction(context, 'labeled')) {
      const issue = context.payload.issue;
      const issueId = issue.number;
      if (issue.state === 'closed' && this.isAutomaticLabel(context.payload.label)) {
        rules.push(Rule.D4);
      }
      if (this.issueHasAutomaticLabel(issue)) {
        rules.push(Rule.D1);
      }
      const getCardInKanbanPromise = this.issueDataProvider.getRelatedCardInKanban(issueId);
      const getCardInKanban = await getCardInKanbanPromise;

      if (getCardInKanban !== null) {
        const cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(getCardInKanban.column_url));

        if (this.config.kanbanColumns.toDoColumnId !== cardColumnId && this.issueHasLabel(issue, this.config.labels.todo)) {
          rules.push(Rule.C1);
        }
      }
    }

    if (this.contextHasAction(context, 'closed')) {
      rules.push(Rule.D3);

      const issueId = context.payload.issue.number;
      const getCardInKanbanPromise = this.issueDataProvider.getRelatedCardInKanban(issueId);
      const getCardInKanban = await getCardInKanbanPromise;

      if (getCardInKanban !== null) {
        const cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(getCardInKanban.column_url));

        if (this.config.kanbanColumns.doneColumnId !== cardColumnId) {
          rules.push(Rule.C2);
        }
      }
    }

    if (this.contextHasAction(context, 'reopened')) {
      const issue = context.payload.issue;

      if (!this.issueHasAutomaticLabel(issue)) {
        rules.push(Rule.D2);
      }
    }

    this.logger.info('Rules are : ' + rules.join(', '))

    return rules;
  }

  /**
   * @param issue
   * @param {string} labelTitle
   *
   * @returns {boolean}
   */
  issueHasLabel (issue, labelTitle) {
    if (issue.hasOwnProperty('labels') === false) {
      return false;
    }

    const issueLabels = issue.labels;

    for (let index = 0; index < issueLabels.length; index++) {

      const currentLabel = issueLabels[index];
      if (currentLabel.hasOwnProperty('name') === false) {
        continue;
      }
      if (currentLabel.name === labelTitle) {
        return true;
      }
    }

    return false;
  }

  issueHasAutomaticLabel (issue) {
    if (issue.hasOwnProperty('labels') === false) {
      return false;
    }

    const issueLabels = issue.labels;

    for (let index = 0; index < issueLabels.length; index++) {

      const currentLabel = issueLabels[index];
      if (currentLabel.hasOwnProperty('name') === false) {
        continue;
      }
      if (this.isAutomaticLabel(currentLabel)) {
        return true;
      }
    }

    return false;
  }

  isAutomaticLabel (label) {
    const automaticLabels = Object.values(this.config.labels).filter(function (el) { return el.automatic === true; });
    for (let i = 0; i < automaticLabels.length; i++) {
      if (automaticLabels[i].name === label.name) {
        return true;
      }
    }
    return false;
  }

  /**
   * @param {Context} context
   * @param {string} actionName
   *
   * @returns {boolean}
   */
  contextHasAction (context, actionName) {
    if (context.payload.action === actionName) {
      this.logger.debug('[Rule Computer] Context action is ' + actionName);
      return true;
    }

    return false;
  }
};
