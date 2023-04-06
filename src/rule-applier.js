/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
