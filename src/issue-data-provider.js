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

    /* used to store all project cards once it has been downloaded */
    this.allCardsCache = null;
    /* store downloaded issues data */
    this.issuesCacheById = {};
  }

  /**
   * @param {int} issueId
   *
   * @returns {Promise<boolean>}
   */
  async isIssueInTheKanban (issueId) {

    const cardPromise = this.getRelatedCardInKanban(issueId);
    const card = await cardPromise;

    return (card !== null);
  }

  /**
   * @param {int} issueId
   *
   * @returns {Promise<*>}
   */
  async getRelatedCardInKanban (issueId) {

    const allCardsPromise = this.getAllCardsInKanban();
    const allCards = await allCardsPromise;

    let currentCard;

    for (let index = 0; index < allCards.length; index++) {

      currentCard = allCards[index];
      if (currentCard.hasOwnProperty('content_url') === false) {
        continue;
      }

      if (issueId === parseInt(this.parseCardUrlForId(currentCard.content_url))) {
        return currentCard;
      }
    }

    return null;
  }

  /**
   *
   * @param {int} issueNumber
   * @returns {Promise<*>}
   */
  async getIssue (issueNumber) {

    if (this.issuesCacheById.hasOwnProperty(issueNumber)) {
      return this.issuesCacheById[issueNumber];
    }

    // @todo: check what happens if bad response
    const issue = await this.githubApiClient.issues.get({
      owner: this.config.repository.owner,
      repo: this.config.repository.name,
      number: issueNumber
    });

    this.issuesCacheById[issueNumber] = issue;

    return this.issuesCacheById[issueNumber];
  }

  /**
   * Fetch all Kanban columns to get all cards
   *
   * @todo: check whether it can be replaced by a "search card" however Github REST API v3
   * provides search for commits, issues, repos ... but not cards
   *
   * @returns {Promise<T[]>}
   */
  async getAllCardsInKanban () {

    if (this.allCardsCache !== null) {
      return this.allCardsCache;
    }

    // @todo: what about column "up next" ?
    const vars = [
      'toDoColumnId',
      'inProgressColumnId',
      'toBeReviewedColumnId',
      'toBeTestedColumnId',
      'toBerMergedColumnId',
      'doneColumnId',
    ];

    const allCards = [];
    // @todo: handle bad responses
    await Promise.all(vars.map(async (value) => {
      const cards = await this.githubApiClient.projects.getProjectCards({column_id: this.config.kanbanColumns[value]});
      allCards.push(cards.data);

    }));

    this.allCardsCache = Array.prototype.concat.apply([], allCards);

    return this.allCardsCache;
  }

  /**
   * Parse a github URL to extract Issue / Pull Request ID
   *
   * @param {string} url
   *
   * @returns {string}
   */
  parseCardUrlForId (url) {
    return url.substr(url.lastIndexOf('/') + 1);
  }
};
