/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
      excludedUsers.push(owner);
    }

    const alreadyPushedAuthors = [];

    data.forEach((comment) => {
      if (!excludedUsers.includes(comment.user.login) && !alreadyPushedAuthors.includes(comment.user.login)) {
        alreadyPushedAuthors.push(comment.user.login);
        commentAuthors.authors.push(comment.user.login);
        commentAuthors.count += 1;
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
      excludedUsers.push(owner);
    }

    const alreadyPushedAuthors = [];

    data.forEach((reaction) => {
      if (positiveReactions.includes(reaction.content)
        && !excludedUsers.includes(reaction.user.login)
        && !alreadyPushedAuthors.includes(reaction.user.login)) {
        positiveReactionsCount += 1;
        alreadyPushedAuthors.push(reaction.user.login);
      }
    });

    return positiveReactionsCount;
  }
};
