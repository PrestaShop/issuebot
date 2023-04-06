/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');

module.exports = class B2 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const issueData = Utils.parseUrlForData(context.payload.issue.url);
    const getRelatedCardPromise = await this.issueDataProvider.getRelatedCardInKanban(
      issueData.number,
      issueData.owner,
      issueData.repo,
    );
    const relatedCard = await getRelatedCardPromise;

    await this.githubApiClient.projects.deleteCard({card_id: relatedCard.id});
  }
};
