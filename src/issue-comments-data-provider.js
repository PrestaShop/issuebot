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
const positiveReactions = [
  '+1',
];
module.exports = class IssueCommentsDataProvider {
  /**
   * @param config
   * @param {import('probot').GitHubApi} githubApiClient
   * @param {Logger} logger
   */
  constructor(config, githubApiClient, logger) {
    this.config = config;
    this.githubApiClient = githubApiClient;
    this.logger = logger;
  }

  /**
   * @param {int} issueId
   * @param {boolean} excludeIssueOwner
   * @param {string} owner
   * @param {string} repo
   * @param {array} excludedUsers
   *
   * @returns {Promise<*>}
   */
  async getCommentAuthors(issueId, owner, repo, excludeIssueOwner, excludedUsers) {
    const commentAuthors = {
      count: 0,
      authors: [],
    };

    const {data} = await this.githubApiClient.issues.listComments({
      issue_number: issueId,
      owner,
      repo,
    });

    if (excludeIssueOwner) {
      excludedUsers.push(owner)
    }

    data.forEach(comment => {
      if (!excludedUsers.includes(comment.user.login)) {
        commentAuthors.authors.push(comment.user.login)
        ++commentAuthors.count;
      }
    });

    return commentAuthors;
  }

  /**
   * @param {int} issueId
   * @param {boolean} excludeIssueOwner
   * @param {string} owner
   * @param {string} repo
   * @param {array} excludedUsers
   *
   * @returns {Promise<*>}
   */
  async getNumberOfPositiveReactions(issueId, owner, repo, excludeIssueOwner, excludedUsers) {
    const {data} = await this.githubApiClient.reactions.listForIssue({
      issue_number: issueId,
      owner,
      repo,
    });

    let positiveReactionsCount = 0;
    if (excludeIssueOwner) {
      excludedUsers.push(owner)
    }

    data.forEach(reaction => {
      if (positiveReactions.includes(reaction.content) && !excludedUsers.includes(reaction.user.login)) {
        ++positiveReactionsCount;
      }
    });

    return positiveReactionsCount;
  }

  /**
   * Parse a github URL to extract Issue / Pull Request ID
   *
   * @param {string} url
   *
   * @returns {string}
   */
  parseCardUrlForId(url) {
    return url.substr(url.lastIndexOf('/') + 1);
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
      owner: matches[2],
      repo: matches[3],
      number: matches[4],
    };
  }
};
