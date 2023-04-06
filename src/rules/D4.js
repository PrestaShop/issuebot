/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class D4 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const newLabel = context.payload.label;
    const {issue} = context.payload;

    const repositoryConfig = this.getRepositoryConfigFromIssue(issue);

    if (this.isAutomaticLabel(repositoryConfig, newLabel)) {
      const issueData = Utils.parseUrlForData(issue.url);

      // Reopen the issue
      await this.githubApiClient.issues.update({
        issue_number: issueData.number,
        owner: issueData.owner,
        repo: issueData.repo,
        state: 'open',
      });


      // Move to TBS column if new label is not To-Do => If its To-Do, it will be automatically moved to TO-DO column
      if (newLabel !== repositoryConfig.labels.todo.name) {
        const projectConfig = await this.getProjectConfigFromIssue(issue);

        await this.moveCardTo(
          issueData.number,
          issueData.owner,
          issueData.repo,
          projectConfig.kanbanColumns.toBeSpecifiedColumnId,
          this.config.maxiKanban.columns.toBeSpecifiedColumnId,
        );
      }
    }
  }
};
