/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('../rule');
const Utils = require('./Utils');

module.exports = class IssueCommentsRuleFinder {
  /**
   * @param config
   * @param {IssueCommentsDataProvider} issueCommentsDataProvider
   * @param {ConfigProvider} configProvider
   * @param {Logger} logger
   */
  constructor(config, issueCommentsDataProvider, configProvider, logger) {
    this.config = config;
    this.logger = logger;
    this.issueCommentsDataProvider = issueCommentsDataProvider;
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

    if (!Utils.contextHasAction(context, 'created')) {
      return rules;
    }

    const {issue} = context.payload;
    const repositoryConfig = this.configProvider.getRepositoryConfigFromIssue(this.config, issue);

    if (
      Utils.issueHasLabel(issue, repositoryConfig.labels.waitingAuthor.name)
      && Utils.issueHasLabel(issue, repositoryConfig.labels.needsMoreInfo.name)
    ) {
      rules.push(Rule.M2);
    }

    // No need to go further if comments is lowest than threshold
    if (issue.comments < repositoryConfig.topwatchersThreshold) {
      return rules;
    }

    const issueData = Utils.parseUrlForData(issue.url);
    // Get number of comment authors different from issue owner and maintainers
    const commentAuthors = await this.issueCommentsDataProvider.getCommentAuthors(
      issueData.number,
      issueData.owner,
      issueData.repo,
      true,
      repositoryConfig.excludedUsersFromTopwatchers,
    );
    this.logger.info(commentAuthors);
    const numberOfCommentAuthors = parseInt(commentAuthors.count, 10);
    const numberOfPositiveReactions = parseInt(
      await this.issueCommentsDataProvider.getNumberOfPositiveReactions(
        issueData.number,
        issueData.owner,
        issueData.repo,
        true,
        commentAuthors.authors.concat(repositoryConfig.excludedUsersFromTopwatchers),
      ),
      10,
    );
    this.logger.info(`${numberOfCommentAuthors} comments`);
    this.logger.info(`${numberOfPositiveReactions} positive reactions`);
    if ((numberOfCommentAuthors + numberOfPositiveReactions) >= repositoryConfig.topwatchersThreshold) {
      rules.push(Rule.M1);
    }

    this.logger.info(`Rules are : ${rules.join(', ')}`);

    return rules;
  }
};
