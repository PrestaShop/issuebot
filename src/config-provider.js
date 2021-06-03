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
const Utils = require('./ruleFinder/Utils');

module.exports = class ConfigProvider {
  /**
   * @param config
   * @param {import('probot').GitHubApi} githubApiClient
   * @param {IssueDataProvider} issueDataProvider
   * @param {ProjectDataProvider} projectDataProvider
   * @param {Logger} logger
   */
  constructor(config, githubApiClient, issueDataProvider, projectDataProvider, logger) {
    this.config = config;
    this.githubApiClient = githubApiClient;
    this.issueDataProvider = issueDataProvider;
    this.projectDataProvider = projectDataProvider;
    this.logger = logger;
  }

  /**
   * Get repository configuration by milestone object
   *
   * @param {Object} config
   * @param {Object} milestone
   * @returns {null|Object}
   */
  getRepositoryConfigFromMilestone(config, milestone) {
    return this.getRepositoryConfigByName(
      config,
      this.getProjectNameFromMilestone(config, milestone),
    );
  }

  /**
   * Get project configuration by milestone object
   *
   * @param {Object} repositoryConfig
   * @param {Object} milestone
   * @returns {
   *   Promise
   *   <
   *     null|
   *     *|
   *     {
   *       name: string,
   *       kanbanColumns: {
   *         inProgressColumnId: number,
   *         notReadyColumnId: number,
   *         toBeReviewedColumnId: number,
   *         toBeSpecifiedColumnId: number,
   *         toBeTestedColumnId: number,
   *         doneColumnId: number,
   *         toBerMergedColumnId: number,
   *         backlogColumnId: number,
   *         toDoColumnId: number
   *       }
   *     }|
   *     {
   *       name: string,
   *       kanbanColumns: {
   *         inProgressColumnId: number,
   *         doneColumnId: number,
   *         toDoColumnId: number
   *       }
   *     }
   *   >
   * }
   */
  getProjectConfigFromMilestone(repositoryConfig, milestone) {
    let projectName = null;
    for (let index = 0; index < repositoryConfig.milestones.length; index += 1) {
      if (repositoryConfig.milestones[index].name === milestone) {
        projectName = repositoryConfig.milestones[index].project;
      }
    }

    if (projectName) {
      for (let index = 0; index < repositoryConfig.projects.length; index += 1) {
        if (repositoryConfig.projects[index].name === projectName) {
          return repositoryConfig.projects[index];
        }
      }
    }

    return null;
  }

  /**
   * Get repository configuration by issue object
   *
   * @param {Object} config
   * @param {Object} issue
   * @returns {null|Object}
   */
  getRepositoryConfigFromIssue(config, issue) {
    const projectName = this.parseRepositoryUrlForName(issue.repository_url);

    return this.getRepositoryConfigByName(config, projectName);
  }

  /**
   * Get project configuration by issue object
   *
   * @param {object} config
   * @param {object} issue
   * @returns {
   *   Promise
   *   <
   *     null|
   *     *|
   *     {
   *       name: string,
   *       kanbanColumns: {
   *         inProgressColumnId: number,
   *         notReadyColumnId: number,
   *         toBeReviewedColumnId: number,
   *         toBeSpecifiedColumnId: number,
   *         toBeTestedColumnId: number,
   *         doneColumnId: number,
   *         toBerMergedColumnId: number,
   *         backlogColumnId: number,
   *         toDoColumnId: number
   *       }
   *     }|
   *     {
   *       name: string,
   *       kanbanColumns: {
   *         inProgressColumnId: number,
   *         doneColumnId: number,
   *         toDoColumnId: number
   *       }
   *     }
   *   >
   * }
   */
  async getProjectConfigFromIssue(config, issue) {
    const issueData = Utils.parseUrlForData(issue.url);
    const cardInKanban = await this.issueDataProvider.getRelatedCardInKanban(
      issueData.number,
      issueData.owner,
      issueData.repo,
    );
    if (cardInKanban !== null) {
      return this.getProjectConfigFromProjectCard(config, cardInKanban);
    }

    return null;
  }

  /**
   * Get repository configuration by pull_request object
   *
   * @param {object} config
   * @param {object} pullRequest
   * @returns {null|object}
   */
  getRepositoryConfigFromPullRequest(config, pullRequest) {
    return this.getRepositoryConfigByName(config, pullRequest.base.repo.name);
  }

  /**
   * Get repository configuration by it's name
   *
   * @param {object} config
   * @param {string} projectName
   * @returns {null|object}
   */
  getRepositoryConfigByName(config, projectName) {
    for (let index = 0; index < config.repositories.length; index += 1) {
      if (config.repositories[index].name === projectName) {
        return config.repositories[index];
      }
    }

    return null;
  }

  /**
   * @param config
   * @param projectCard
   * @returns {
   *   Promise
   *   <
   *     null|
   *     *|
   *     {
   *       name: string,
   *       kanbanColumns: {
   *         inProgressColumnId: number,
   *         notReadyColumnId: number,
   *         toBeReviewedColumnId: number,
   *         toBeSpecifiedColumnId: number,
   *         toBeTestedColumnId: number,
   *         doneColumnId: number,
   *         toBerMergedColumnId: number,
   *         backlogColumnId: number,
   *         toDoColumnId: number
   *       }
   *     }|
   *     {
   *       name: string,
   *       kanbanColumns: {
   *         inProgressColumnId: number,
   *         doneColumnId: number,
   *         toDoColumnId: number
   *       }
   *     }
   *   >
   * }
   *
   * @public
   */
  async getProjectConfigFromProjectCard(config, projectCard) {
    const project = await this.projectDataProvider.getData(
      this.projectDataProvider.parseUrlForId(projectCard.project_url),
    );

    const repositoryConfig = this.getRepositoryConfigByName(config, this.parseRepositoryUrlForName(project.owner_url));

    for (let index = 0; index < repositoryConfig.projects.length; index += 1) {
      if (repositoryConfig.projects[index].name === project.name) {
        return repositoryConfig.projects[index];
      }
    }

    return null;
  }

  /**
   * Get repository name from URL
   *
   * @param {string} repositoryUrl
   * @returns {string}
   */
  parseRepositoryUrlForName(repositoryUrl) {
    return repositoryUrl.substr(repositoryUrl.lastIndexOf('/') + 1);
  }
};
