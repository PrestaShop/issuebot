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
  }

  /**
   * @param {int} issueId
   *
   * @returns {Promise<boolean>}
   */
  async isIssueInTheKanban (issueId) {

    let cardPromise = this.getRelatedCardInKanban(issueId);
    let card = await cardPromise;

    return (card !== null);
  }

  /**
   * @param {int} issueId
   *
   * @returns {Promise<*>}
   */
  async getRelatedCardInKanban (issueId) {

    let allCardsPromise = this.getAllCardsInKanban();
    let allCards = await allCardsPromise;

    for (let index = 0; index < allCards.length; index++) {

      let currentCard = allCards[index];
      if (currentCard.hasOwnProperty('content_url') == false) {
        continue;
      }

      let cardUrl = currentCard.content_url;
      let currentIssueId = this.parseCardUrlForId(cardUrl);

      if (issueId == currentIssueId) {
        return currentCard;
      }
    }

    return null;
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
    let todoCardsPromise = this.githubApiClient.projects.getProjectCards({column_id: this.config.kanbanColumns.toDoColumnId});
    let inProgressCardsPromise = this.githubApiClient.projects.getProjectCards({column_id: this.config.kanbanColumns.inProgressColumnId});
    let toBeReviewedCardsPromise = this.githubApiClient.projects.getProjectCards({column_id: this.config.kanbanColumns.toBeReviewedColumnId});
    let toBeTestedCardsPromise = this.githubApiClient.projects.getProjectCards({column_id: this.config.kanbanColumns.toBeTestedColumnId});
    let toBeMergedCardsPromise = this.githubApiClient.projects.getProjectCards({column_id: this.config.kanbanColumns.toBerMergedColumnId});
    let doneCardsPromise = this.githubApiClient.projects.getProjectCards({column_id: this.config.kanbanColumns.doneColumnId});

    let allTodoCards = await todoCardsPromise;
    let allInProgressCards = await inProgressCardsPromise;
    let allToBeReviewedCards = await toBeReviewedCardsPromise;
    let allToBeTestedCards = await toBeTestedCardsPromise;
    let allToBeMergedCards = await toBeMergedCardsPromise;
    let allDoneCards = await doneCardsPromise;

    this.allCardsCache = Array.prototype.concat.apply([],
      [
        allTodoCards.data,
        allInProgressCards.data,
        allToBeReviewedCards.data,
        allToBeTestedCards.data,
        allToBeMergedCards.data,
        allDoneCards.data
      ]
    );

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
