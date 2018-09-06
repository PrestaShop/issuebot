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
   * @param {PrestashopPullRequestParser} prestashopPullRequestParser
   * @param {Logger} logger
   */
  constructor (
    config,
    issueDataProvider,
    prestashopPullRequestParser,
    logger
  ) {
    this.config = config;
    this.issueDataProvider = issueDataProvider;
    this.prestashopPullRequestParser = prestashopPullRequestParser;
    this.logger = logger;
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
        // some webhooks for pull requests are labeled as 'issues' webhooks by github T_T
        if (context.payload.issue.hasOwnProperty('pull_request')) {
          return this.findPullRequestRule(context);
        }
        return this.findIssueRule(context);

      case 'pull_request':
        return this.findPullRequestRule(context);

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
  async findIssueRule (context) {
    this.logger.debug('[Rule Computer] Context type is issue');

    if (this.contextHasAction(context, 'milestoned')) {
      const milestone = context.payload.issue.milestone.title;

      if (this.milestoneMatchesTheNextPatchOrMinorRelease(milestone)) {
        const issueId = context.payload.issue.number;
        const isIssueInKanbanPromise = this.issueDataProvider.isIssueInTheKanban(issueId);
        const isIssueInKanban = await isIssueInKanbanPromise;

        if (isIssueInKanban === false) {
          return Rule.A1;
        }
      }
    }

    if (this.contextHasAction(context, 'demilestoned')) {
      const issueId = context.payload.issue.number;
      const isIssueInKanbanPromise = this.issueDataProvider.isIssueInTheKanban(issueId);
      const isIssueInKanban = await isIssueInKanbanPromise;

      if (isIssueInKanban === true) {
        return Rule.B2;
      }
    }

    if (this.contextHasAction(context, 'labeled')) {
      const issue = context.payload.issue;
      const issueId = issue.number;
      const getCardInKanbanPromise = this.issueDataProvider.getRelatedCardInKanban(issueId);
      const getCardInKanban = await getCardInKanbanPromise;

      if (getCardInKanban !== null) {
        let cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(getCardInKanban.column_url));

        // @todo: check this is indeed 'todo'
        if (this.config.kanbanColumns.toDoColumnId !== cardColumnId && this.issueHasLabel(issue, 'todo')) {
          return Rule.C1;
        }
      }
    }

    if (this.contextHasAction(context, 'closed')) {
      const issueId = context.payload.issue.number;
      const getCardInKanbanPromise = this.issueDataProvider.getRelatedCardInKanban(issueId);
      const getCardInKanban = await getCardInKanbanPromise;

      if (getCardInKanban !== null) {
        let cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(getCardInKanban.column_url));

        if (this.config.kanbanColumns.doneColumnId !== cardColumnId) {
          return Rule.C2;
        }
      }
    }

    return Promise.resolve(null);
  }

  /**
   * Try to find whether webhook context matches a Pull Request rule requirements.
   *
   * @param {Context} context
   *
   * @returns {Promise<*>}
   *
   * @private
   */
  async findPullRequestRule (context) {
    this.logger.debug('[Rule Computer] Context type is pull request');

    const linkedIssueNumbers = this.getLinkedIssueNumbers(context.payload.issue);

    if (null === linkedIssueNumbers) {
      return Promise.resolve(null);
    }

    if (this.contextHasAction(context, 'milestoned')) {
      const milestone = context.payload.issue.milestone.title;

      if (this.milestoneMatchesTheNextPatchOrMinorRelease(milestone)) {

        for (let index = 0; index < linkedIssueNumbers.length; index++) {

          let currentIssueNumber = linkedIssueNumbers[index];
          let getIssueResponse = await this.issueDataProvider.getIssue(currentIssueNumber);
          let getIssueResponseA = await this.issueDataProvider.getIssue(currentIssueNumber);

          if (getIssueResponseA.data.milestone === null) {
            return Rule.E1;
          }
        }
      }
    }

    return Promise.resolve(null);
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

      let currentLabel = issueLabels[index];
      if (currentLabel.hasOwnProperty('name') === false) {
        continue;
      }

      if (currentLabel.name === labelTitle) {
        return true;
      }
    }

    return false;
  }

  /**
   * @param {Context} context
   * @param string actionName
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

  milestoneMatchesTheNextPatchOrMinorRelease (milestone) {
    return ((milestone === this.config.milestones.next_minor_milestone) ||
      (milestone === this.config.milestones.next_patch_milestone));
  }

  /**
   * @param issue
   * @returns {null}|{array}
   */
  getLinkedIssueNumbers (issue) {
    const ticketNumbers = this.prestashopPullRequestParser.parseBodyForIssuesNumbers(issue.body);

    return ticketNumbers;
  };
};
