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
const Rule = require('../rule');
const Utils = require('./Utils');

module.exports = class PullRequestRuleFinder {
  /**
     * @param config
     * @param {IssueDataProvider} issueDataProvider
     * @param {PullRequestDataProvider} pullRequestDataProvider
     * @param {ConfigProvider} configProvider
     * @param {Logger} logger
     */
  constructor(config, issueDataProvider, pullRequestDataProvider, configProvider, logger) {
    this.config = config;
    this.logger = logger;
    this.issueDataProvider = issueDataProvider;
    this.pullRequestDataProvider = pullRequestDataProvider;
    this.configProvider = configProvider;
  }

  /**
     * Try to find whether webhook context matches an PR rule requirements.
     *
     * @param {Context} context
     *
     * @returns {Promise<*>}
     *
     * @public
     */
  async findRules(context) {
    const rules = [];

    if (Utils.contextHasAction(context, 'opened')) {
      rules.push(Rule.I1);
      rules.push(Rule.E6);

      const pullRequest = context.payload.pull_request;
      const repositoryConfig = this.configProvider.getRepositoryConfigFromPullRequest(this.config, pullRequest);

      if (Utils.issueHasLabel(pullRequest, repositoryConfig.labels.inProgress.name) || pullRequest.draft === true) {
        const issueIds = await this.pullRequestDataProvider.getReferencedIssues(
          pullRequest.number,
          context.payload.repository.owner.login,
          context.payload.repository.name,
        );
        if (issueIds.length > 0) {
          rules.push(Rule.H2);
        }
      }
    }

    if (Utils.contextHasAction(context, 'ready_for_review')) {
      const pullRequest = context.payload.pull_request;
      const repositoryConfig = this.configProvider.getRepositoryConfigFromPullRequest(this.config, pullRequest);

      if (!(Utils.issueHasLabel(pullRequest, repositoryConfig.labels.inProgress.name) || pullRequest.draft === true)) {
        const issuesData = await this.pullRequestDataProvider.getReferencedIssues(
          pullRequest.number,
          context.payload.repository.owner.login,
          context.payload.repository.name,
        );

        if (issuesData.length > 0) {
          rules.push(Rule.I1);
        }
      }
    }

    if (Utils.contextHasAction(context, 'milestoned')) {
      rules.push(Rule.E1);
    }

    if (Utils.contextHasAction(context, 'labeled')) {
      const pullRequest = context.payload.pull_request;
      const repositoryConfig = this.configProvider.getRepositoryConfigFromPullRequest(this.config, pullRequest);

      if (Utils.issueHasLabel(pullRequest, repositoryConfig.labels.toBeTested.name)) {
        rules.push(Rule.E3);
      }

      if (Utils.issueHasLabel(pullRequest, repositoryConfig.labels.toBeMerged.name)) {
        rules.push(Rule.L2);
      }

      if (Utils.issueHasLabel(pullRequest, repositoryConfig.labels.toBeMerged.name)) {
        const nbApprovals = await this.pullRequestDataProvider.getNumberOfApprovals(
          pullRequest.number,
          context.payload.repository.owner.login,
          context.payload.repository.name,
        );
        if (nbApprovals >= repositoryConfig.nbRequiredApprovals) {
          rules.push(Rule.E4);
        } else {
          const issueComment = context.issue({body: 'QA OK without required approvals !? :trollface:'});
          context.github.issues.createComment(issueComment);
        }
      }
      if (Utils.issueHasLabel(pullRequest, repositoryConfig.labels.inProgress.name) || pullRequest.draft === true) {
        const issueIds = await this.pullRequestDataProvider.getReferencedIssues(
          pullRequest.number,
          context.payload.repository.owner.login,
          context.payload.repository.name,
        );
        if (issueIds.length > 0) {
          rules.push(Rule.H2);
        }
      }
      if (Utils.issueHasLabel(pullRequest, repositoryConfig.labels.waitingAuthor.name)) {
        rules.push(Rule.J4);
      }
    }

    if (Utils.contextHasAction(context, 'closed')) {
      rules.push(Rule.E5);
    }

    if (Utils.contextHasAction(context, 'edited')) {
      const pullRequest = context.payload.pull_request;
      const owner = context.payload.repository.owner.login;
      const repo = context.payload.repository.name;

      if (context.payload.changes.body) {
        const repositoryConfig = this.configProvider.getRepositoryConfigFromPullRequest(this.config, pullRequest);

        const issuesData = await this.pullRequestDataProvider.getReferencedIssues(pullRequest.number, owner, repo);

        if (issuesData.length > 0) {
          if (
            (Utils.issueHasLabel(pullRequest, repositoryConfig.labels.inProgress.name) || pullRequest.draft === true)
          ) {
            rules.push(Rule.H2);
          } else {
            rules.push(Rule.I1);
          }
        }
        const issues = await this.getIssues(issuesData);

        for (let index = 0; index < issues.length; index += 1) {
          if (issues[index].state === 'closed') {
            rules.push(Rule.E6);

            break;
          }
        }
      }
    }

    this.logger.info(`Rules are : ${rules.join(', ')}`);

    return rules;
  }

  /**
   * Get issues objects by given data
   *
   * @param {array} issuesData
   * @returns {Promise<[]>}
   */
  async getIssues(issuesData) {
    const issues = [];
    for (let index = 0; index < issuesData.length; index += 1) {
      const issueData = issuesData[index];
      const issue = await this.issueDataProvider.getData(issueData.number, issueData.owner, issueData.repo);

      issues.push(issue);
    }

    return issues;
  }
};
