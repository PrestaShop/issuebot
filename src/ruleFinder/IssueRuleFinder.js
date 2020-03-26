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
      }
    }

    if (Utils.contextHasAction(context, 'closed')) {
      // remove automatic status labels when closing an Issue in the kanban + Add fixed Label
      rules.push(Rule.D3);

      // place an Issue in the “Done” column when it is closed
      const cardInKanban = await this.getCardFromIssue(context.payload.issue);
      if (cardInKanban !== null) {
        const cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(cardInKanban.column_url), 10);
        const projectConfig = await this.configProvider.getProjectConfigFromProjectCard(this.config, cardInKanban);
        if (projectConfig.kanbanColumns.doneColumnId !== cardColumnId) {
          rules.push(Rule.C2);
        }
      }
    }

    if (Utils.contextHasAction(context, 'reopened')) {
      rules.push(Rule.D2);
    }

    this.logger.info(`Rules are : ${rules.join(', ')}`);

    return rules;
  }

  /**
   * Parse a github URL to extract Issue / Pull Request informations
   *
   * @param {string} url
   *
   * @returns {object}
   */
  parseUrlForData(url) {
    const matches = url.match(/(.+)\/(.+)\/(.+)\/issues\/(\d+)/);

    return {
      number: parseInt(matches[4], 10),
      owner: matches[2],
      repo: matches[3],
    };
  }

  /**
   * Get card related to an issue
   *
   * @param {Object} issue
   * @returns {Promise<*>}
   */
  async getCardFromIssue(issue) {
    const issueData = this.parseUrlForData(issue.url);

    return this.issueDataProvider.getRelatedCardInKanban(
      issueData.number,
      issueData.owner,
      issueData.repo,
    );
  }
};
