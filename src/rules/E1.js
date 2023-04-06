/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');

module.exports = class E1 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const pullRequestNumber = parseInt(context.payload.issue.number, 10);
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const referencedIssuesData = await this.pullRequestDataProvider.getReferencedIssues(
      pullRequestNumber,
      owner,
      repo,
    );

    const repositoryConfig = this.getRepositoryConfigFromIssue(context.payload.issue);
    const projectConfig = this.getProjectConfigFromMilestone(repositoryConfig, context.payload.issue.milestone.title);

    if (projectConfig && referencedIssuesData.length > 0) {
      for (let index = 0; index < referencedIssuesData.length; index += 1) {
        const referencedIssueData = referencedIssuesData[index];
        const {inProgressColumnId} = projectConfig.kanbanColumns;
        const referencedIssue = await this.issueDataProvider.getData(
          referencedIssueData.number,
          referencedIssueData.owner,
          referencedIssueData.repo,
        );

        // TODO contentID must refer to an issue or pull request in the same repository as the project
        await this.githubApiClient.projects.createCard({
          column_id: inProgressColumnId,
          content_id: referencedIssue.id,
          content_type: 'Issue',
        });
      }
    }
  }
};
