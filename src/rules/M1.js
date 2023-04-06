/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class M1 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const repositoryConfig = this.getRepositoryConfigFromIssue(context.payload.issue);
    const issueData = Utils.parseUrlForData(context.payload.issue.url);

    const referencedIssue = await this.issueDataProvider.getData(issueData.number, issueData.owner, issueData.repo);
    if (referencedIssue.state !== 'closed'
      && !Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.topWatchers.name)) {
      await this.githubApiClient.issues.addLabels({
        issue_number: issueData.number,
        owner: issueData.owner,
        repo: issueData.repo,
        labels: {labels: [repositoryConfig.labels.topWatchers.name]},
      });
    }
  }
};
