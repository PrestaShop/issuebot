/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class C3 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const {issue} = context.payload;
    const issueData = Utils.parseUrlForData(issue.url);
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    await this.githubApiClient.issues.update({
      issue_number: issueData.number,
      owner,
      repo,
      state: 'closed',
    });
  }
};
