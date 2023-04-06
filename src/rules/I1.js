/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class I1 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const pullRequest = context.payload.pull_request;
    const pullRequestId = pullRequest.number;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const referencedIssuesData = await this.pullRequestDataProvider.getReferencedIssues(pullRequestId, owner, repo);

    if (referencedIssuesData.length > 0) {
      for (let index = 0; index < referencedIssuesData.length; index += 1) {
        const referencedIssueData = referencedIssuesData[index];

        const referencedIssue = await this.issueDataProvider.getData(
          referencedIssueData.number,
          referencedIssueData.owner,
          referencedIssueData.repo,
        );
        const repositoryConfig = this.getRepositoryConfigFromIssue(referencedIssue);
        const projectConfig = await this.getProjectConfigFromIssue(referencedIssue);

        if (
          !(Utils.issueHasLabel(pullRequest, repositoryConfig.labels.inProgress.name) || pullRequest.draft === true)
        ) {
          const card = await this.issueDataProvider.getRelatedCardInKanban(
            referencedIssueData.number,
            referencedIssueData.owner,
            referencedIssueData.repo,
          );
          if (card) {
            const cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(card.column_url), 10);

            if (
              projectConfig.kanbanColumns.toDoColumnId === cardColumnId
              || projectConfig.kanbanColumns.inProgressColumnId === cardColumnId
            ) {
              await this.moveCardTo(
                referencedIssueData.number,
                referencedIssueData.owner,
                referencedIssueData.repo,
                projectConfig.kanbanColumns.toBeReviewedColumnId,
                this.config.maxiKanban.columns.toBeReviewedColumnId,
              );

              // Remove automatic labels
              await this.removeIssueAutomaticLabels(
                referencedIssue,
                referencedIssueData.owner,
                referencedIssueData.repo,
              );

              if (Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.inProgress.name)) {
                // Remove label WIP
                await this.githubApiClient.issues.removeLabel({
                  issue_number: referencedIssueData.number,
                  owner: referencedIssueData.owner,
                  repo: referencedIssueData.repo,
                  name: repositoryConfig.labels.inProgress.name,
                });
              }
            }
          }
        }
      }
    }
  }
};
