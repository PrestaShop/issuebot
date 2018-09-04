/**
 * 2007-2018 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2018 PrestaShop SA
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */
module.exports = class IssueDataProvider {

  /**
   * @param config
   * @param {GithubAPI} githubApiClient
   * @param {Logger} logger
   */
  constructor (config, githubApiClient, logger) {
    this.config = config;
    this.githubApiClient = githubApiClient;
    this.logger = logger;
  }

  /**
   * @param {int} issueId
   * @returns {Promise<boolean>}
   */
  async isIssueInTheKanban (issueId) {
    var cardsPromise = this.githubApiClient.projects.getProjectCards(
      {column_id: this.config.kanbanColumns.toDoColumnId}
    );

    var allTodoCards = await cardsPromise;

    for (var index = 0; index < allTodoCards.data.length; index++) {

      var currentCard = allTodoCards.data[index];
      if (currentCard.hasOwnProperty('content_url') == false) {
        continue;
      }

      var cardUrl = currentCard.content_url;
      var currentIssueId = this.parseCardUrlForId(cardUrl);

      if (issueId == currentIssueId) {
        return true;
      }
    }

    return false;
  }

  /**
   * Parse a github URL to extract Issue / Pull Request ID
   *
   * @param {string} url
   *
   * @returns {string}
   *
   * @private
   */
  parseCardUrlForId (url) {
    return url.substr(url.lastIndexOf('/') + 1);
  }
};
