/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('../rule');
const Utils = require('./Utils');

module.exports = class IssueRuleFinder {
  /**
     * @param config
     * @param {IssueDataProvider} issueDataProvider
     * @param {ConfigProvider} configProvider
     * @param {Logger} logger
     */
  constructor(config, issueDataProvider, configProvider, logger) {
    this.config = config;
    this.logger = logger;
    this.issueDataProvider = issueDataProvider;
    this.configProvider = configProvider;
  }

  /**
     * Try to find whether webhook context matches an Issue rule requirements.
     *
     * @param {Context} context
     *
     * @returns {Promise<*>}
     *
     * @public
     */
  async findRules(context) {
    const rules = [];

    if (Utils.contextHasAction(context, 'labeled')) {
      const {issue} = context.payload;
      const repositoryConfig = this.configProvider.getRepositoryConfigFromIssue(this.config, issue);

      // make automatic status labels mutually exclusive
      rules.push(Rule.D1);

      // reopen an closed Issue when automatic label is added except FIXED
      if (
        issue.state === 'closed' && context.payload.label.name !== repositoryConfig.labels.fixed.name) {
        rules.push(Rule.D4);
      }

      const cardInKanban = await this.getCardFromIssue(issue);
      if (cardInKanban !== null) {
        const cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(cardInKanban.column_url), 10);
        const projectConfig = await this.configProvider.getProjectConfigFromProjectCard(this.config, cardInKanban);
        if (
          projectConfig
          && projectConfig.kanbanColumns.toDoColumnId !== cardColumnId
          && Utils.issueHasLabel(issue, repositoryConfig.labels.todo.name)
        ) {
          rules.push(Rule.C1);
        }
        if (projectConfig && Utils.issueHasLabel(issue, repositoryConfig.labels.rejected.name)) {
          rules.push(Rule.C3);
        }
      }
    }

    if (Utils.contextHasAction(context, 'closed')) {
      // remove automatic status labels when closing an Issue in the kanban + Add fixed Label
      rules.push(Rule.D3);

      // place an Issue in the “Done” column when it is closed
      // const cardInKanban = await this.getCardFromIssue(context.payload.issue);
      // if (cardInKanban !== null) {
      //   const cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(cardInKanban.column_url), 10);
      //   const projectConfig = await this.configProvider.getProjectConfigFromProjectCard(this.config, cardInKanban);
      //   if (projectConfig.kanbanColumns.doneColumnId !== cardColumnId) {
      //     rules.push(Rule.C2);
      //   }
      // }
    }

    if (Utils.contextHasAction(context, 'reopened')) {
      rules.push(Rule.D2);
    }

    this.logger.info(`Rules are : ${rules.join(', ')}`);

    return rules;
  }

  /**
   * Get card related to an issue
   *
   * @param {Object} issue
   * @returns {Promise<*>}
   */
  async getCardFromIssue(issue) {
    const issueData = Utils.parseUrlForData(issue.url);

    return this.issueDataProvider.getRelatedCardInKanban(
      issueData.number,
      issueData.owner,
      issueData.repo,
    );
  }
};
