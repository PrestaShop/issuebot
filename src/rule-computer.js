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
const Rule = require('./rule.js');
const RuleComputerUtils = require('./rule-computer-utils.js');
const Config = require('config');

module.exports = class RuleComputer {
  /**
   * @param {IssueDataProvider} issueDataProvider
   * @param {PrestashopPullRequestParser} prestashopPullRequestParser
   * @param {Logger} logger
   */
  constructor (
    issueDataProvider,
    prestashopPullRequestParser,
    logger
  ) {
    this.issueDataProvider = issueDataProvider;
    this.logger = logger;
    this.utils = new RuleComputerUtils(prestashopPullRequestParser, logger);
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
          return this.findPullRequestRule(context, false);
        }
        return this.findIssueRule(context);

      case 'pull_request':
        return this.findPullRequestRule(context, true);

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
    let rule;

    if (this.utils.contextHasAction(context, 'milestoned')) {
      rule = await this.checkRuleA1(context);
      if (rule !== false) {
        return rule;
      }
    }

    if (this.utils.contextHasAction(context, 'demilestoned')) {
      rule = await this.checkRuleB2(context);
      if (rule !== false) {
        return rule;
      }
    }

    if (this.utils.contextHasAction(context, 'labeled')) {
      rule = await this.checkRuleC1(context);
      if (rule !== false) {
        return rule;
      }
    }

    if (this.utils.contextHasAction(context, 'closed')) {
      rule = await this.checkRuleC2(context);
      if (rule !== false) {
        return rule;
      }
    }

    return Promise.resolve(null);
  }

  /**
   * Try to find whether webhook context matches a Pull Request rule requirements.
   *
   * @param {Context} context
   * @param {boolean} isARealPullRequest
   *
   * @returns {Promise<*>}
   *
   * @private
   */
  async findPullRequestRule (context, isARealPullRequest) {
    this.logger.debug('[Rule Computer] Context type is pull request');
    let rule;

    let webhookData;
    if (isARealPullRequest === true) {
      webhookData = context.payload.pull_request;
    } else {
      webhookData = context.payload.issue;
    }

    const linkedIssueNumbers = this.utils.getLinkedIssueNumbers(webhookData);

    if (null === linkedIssueNumbers) {
      this.logger.info('[Rule Computer] No issues linked to pull request ' + webhookData.number);
      return Promise.resolve(null);
    }

    if (this.utils.contextHasAction(context, 'milestoned')) {
      rule = await this.checkRuleE1(webhookData, linkedIssueNumbers);
      if (rule !== false) {
        return rule;
      }
    }

    if (this.utils.contextHasAction(context, 'labeled')) {
      rule = await this.checkRuleE3(webhookData, linkedIssueNumbers);
      if (rule !== false) {
        return rule;
      }
    }

    return Promise.resolve(null);
  }

  /**
   * Check Rule A1: issue milestoned for next release and not in kanban yet.
   *
   * @param context
   *
   * @returns false|{string}
   */
  async checkRuleA1 (context) {
    const milestone = context.payload.issue.milestone.title;

    if (false === this.utils.milestoneMatchesTheNextPatchOrMinorRelease(milestone)) {
      return false;
    }

    const issueId = context.payload.issue.number;
    const isIssueInKanban = await this.issueDataProvider.isIssueInTheKanban(issueId);

    if (true === isIssueInKanban) {
      return false;
    }

    return Rule.A1;
  }

  /**
   * Check Rule B2: issue in kanban demilestoned.
   *
   * @param context
   *
   * @returns false|{string}
   */
  async checkRuleB2 (context) {
    const issueId = context.payload.issue.number;
    const isIssueInKanban = await this.issueDataProvider.isIssueInTheKanban(issueId);

    if (false === isIssueInKanban) {
      return false;
    }

    return Rule.B2;
  }

  /**
   * Check Rule C1: issue labeled 'todo' not yet in todo column
   *
   * @param context
   *
   * @returns false|{string}
   */
  async checkRuleC1 (context) {
    const issue = context.payload.issue;
    const issueId = issue.number;
    const getCardInKanban = await this.issueDataProvider.getRelatedCardInKanban(issueId);

    if (getCardInKanban !== null) {
      let cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(getCardInKanban.column_url));

      if (this.utils.cardIsNotInColumn('todo', cardColumnId) && this.utils.issueHasLabel(issue, 'todo')) {
        return Rule.C1;
      }
    }

    return false;
  }

  /**
   * Check Rule C2: issue closed not yet in done column
   *
   * @param context
   *
   * @returns false|{string}
   */
  async checkRuleC2 (context) {
    const issueId = context.payload.issue.number;
    const getCardInKanban = await this.issueDataProvider.getRelatedCardInKanban(issueId);

    if (getCardInKanban !== null) {
      let cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(getCardInKanban.column_url));

      if (Config.get('botConfig.kanbanColumns.done.id') !== cardColumnId) {
        return Rule.C2;
      }
    }

    return false;
  }

  /**
   * Check Rule E1: milestoned PR linked to issues not milestoned yet.
   *
   * @param webhookData
   * @param linkedIssueNumbers
   *
   * @returns false|{string}
   */
  async checkRuleE1 (webhookData, linkedIssueNumbers) {
    const milestone = webhookData.milestone.title;

    if (this.utils.milestoneMatchesTheNextPatchOrMinorRelease(milestone)) {

      for (let index = 0; index < linkedIssueNumbers.length; index++) {

        let currentIssueNumber = linkedIssueNumbers[index];
        let getIssueResponse = await this.issueDataProvider.getIssue(currentIssueNumber);

        if (getIssueResponse.data.milestone === null) {
          return Rule.E1;
        }
      }
    }

    return false;
  }

  /**
   * Check Rule E3: PR labeled 'waiting for QA' linked to isses without the label.
   *
   * @param webhookData
   * @param linkedIssueNumbers
   *
   * @returns false|{string}
   */
  async checkRuleE3 (webhookData, linkedIssueNumbers) {

    for (let index = 0; index < linkedIssueNumbers.length; index++) {

      let currentIssueNumber = linkedIssueNumbers[index];
      let getIssueResponse = await this.issueDataProvider.getIssue(currentIssueNumber);

      if (getIssueResponse.data.labels.length === 0) {
        return Rule.E3;
      }

      for (let index = 0; index < getIssueResponse.data.labels.length; index++) {
        let currentLabel = getIssueResponse.data.labels[index];

        if (currentLabel.name !== 'waiting for QA') {
          return Rule.E3;
        }
      }
    }

    return false;
  }
};
