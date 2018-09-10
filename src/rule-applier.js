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
const Config = require('config');

module.exports = class RuleApplier {

  /**
   * @param {IssueDataProvider} issueDataProvider
   * @param {GithubAPI} githubApiClient
   * @param {Logger} logger
   */
  constructor (
    issueDataProvider,
    githubApiClient,
    prestashopPullRequestParser,
    logger
  ) {
    this.issueDataProvider = issueDataProvider;
    this.githubApiClient = githubApiClient;
    this.prestashopPullRequestParser = prestashopPullRequestParser;
    this.logger = logger;
  }

  /**
   * @param {string} rule
   * @param {Context} context
   */
  applyRule (rule, context) {
    this.logger.debug('[Rule Applier] Applying rule ' + rule);

    switch (rule) {
      case Rule.A1:
        this.applyRuleA1(context);
        break;

      case Rule.B2:
        this.applyRuleB2(context);
        break;

      case Rule.C1:
        this.applyRuleC1(context);
        break;

      case Rule.C2:
        this.applyRuleC2(context);
        break;

      case Rule.E1:
        this.applyRuleE1(context);
        break;

      case Rule.E3:
        this.applyRuleE3(context);
        break;

      default:
        this.logger.error('[Rule Applier] Cannot apply ' + rule);

    }
  }

  /**
   * Apply Rule A1: create card in todo kandan column.
   *
   * @param {Context} context
   *
   * @private
   */
  async applyRuleA1 (context) {
    const todoColumnId = Config.get('botConfig.kanbanColumns.todo.id');
    const issueId = context.payload.issue.id;

    this.githubApiClient.projects.createProjectCard({
      column_id: todoColumnId,
      content_id: issueId,
      content_type: 'Issue'
    });
  }

  /**
   * Apply Rule B2: remove card from kanban.
   *
   * @param {Context} context
   */
  async applyRuleB2 (context) {
    const issueId = context.payload.issue.number;
    const relatedCard = await this.issueDataProvider.getRelatedCardInKanban(issueId);

    this.githubApiClient.projects.deleteProjectCard({card_id: relatedCard.id});
  }

  /**
   * Apply Rule C1: move card into todo column.
   *
   * @param {Context} context
   */
  async applyRuleC1 (context) {
    const issueId = context.payload.issue.number;
    const relatedCard = await this.issueDataProvider.getRelatedCardInKanban(issueId);

    this.githubApiClient.projects.moveProjectCard({
      card_id: relatedCard.id,
      position: 'bottom',
      column_id: Config.get('botConfig.kanbanColumns.todo.id')
    });
  }

  /**
   * Apply Rule C2: move card into done column.
   *
   * @param {Context} context
   */
  async applyRuleC2 (context) {
    const issueId = context.payload.issue.number;
    const relatedCard = await this.issueDataProvider.getRelatedCardInKanban(issueId);

    this.githubApiClient.projects.moveProjectCard({
      card_id: relatedCard.id,
      position: 'bottom',
      column_id: Config.get('botConfig.kanbanColumns.done.id')
    });
  }

  /**
   * Apply Rule E1: apply milestone to linked issues.
   *
   * @param {Context} context
   */
  async applyRuleE1 (context) {
    const milestone = context.payload.issue.milestone.title;
    const linkedIssueNumbers = this.getLinkedIssueNumbers(context.payload.issue);

    linkedIssueNumbers.forEach((issueNumber) => {
      this.githubApiClient.issues.edit({
        owner: Config.get('botConfig.repository.owner'),
        repo: Config.get('botConfig.repository.name'),
        number: issueNumber,
        milestone: milestone
      });
    });
  }

  /**
   * Apply Rule E3: move card into to be tested column.
   *
   * @param {Context} context
   */
  async applyRuleE3 (context) {
    // @todo: unify ways to access webhook data (issue or pull_request)
    const issueNumber = context.payload.pull_request.number;

    const getRelatedCardPromise = this.issueDataProvider.getRelatedCardInKanban(issueNumber);
    const relatedCard = await getRelatedCardPromise;

    this.githubApiClient.projects.moveProjectCard({
      card_id: relatedCard.id,
      position: 'bottom',
      column_id: Config.get('botConfig.kanbanColumns.to_be_tested.id')
    });
  }

  /**
   * @param webhookData
   *
   * @returns {null}|{array}
   */
  getLinkedIssueNumbers (webhookData) {
    const ticketNumbers = this.prestashopPullRequestParser.parseBodyForIssuesNumbers(webhookData.body);

    return ticketNumbers;
  };
};
