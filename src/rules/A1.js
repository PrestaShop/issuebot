/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');

module.exports = class A1 extends Rule {
  /**
   * Apply Rule A1
   *
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const todoColumnId = this.config.kanbanColumns.toDoColumnId;
    const issueId = context.payload.issue.id;

    await this.githubApiClient.projects.createCard({
      column_id: todoColumnId,
      content_id: issueId,
      content_type: 'Issue',
    });
  }
};
