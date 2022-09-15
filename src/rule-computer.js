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
const IssueRuleFinder = require('./ruleFinder/IssueRuleFinder.js');
const IssueCommentsRuleFinder = require('./ruleFinder/IssueCommentsRuleFinder.js');
const PullRequestRuleFinder = require('./ruleFinder/PullRequestRuleFinder.js');
const PullRequestReviewRuleFinder = require('./ruleFinder/PullRequestReviewRuleFinder.js');
const ProjectCardRuleFinder = require('./ruleFinder/ProjectCardRuleFinder.js');

module.exports = class RuleComputer {
  /**
   * @param config
   * @param {IssueDataProvider} issueDataProvider
   * @param {IssueCommentsDataProvider} issueCommentsDataProvider
   * @param {PullRequestDataProvider} pullRequestDataProvider
   * @param {ProjectCardDataProvider} projectCardDataProvider
   * @param {ConfigProvider} configProvider
   * @param {Logger} logger
   */
  constructor(
    config,
    issueDataProvider,
    issueCommentsDataProvider,
    pullRequestDataProvider,
    projectCardDataProvider,
    configProvider,
    logger,
  ) {
    this.config = config;
    this.logger = logger;
    this.issueDataProvider = issueDataProvider;
    this.issueCommentsDataProvider = issueCommentsDataProvider;
    this.pullRequestDataProvider = pullRequestDataProvider;
    this.projectCardDataProvider = projectCardDataProvider;
    this.configProvider = configProvider;

    this.issueRuleFinder = new IssueRuleFinder(
      this.config,
      this.issueDataProvider,
      this.configProvider,
      this.logger,
    );
    this.issueCommentsRuleFinder = new IssueCommentsRuleFinder(
      this.config,
      this.issueCommentsDataProvider,
      this.configProvider,
      this.logger,
    );
    this.pullRequestRuleFinder = new PullRequestRuleFinder(
      this.config,
      this.issueDataProvider,
      this.pullRequestDataProvider,
      this.configProvider,
      this.logger,
    );
    this.pullRequestReviewRuleFinder = new PullRequestReviewRuleFinder(
      this.config,
      this.pullRequestDataProvider,
      this.configProvider,
      this.logger,
    );
    this.projectCardRuleFinder = new ProjectCardRuleFinder(
      this.config,
      this.configProvider,
      this.logger,
      this.projectCardDataProvider,
      this.issueDataProvider,
    );
  }

  /**
   * Try to find whether webhook context matches a rule requirements.
   *
   * @param {Context} context
   *
   * @returns {Promise<*>}
   */
  async findRules(context) {
    if (context.payload.action) {
      this.logger.info(`[Rule Computer] Context action is ${context.payload.action}`);
      if (context.payload.pull_request) {
        this.logger.info(`[Rule Computer] Context target is Pull request ${context.payload.pull_request.title}`);
      } else if (context.payload.issue) {
        this.logger.info(`[Rule Computer] Context target is Issue [${context.payload.issue.title}]`);
      } else if (context.payload.project_card) {
        this.logger.info(`[Rule Computer] Context target is Project card ${context.payload.project_card.title}`);
      }
    }

    switch (context.name) {
      case 'issues':
        /**
         * Got this case one time, added this specific case
         */
        if (context.payload.pull_request || context.payload.issue.pull_request) {
          this.logger.debug('[Rule Computer] Got this case one time, added this specific case');
          return this.pullRequestRuleFinder.findRules(context);
        }

        this.logger.debug('[Rule Computer] Context type is issue');

        return this.issueRuleFinder.findRules(context);

      case 'pull_request':
        this.logger.debug('[Rule Computer] Context type is Pull Request');

        return this.pullRequestRuleFinder.findRules(context);

      case 'pull_request_review':
        this.logger.debug('[Rule Computer] Context type is Pull Request');

        return this.pullRequestReviewRuleFinder.findRules(context);

      case 'project_card':
        this.logger.debug('[Rule Computer] Context type is Project Card');

        return this.projectCardRuleFinder.findRules(context);

      case 'projects_v2_item':
        this.logger.debug('[Rule Computer] Context type is Project v2 item');

        return this.projectCardRuleFinder.findProjectv2Rules(context);

      case 'issue_comment':
        this.logger.info('[Rule Computer] Context type is issue comment');

        return this.issueCommentsRuleFinder.findRules(context);

      default:
        this.logger.debug(`[Rule Computer] No rule applies to ${context.name}`);
    }

    return [];
  }
};
