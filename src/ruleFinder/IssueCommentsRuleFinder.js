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
      return [];
    }

    const {issue} = context.payload;
    const repositoryConfig = this.configProvider.getRepositoryConfigFromIssue(this.config, issue);
    // No need to go further if comments is lowest than threshold
    if (issue.comments < repositoryConfig.topwatchersThreshold) {
      return [];
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
