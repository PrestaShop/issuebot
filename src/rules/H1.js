/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class H1 extends Rule {
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
    const repositoryConfig = this.getRepositoryConfigFromIssue(referencedIssue);

    // Re-open the issue if closed
    if (referencedIssue.state === 'closed') {
      await this.githubApiClient.issues.update({
        issue_number: referencedIssueId,
        owner,
        repo,
        state: 'open',
      });
    }

    // Remove automatic labels
    await this.removeIssueAutomaticLabels(referencedIssue, owner, repo);

    // Remove Waiting for QA label
    if (Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.toBeTested.name)) {
      this.logger.info(`[Rule Applier] H1 - Remove label ${repositoryConfig.labels.toBeTested.name}`);
      await this.githubApiClient.issues.removeLabel({
        issue_number: referencedIssueId,
        owner,
        repo,
        name: repositoryConfig.labels.toBeTested.name,
      });
    }

    // Add In-Progress label
    if (!Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.inProgress.name)) {
      await this.githubApiClient.issues.addLabels({
        issue_number: referencedIssueId,
        owner,
        repo,
        labels: {labels: [repositoryConfig.labels.inProgress.name]},
      });
    }
  }
};
