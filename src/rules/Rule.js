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
const {getIssue} = require('../maxikanban/getIssue');
const {changeColumn} = require('../maxikanban/changeColumn');

module.exports = class Rule {
  /**
   * @param config
   * @param {IssueDataProvider} issueDataProvider
   * @param {PullRequestDataProvider} pullRequestDataProvider
   * @param {ProjectCardDataProvider} projectCardDataProvider
   * @param {ConfigProvider} configProvider
   * @param {import('probot').GitHubApi} githubApiClient
   * @param {Logger} logger
   */
  constructor(
    config,
    issueDataProvider,
    pullRequestDataProvider,
    projectCardDataProvider,
    configProvider,
    githubApiClient,
    logger,
  ) {
    this.config = config;
    this.issueDataProvider = issueDataProvider;
    this.pullRequestDataProvider = pullRequestDataProvider;
    this.projectCardDataProvider = projectCardDataProvider;
    this.configProvider = configProvider;
    this.githubApiClient = githubApiClient;
    this.logger = logger;
  }

  issueHasAutomaticLabel(issue) {
    if (Object.prototype.hasOwnProperty.call(issue, 'labels') === false) {
      return false;
    }

    const issueLabels = issue.labels;
    const repositoryConfig = this.getRepositoryConfigFromIssue(issue);

    for (let index = 0; index < issueLabels.length; index += 1) {
      const currentLabel = issueLabels[index];
      if (
        Object.prototype.hasOwnProperty.call(currentLabel, 'name')
        && this.isAutomaticLabel(repositoryConfig, currentLabel)
      ) {
        return true;
      }
    }

    return false;
  }

  isAutomaticLabel(config, label) {
    const automaticLabels = Object.values(config.labels).filter((el) => el.automatic === true);
    for (let i = 0; i < automaticLabels.length; i += 1) {
      if (automaticLabels[i].name === label.name) {
        return true;
      }
    }
    return false;
  }

  async moveCardTo(issueId, issueOwner, issueRepo, columnId, maxiKanbanColumnId) {
    this.logger.info(`Moving issue #${issueId} card in Kanban`);

    const getRelatedCardPromise = this.issueDataProvider.getRelatedCardInKanban(issueId, issueOwner, issueRepo);
    const relatedCard = await getRelatedCardPromise;

    await this.githubApiClient.projects.moveCard({
      card_id: relatedCard.id,
      position: 'bottom',
      column_id: columnId,
    });

    const issueGraphqlData = await getIssue(this.githubApiClient, issueRepo, issueOwner, issueId);

    await changeColumn(
      this.githubApiClient,
      issueGraphqlData,
      this.config.maxiKanban.id,
      maxiKanbanColumnId,
    );
  }

  async removeIssueAutomaticLabels(issue, owner, repo, newLabel = null) {
    const issueId = issue.number;
    const repositoryConfig = this.getRepositoryConfigFromIssue(issue);

    for (let index = 0; index < issue.labels.length; index += 1) {
      const label = issue.labels[index];

      if (this.isAutomaticLabel(repositoryConfig, label)) {
        if (newLabel && (newLabel.id === label.id || newLabel.name === label.name)) {
          // eslint-disable-next-line no-continue
          continue;
        }
        this.logger.info(`[Rule Applier] Remove label ${label.name}`);

        await this.githubApiClient.issues.removeLabel({
          issue_number: issueId,
          owner,
          repo,
          name: label.name,
        });
      }
    }
  }

  getRepositoryConfigFromMilestone(milestone) {
    return this.configProvider.getRepositoryConfigFromMilestone(this.config, milestone);
  }

  getProjectConfigFromMilestone(repositoryConfig, milestone) {
    return this.configProvider.getProjectConfigFromMilestone(repositoryConfig, milestone);
  }

  getRepositoryConfigFromIssue(issue) {
    return this.configProvider.getRepositoryConfigFromIssue(this.config, issue);
  }

  async getProjectConfigFromIssue(issue) {
    return this.configProvider.getProjectConfigFromIssue(this.config, issue);
  }

  async getProjectConfigFromProjectCard(projectCard) {
    return this.configProvider.getProjectConfigFromProjectCard(this.config, projectCard);
  }
};
