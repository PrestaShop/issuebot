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
var Rule = require('./rule.js');

module.exports = class RuleApplier {

  /**
   * @param config
   * @param {GithubAPI} githubApiClient
   * @param {Logger} logger
   */
  constructor (config, githubApiClient, logger) {
    this.config = config;
    this.githubApiClient = githubApiClient;
    this.logger = logger;
  }

  /**
   * @param {string} rule
   * @param {Context} context
   */
  applyRule (rule, context) {
    this.logger.debug('Applying rule ' + rule);

    switch (rule) {
      case Rule.A1:
        this.applyRuleA1(context);
        break;

      default:
        this.logger.error('Cannot apply ' + rule);
    }
  }

  /**
   * Apply Rule A1
   *
   * @param {Context} context
   *
   * @private
   */
  applyRuleA1 (context) {
    const todoColumnId = this.config.kanbanColumns.toDoColumnId;
    const issueId = context.payload.issue.id;

    this.githubApiClient.projects.createProjectCard({
      column_id: todoColumnId,
      content_id: issueId,
      content_type: 'Issue'
    });
  }
};
