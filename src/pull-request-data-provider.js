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
const {graphql} = require('@octokit/graphql');
const {createAppAuth} = require('@octokit/auth-app');
const DomParser = require('dom-parser');
const fs = require('fs')


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
   * @param {int} pullRequestId
   * @param {string} owner
   * @param {string} repo
   *
   * @returns {Promise<boolean>}
   */
  async getData(pullRequestId, owner, repo) {
    const data = await this.githubApiClient.pulls.get({
      pull_number: pullRequestId,
      owner,
      repo,
    });

    return data;
  }

  async getReferencedIssues(pullRequestNumber, owner, repo) {
    const issues = [];
    const privateKey = await fs.readFileSync(process.env.PRIVATE_KEY_PATH, 'utf8');
    const auth = createAppAuth({
      id: process.env.APP_ID,
      privateKey,
      installationId: 6855379,
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
          issues.push(this.parseUrlForData(issueUrl));
        }
      });
    } catch (error) {
      this.logger.error(`[Pull Request data Provider] Error when getting list issues : ${error.message}`);
    }

    return issues;
  }

  async getNumberOfApprovals(pullRequestId, owner, repo) {
    const reviews = await this.githubApiClient.pulls.listReviews({
      pull_number: pullRequestId,
      owner,
      repo,
    });

    let nbApprovals = 0;
    reviews.data.forEach((review) => {
      if (review.state === 'APPROVED') {
        nbApprovals += 1;
      }
    });

    return nbApprovals;
  }

  /**
   * Parse a github URL to extract Issue / Pull Request ID
   *
   * @param {string} url
   *
   * @returns {int}
   */
  parseUrlForId(url) {
    return parseInt(url.substr(url.lastIndexOf('/') + 1), 10);
  }

  /**
   * Parse a github URL to extract Issue / Pull Request informations
   *
   * @param {string} url
   *
   * @returns {object}
   */
  parseUrlForData(url) {
    const matches = url.match(/(.+)\/(.+)\/(.+)\/issues\/(\d+)/);

    return {
      number: parseInt(matches[4], 10),
      owner: matches[2],
      repo: matches[3],
    };
  }
};
