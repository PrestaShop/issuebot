/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');

module.exports = class D3 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const {issue} = context.payload;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const repositoryConfig = await this.getRepositoryConfigFromIssue(issue);

    // await this.githubApiClient.issues.addLabels({
    //   issue_number: parseInt(issue.number, 10),
    //   owner,
    //   repo,
    //   labels: {labels: [repositoryConfig.labels.fixed.name]},
    // });

    await this.removeIssueAutomaticLabels(issue, owner, repo, repositoryConfig.labels.fixed);
  }
};
