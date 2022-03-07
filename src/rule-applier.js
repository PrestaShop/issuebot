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
/* eslint-disable no-unused-vars */
const C1 = require('./rules/C1.js');
const C2 = require('./rules/C2.js');
const C3 = require('./rules/C3.js');
const D1 = require('./rules/D1.js');
const D2 = require('./rules/D2.js');
const D3 = require('./rules/D3.js');
const D4 = require('./rules/D4.js');
const E1 = require('./rules/E1.js');
const E3 = require('./rules/E3.js');
const E4 = require('./rules/E4.js');
const E5 = require('./rules/E5.js');
const E6 = require('./rules/E6.js');
const F1 = require('./rules/F1.js');
const G2 = require('./rules/G2.js');
const H1 = require('./rules/H1.js');
const H2 = require('./rules/H2.js');
const I1 = require('./rules/I1.js');
const J1 = require('./rules/J1.js');
const J3 = require('./rules/J3.js');
const J4 = require('./rules/J4.js');
const K1 = require('./rules/K1.js');
const L1 = require('./rules/L1.js');
const L2 = require('./rules/L2.js');
const L3 = require('./rules/L3.js');
const M1 = require('./rules/M1.js');
const M2 = require('./rules/M2.js');
const Rule = require('./rules/Rule.js');
/* eslint-enable */

module.exports = class RuleApplier {
  /**
   * @param config
   * @param {IssueDataProvider} issueDataProvider
   * @param {PullRequestDataProvider} pullRequestDataProvider
   * @param {ProjectCardDataProvider} projectCardDataProvider
   * @param {ConfigProvider} configProvider
   * @param {import('probot').GitHubApi} githubApiClient
   * @param {Logger} logger
   */
  constructor(
    config,
    issueDataProvider,
    pullRequestDataProvider,
    projectCardDataProvider,
    configProvider,
    githubApiClient,
    logger,
  ) {
    this.config = config;
    this.issueDataProvider = issueDataProvider;
    this.pullRequestDataProvider = pullRequestDataProvider;
    this.projectCardDataProvider = projectCardDataProvider;
    this.configProvider = configProvider;
    this.githubApiClient = githubApiClient;
    this.logger = logger;
  }

  /**
   * @param {array} rules
   * @param {Context} context
   */
  applyRules(rules, context) {
    rules.forEach((rule) => {
      this.logger.debug(`[Rule Applier] Applying rule ${rule}`);

      /**
       * @type {Rule} rule
       */
      const ruleApplier = eval( // eslint-disable-line no-eval
        `new ${rule}(
        this.config,
        this.issueDataProvider,
        this.pullRequestDataProvider,
        this.projectCardDataProvider,
        this.configProvider,
        this.githubApiClient,this.logger
        );`,
      );
      ruleApplier.apply(context);
    });
  }
};
