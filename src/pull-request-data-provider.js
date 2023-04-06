/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const {graphql} = require('@octokit/graphql');
const {createAppAuth} = require('@octokit/auth-app');
const DomParser = require('dom-parser');
const Utils = require('./ruleFinder/Utils');

module.exports = class PullRequestDataProvider {
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
   * Get pull_request informations
   *
   * @param {int} pullRequestId
   * @param {string} owner
   * @param {string} repo
   *
   * @returns {Promise<boolean>}
   */
  async getData(pullRequestId, owner, repo) {
    return this.githubApiClient.pulls.get({
      pull_number: pullRequestId,
      owner,
      repo,
    });
  }

  /**
   * Get data of issues linked to a pull_request
   *
   * @param {int} pullRequestNumber
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<[]>}
   */
  async getReferencedIssues(pullRequestNumber, owner, repo) {
    const issues = [];
    console.log(`App id: ${process.env.APP_ID}`);
    const auth = createAppAuth({
      id: process.env.APP_ID,
      privateKey: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
      installationId: process.env.INSTALLATION_ID,
    });
    const graphqlWithAuth = graphql.defaults({
      request: {
        hook: auth.hook,
      },
    });

    /**
     * Full PullRequest nodes. Can help
     *
     * activeLockReason,
     * additions,
     * author { login },
     * authorAssociation,
     * baseRefName,
     * baseRefOid,
     * body,
     * bodyHTML,
     * bodyText,
     * changedFiles,
     * checksResourcePath,
     * checksUrl,
     * closed,
     * closedAt,
     * createdAt,
     * createdViaEmail,
     * databaseId,
     * deletions,
     * editor { login },
     * headRefName,
     * headRefOid,
     * hovercard { contexts { message } },
     * id,
     * includesCreatedEdit,
     * isCrossRepository,
     * lastEditedAt,
     * locked,
     * maintainerCanModify,
     * mergeable,
     * merged,
     * mergedAt,
     * mergedBy { login },
     * milestone { title },
     * number,
     * permalink,
     * potentialMergeCommit { message },
     * publishedAt,
     * repository { name },
     * resourcePath,
     * revertResourcePath,
     * revertUrl,
     * state,
     * suggestedReviewers { reviewer { login } },
     * title,
     * updatedAt,
     * url,
     * viewerCanApplySuggestion,
     * viewerCanReact,
     * viewerCanSubscribe,
     * viewerCanUpdate,
     * viewerCannotUpdateReasons,
     * viewerDidAuthor,
     * viewerSubscription
     */

    try {
      const {repository} = await graphqlWithAuth(
        `{
            repository(owner: "${owner}", name: "${repo}") {
              pullRequest(number: ${pullRequestNumber}) {
                bodyHTML
              }
            }
          }
        `,
      );

      const bodyHtml = repository.pullRequest.bodyHTML;

      const element = (new DomParser()).parseFromString(bodyHtml, 'text/html');
      const issueLinks = element.getElementsByClassName('issue-link');

      issueLinks.forEach((issueLink) => {
        const issueUrl = issueLink.getAttribute('data-url');

        if (issueUrl) {
          issues.push(Utils.parseUrlForData(issueUrl));
        }
      });
    } catch (error) {
      this.logger.error(`[Pull Request data Provider] Error when getting list issues : ${error.message}`);
    }

    return issues;
  }

  /**
   * Get number of approvals for a given pull_request
   *
   * @param {int} pullRequestId
   * @param {string} owner
   * @param {string} repo
   * @returns {Promise<number>}
   */
  async getNumberOfApprovals(pullRequestId, owner, repo) {
    const reviews = await this.githubApiClient.pulls.listReviews({
      pull_number: pullRequestId,
      owner,
      repo,
      per_page: 100,
    });

    let nbApprovals = 0;
    reviews.data.forEach((review) => {
      if (review.state === 'APPROVED') {
        nbApprovals += 1;
      }
    });

    return nbApprovals;
  }
};
