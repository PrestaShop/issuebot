/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class J1 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const pullRequestId = context.payload.pull_request.number;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const referencedIssuesData = await this.pullRequestDataProvider.getReferencedIssues(pullRequestId, owner, repo);

    if (referencedIssuesData.length > 0) {
      for (let index = 0; index < referencedIssuesData.length; index += 1) {
        const referencedIssueData = referencedIssuesData[index];
        const card = await this.issueDataProvider.getRelatedCardInKanban(
          referencedIssueData.number,
          referencedIssueData.owner,
          referencedIssueData.repo,
        );
        if (card) {
          const cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(card.column_url), 10);
          const projectConfig = await this.getProjectConfigFromProjectCard(card);

          if (projectConfig.kanbanColumns.toBeReviewedColumnId === cardColumnId) {
            await this.moveCardTo(
              referencedIssueData.number,
              referencedIssueData.owner,
              referencedIssueData.repo,
              projectConfig.kanbanColumns.toBeTestedColumnId,
              this.config.maxiKanban.columns.toBeTestedColumnId,
            );

            const referencedIssue = await this.issueDataProvider.getData(
              referencedIssueData.number,
              referencedIssueData.owner,
              referencedIssueData.repo,
            );
            const repositoryConfig = this.getRepositoryConfigFromIssue(referencedIssue);

            // Remove automatic labels
            await this.removeIssueAutomaticLabels(referencedIssue, referencedIssueData.owner, referencedIssueData.repo);

            // Add TBT label to PR
            if (!Utils.issueHasLabel(context.payload.pull_request, repositoryConfig.labels.toBeTested.name)) {
              await this.githubApiClient.issues.addLabels({
                issue_number: context.payload.pull_request.number,
                owner: context.payload.pull_request.user.login,
                repo: context.payload.pull_request.base.repo.name,
                labels: {labels: [repositoryConfig.labels.toBeTested.name]},
              });
            }
          }
        }

        // Remove the issue assignee
        // await this.githubApiClient.issues.removeAssignees({
        //   issue_number: referencedIssueData.number,
        //   owner: referencedIssueData.owner,
        //   repo: referencedIssueData.repo,
        //   assignees: context.payload.pull_request.user.login,
        // });
      }
    }
  }
};
