/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class K1 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const referencedIssueId = await this.projectCardDataProvider.getRelatedIssueId(context.payload.project_card);
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const referencedIssue = await this.issueDataProvider.getData(referencedIssueId, owner, repo);
    const repositoryConfig = await this.getRepositoryConfigFromIssue(referencedIssue);

    // Remove automatic labels except FIXED
    await this.removeIssueAutomaticLabels(referencedIssue, owner, repo, repositoryConfig.labels.fixed);

    // Add Fixed label if it does not exist
    if (!Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.fixed.name)) {
      await this.githubApiClient.issues.addLabels({
        issue_number: referencedIssueId,
        owner,
        repo,
        labels: {labels: [repositoryConfig.labels.fixed.name]},
      });
    }

    // Remove the issue assignee
    await this.githubApiClient.issues.removeAssignees({
      issue_number: referencedIssueId,
      owner,
      repo,
      assignees: referencedIssue.user.login,
    });

    // Close the issue
    await this.githubApiClient.issues.update({
      issue_number: referencedIssueId,
      owner,
      repo,
      state: 'closed',
    });
  }
};
