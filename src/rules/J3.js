/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
// const Utils = require('../ruleFinder/Utils');

module.exports = class J3 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const referencedIssueId = await this.projectCardDataProvider.getRelatedIssueId(context.payload.project_card);
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const referencedIssue = await this.issueDataProvider.getData(
      referencedIssueId,
      owner,
      repo,
    );
    // const repositoryConfig = this.getRepositoryConfigFromIssue(referencedIssue);

    // Remove automatic labels except To-Do
    await this.removeIssueAutomaticLabels(referencedIssue, owner, repo);

    // Add TBT label
    // if (!Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.toBeTested.name)) {
    //   await this.githubApiClient.issues.addLabels({
    //     issue_number: referencedIssueId,
    //     owner,
    //     repo,
    //     labels: {labels: [repositoryConfig.labels.toBeTested.name]},
    //   });
    // }

    // Remove the issue assignee
    // await this.githubApiClient.issues.removeAssignees({
    //   issue_number: referencedIssueId,
    //   owner,
    //   repo,
    //   assignees: referencedIssue.user.login,
    // });
  }
};
