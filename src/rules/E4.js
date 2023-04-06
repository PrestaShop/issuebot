/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class E4 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const pullRequestId = context.payload.pull_request.number;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const referencedIssuesData = await this.pullRequestDataProvider.getReferencedIssues(
      pullRequestId,
      owner,
      repo,
    );

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

        await this.moveCardTo(
          referencedIssueData.number,
          referencedIssueData.owner,
          referencedIssueData.repo,
          projectConfig.kanbanColumns.toBeMergedColumnId,
          this.config.maxiKanban.columns.toBeMergedColumnId,
        );

        // Remove automatic labels
        await this.removeIssueAutomaticLabels(referencedIssue, referencedIssueData.owner, referencedIssueData.repo);

        if (Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.toBeTested.name)) {
          // Remove label toBeTested
          await this.githubApiClient.issues.removeLabel({
            issue_number: referencedIssueData.number,
            owner: referencedIssueData.owner,
            repo: referencedIssueData.repo,
            name: repositoryConfig.labels.toBeTested.name,
          });
        }

        // Remove the issue assignee
        // await this.githubApiClient.issues.removeAssignees({
        //   issue_number: referencedIssueData.number,
        //   owner: referencedIssueData.owner,
        //   repo: referencedIssueData.repo,
        //   assignees: referencedIssue.user.login,
        // });
      }
    }
  }
};
