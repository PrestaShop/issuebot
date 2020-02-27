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
const A1 = require('./rules/A1.js'); // eslint-disable-line no-unused-vars
const B2 = require('./rules/B2.js'); // eslint-disable-line no-unused-vars
const C1 = require('./rules/C1.js'); // eslint-disable-line no-unused-vars
const C2 = require('./rules/C2.js'); // eslint-disable-line no-unused-vars
const D1 = require('./rules/D1.js'); // eslint-disable-line no-unused-vars
const D2 = require('./rules/D2.js'); // eslint-disable-line no-unused-vars
const D3 = require('./rules/D3.js'); // eslint-disable-line no-unused-vars
const D4 = require('./rules/D4.js'); // eslint-disable-line no-unused-vars
const E1 = require('./rules/E1.js'); // eslint-disable-line no-unused-vars
const E3 = require('./rules/E3.js'); // eslint-disable-line no-unused-vars
const E4 = require('./rules/E4.js'); // eslint-disable-line no-unused-vars
const E5 = require('./rules/E5.js'); // eslint-disable-line no-unused-vars
const E6 = require('./rules/E6.js'); // eslint-disable-line no-unused-vars
const F1 = require('./rules/F1.js'); // eslint-disable-line no-unused-vars
const G2 = require('./rules/G2.js'); // eslint-disable-line no-unused-vars
const H1 = require('./rules/H1.js'); // eslint-disable-line no-unused-vars
const H2 = require('./rules/H2.js'); // eslint-disable-line no-unused-vars
const I1 = require('./rules/I1.js'); // eslint-disable-line no-unused-vars
const J1 = require('./rules/J1.js'); // eslint-disable-line no-unused-vars
const J3 = require('./rules/J3.js'); // eslint-disable-line no-unused-vars
const J4 = require('./rules/J4.js'); // eslint-disable-line no-unused-vars
const K1 = require('./rules/K1.js'); // eslint-disable-line no-unused-vars
const L1 = require('./rules/L1.js'); // eslint-disable-line no-unused-vars
const L2 = require('./rules/L2.js'); // eslint-disable-line no-unused-vars

module.exports = class RuleApplier {
  /**
   * @param config
   * @param {IssueDataProvider} issueDataProvider
   * @param {PullRequestDataProvider} pullRequestDataProvider
   * @param {ProjectCardDataProvider} projectCardDataProvider
   * @param {import('probot').GitHubApi} githubApiClient
   * @param {Logger} logger
   */
  constructor(config, issueDataProvider, pullRequestDataProvider, projectCardDataProvider, githubApiClient, logger) {
    this.config = config;
    this.issueDataProvider = issueDataProvider;
    this.pullRequestDataProvider = pullRequestDataProvider;
    this.projectCardDataProvider = projectCardDataProvider;
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
       * @type {A1|B2|C1|C2|D1|D2|D3|D4|E1|E3|E4|E5|E6|F1|G2|H1|H2|I1|J1|J3|J4|K1|L1|L2} rule
       */
      const ruleApplier = eval( // eslint-disable-line no-eval
        `new ${rule}(
        this.config,
        this.issueDataProvider,
        this.pullRequestDataProvider,
        this.projectCardDataProvider,
        this.githubApiClient,this.logger
        );`,
      );
      ruleApplier.apply(context);
    });
  }
};
