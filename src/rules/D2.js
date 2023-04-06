/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class D2 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const {issue} = context.payload;
    const issueId = parseInt(issue.number, 10);
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const repositoryConfig = await this.getRepositoryConfigFromIssue(issue);
    const projectConfig = await this.getProjectConfigFromIssue(issue);

    if (Utils.issueHasLabel(issue, repositoryConfig.labels.fixed.name)) {
      this.logger.info(`[Rule Applier] D2 - Remove label ${repositoryConfig.labels.fixed.name}`);
      await this.githubApiClient.issues.removeLabel({
        issue_number: issueId,
        owner,
        repo,
        name: repositoryConfig.labels.fixed.name,
      });
    }

    await this.moveCardTo(
      issueId,
      owner,
      repo,
      projectConfig.kanbanColumns.notReadyColumnId,
      this.config.maxiKanban.columns.notReadyColumnId,
    );
  }
};
