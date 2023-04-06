/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Utils = require('./ruleFinder/Utils');

module.exports = class IssueDataProvider {
  /**
   * @param config
   * @param {import('probot').GitHubApi} githubApiClient
   * @param {Logger} logger
   */
  constructor(config, githubApiClient, logger) {
    this.config = config;
    this.githubApiClient = githubApiClient;
    this.logger = logger;

    /* used to store all project cards once it has been downloaded */
    this.allCardsCache = null;
  }

  /**
   * @param {int} issueId
   * @param {string} issueOwner
   * @param {string} issueRepo
   *
   * @returns {Promise<*>}
   */
  async getRelatedCardInKanban(issueId, issueOwner, issueRepo) {
    const allCardsPromise = this.getAllCardsInKanban();
    const allCards = await allCardsPromise;

    let currentCard;
    for (let index = 0; index < allCards.length; index += 1) {
      currentCard = allCards[index];
      const cardData = Utils.parseUrlForData(currentCard.content_url);
      if (
        Object.prototype.hasOwnProperty.call(currentCard, 'content_url')
          && issueId === parseInt(cardData.number, 10)
          && issueOwner === cardData.owner
          && issueRepo === cardData.repo
      ) {
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
  async getAllCardsInKanban() {
    if (this.allCardsCache !== null) {
      return this.allCardsCache;
    }

    // @todo: what about column "up next" ?
    const vars = [
      'notReadyColumnId',
      'toDoColumnId',
      'toBeSpecifiedColumnId',
      'inProgressColumnId',
      'toBeReviewedColumnId',
      'toBeTestedColumnId',
      'toBeMergedColumnId',
      'doneColumnId',
    ];

    // => NOTE_REPLACE_CONFIG => Can we have project as param ?
    const allCards = [];
    for (let i = 0; i < this.config.repositories.length; i += 1) {
      const repositoryConfig = this.config.repositories[i];

      for (let j = 0; j < repositoryConfig.projects.length; j += 1) {
        const projectConfig = repositoryConfig.projects[j];

        await Promise.all(vars.map(async (value) => {
          if (projectConfig.kanbanColumns[value]) {
            const cards = await this.githubApiClient.projects.listCards({
              column_id: projectConfig.kanbanColumns[value],
            });
            cards.data = cards.data.map((card) => {
              card.projectConfig = projectConfig;

              return card;
            });
            allCards.push(cards.data);
          }
        }));
      }
    }

    this.allCardsCache = Array.prototype.concat.apply([], allCards);

    return this.allCardsCache;
  }

  /**
   * @param {int} issueId
   * @param {string} owner
   * @param {string} repo
   *
   * @returns {Promise<*>}
   */
  async getData(issueId, owner, repo) {
    const {data} = await this.githubApiClient.issues.get({
      issue_number: issueId,
      owner,
      repo,
    });

    return data;
  }

  /**
   * Parse a github URL to extract Issue / Pull Request ID
   *
   * @param {string} url
   *
   * @returns {string}
   */
  parseCardUrlForId(url) {
    return url.substr(url.lastIndexOf('/') + 1);
  }
};
