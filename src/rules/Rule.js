/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const {getIssue} = require('../services/getIssue');
const {changeColumn} = require('../services/changeColumn');

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

    const relatedCard = await this.issueDataProvider.getRelatedCardInKanban(issueId, issueOwner, issueRepo);

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
