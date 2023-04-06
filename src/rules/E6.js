/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');

module.exports = class E6 extends Rule {
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
        if (referencedIssue.state === 'closed') {
          this.logger.info(`[Rule Applier] E6 - Re-open issue ${referencedIssueData.number}`);

          await this.githubApiClient.issues.update({
            issue_number: referencedIssueData.number,
            owner: referencedIssueData.owner,
            repo: referencedIssueData.repo,
            state: 'open',
          });

          // Remove automatic labels
          // await this.removeIssueAutomaticLabels(referencedIssue, owner, repo);

          // const projectConfig = await this.getProjectConfigFromIssue(referencedIssue);
          //
          // await this.moveCardTo(
          //   referencedIssueData.number,
          //   referencedIssueData.owner,
          //   referencedIssueData.repo,
          //   projectConfig.kanbanColumns.toBeReviewedColumnId,
          // );
        }
      }
    }
  }
};
