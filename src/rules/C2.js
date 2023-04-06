/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class C2 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const {issue} = context.payload;
    const projectConfig = await this.getProjectConfigFromIssue(issue);
    const issueData = Utils.parseUrlForData(issue.url);

    await this.moveCardTo(
      issueData.number,
      issueData.owner,
      issueData.repo,
      projectConfig.kanbanColumns.doneColumnId,
      this.config.maxiKanban.columns.doneColumnId,
    );
  }
};
