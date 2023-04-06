/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class H2 extends Rule {
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

          const referencedIssue = await this.issueDataProvider.getData(
            referencedIssueData.number,
            referencedIssueData.owner,
            referencedIssueData.repo,
          );
          const repositoryConfig = this.getRepositoryConfigFromIssue(referencedIssue);
          const projectConfig = await this.getProjectConfigFromIssue(referencedIssue);

          if (projectConfig.kanbanColumns.toDoColumnId === cardColumnId) {
            await this.moveCardTo(
              referencedIssueData.number,
              referencedIssueData.owner,
              referencedIssueData.repo,
              projectConfig.kanbanColumns.inProgressColumnId,
              this.config.maxiKanban.columns.inProgressColumnId,
            );

            // Remove automatic labels
            await this.removeIssueAutomaticLabels(referencedIssue, referencedIssueData.owner, referencedIssueData.repo);

            // Add In-Progress label
            if (!Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.inProgress.name)) {
              await this.githubApiClient.issues.addLabels({
                issue_number: referencedIssueData.number,
                owner: referencedIssueData.owner,
                repo: referencedIssueData.repo,
                labels: {labels: [repositoryConfig.labels.inProgress.name]},
              });
            }
          }
        }
      }
    }
  }
};
