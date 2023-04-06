/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('../rule');
const Utils = require('./Utils');

module.exports = class PullRequestReviewRuleFinder {
  /**
     * @param config
     * @param {PullRequestDataProvider} pullRequestDataProvider
     * @param {ConfigProvider} configProvider
     * @param {Logger} logger
     */
  constructor(config, pullRequestDataProvider, configProvider, logger) {
    this.config = config;
    this.pullRequestDataProvider = pullRequestDataProvider;
    this.configProvider = configProvider;
    this.logger = logger;
  }

  /**
   * Try to find whether webhook context matches an PR reviews rule requirements.
   *
   * @param {Context} context
   *
   * @returns {Promise<*>}
   *
   * @public
   */
  async findRules(context) {
    const rules = [];
    if (Utils.contextHasAction(context, 'submitted')) {
      if (context.payload.review.state === 'changes_requested') {
        rules.push(Rule.F1);
      }
      if (context.payload.review.state === 'approved') {
        const pullRequest = context.payload.pull_request;
        const repositoryConfig = this.configProvider.getRepositoryConfigFromPullRequest(this.config, pullRequest);
        const nbApprovals = await this.pullRequestDataProvider.getNumberOfApprovals(
          pullRequest.number,
          context.payload.repository.owner.login,
          context.payload.repository.name,
        );

        if (nbApprovals >= repositoryConfig.nbRequiredApprovals) {
          rules.push(Rule.J1);
        }
      }
    }

    this.logger.info(`Rules are : ${rules.join(', ')}`);

    return rules;
  }
};
