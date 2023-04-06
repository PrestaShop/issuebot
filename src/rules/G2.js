/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class G2 extends Rule {
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
    await this.removeIssueAutomaticLabels(referencedIssue, owner, repo, repositoryConfig.labels.ready);

    // Add Ready label
    if (!Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.ready.name)) {
      await this.githubApiClient.issues.addLabels({
        issue_number: referencedIssueId,
        owner,
        repo,
        labels: {labels: [repositoryConfig.labels.ready.name]},
      });
    }
  }
};
