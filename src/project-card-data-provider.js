/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
module.exports = class ProjectCardDataProvider {
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
   * @param {object} projectCard
   *
   * @returns {int|null}
   */
  async getRelatedIssueId(projectCard) {
    if (Object.prototype.hasOwnProperty.call(projectCard, 'content_url')) {
      return parseInt(this.parseIssueUrlForId(projectCard.content_url), 10);
    }

    return null;
  }

  /**
   * @param {int} projectCardId
   *
   * @returns {Promise<*>}
   */
  async getData(projectCardId) {
    const {data} = await this.githubApiClient.projects.getCard({
      card_id: projectCardId,
    });

    return data;
  }

  /**
   * Parse a github URL to extract Issue / Pull Request ID
   *
   * @param {string} url
   *
   * @returns {string}
   */
  parseIssueUrlForId(url) {
    return url.substr(url.lastIndexOf('/') + 1);
  }
};
