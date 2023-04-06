/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');

module.exports = class D1 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const repositoryConfig = this.getRepositoryConfigFromIssue(context.payload.issue);

    if (this.isAutomaticLabel(repositoryConfig, context.payload.label)) {
      // Remove all other automatic labels except the one added
      await this.removeIssueAutomaticLabels(
        context.payload.issue,
        context.payload.repository.owner.login,
        context.payload.repository.name,
        context.payload.label,
      );
    }
  }
};
