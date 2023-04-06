/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
module.exports = class ProjectDataProvider {
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
   * @param {int} projectId
   *
   * @returns {Promise<*>}
   */
  async getData(projectId) {
    const {data} = await this.githubApiClient.projects.get({
      project_id: projectId,
    });

    return data;
  }

  /**
   * Parse a github URL to extract Project ID
   *
   * @param {string} url
   *
   * @returns {string}
   */
  parseUrlForId(url) {
    return url.substr(url.lastIndexOf('/') + 1);
  }
};
