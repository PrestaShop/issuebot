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
