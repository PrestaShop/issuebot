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

module.exports = class ProjectCardRuleFinder {
  /**
     * @param config
     * @param {ConfigProvider} configProvider
     * @param {Logger} logger
     */
  constructor(config, configProvider, logger) {
    this.config = config;
    this.configProvider = configProvider;
    this.logger = logger;
  }

  /**
     * Try to find whether webhook context matches an ProjectCard rule requirements.
     *
     * @param {Context} context
     *
     * @returns {Promise<*>}
     *
     * @public
     */
  async findRules(context) {
    const rules = [];
    const config = await this.configProvider.getProjectConfigFromProjectCard(this.config, context.payload.project_card);

    if (Utils.contextHasAction(context, 'created')) {
      if (config.kanbanColumns.toDoColumnId === context.payload.project_card.column_id) {
        rules.push(Rule.G2);
      }
      if (config.kanbanColumns.inProgressColumnId === context.payload.project_card.column_id) {
        rules.push(Rule.H1);
      }
    }

    if (Utils.contextHasAction(context, 'moved')) {
      const cardColumnId = context.payload.project_card.column_id;

      if (config.kanbanColumns.toDoColumnId === cardColumnId) {
        rules.push(Rule.G2);
      }
      if (config.kanbanColumns.inProgressColumnId === cardColumnId ||
        config.kanbanColumns.toBeReviewedColumnId === cardColumnId ||
        config.kanbanColumns.toBeMergedColumnId === cardColumnId) {
        rules.push(Rule.H1);
      }
      if (config.kanbanColumns.notReadyColumnId === cardColumnId) {
        rules.push(Rule.L1);
      }
      if (config.kanbanColumns.toBeSpecifiedColumnId === cardColumnId) {
        rules.push(Rule.L3);
      }
      if (config.kanbanColumns.toBeTestedColumnId === cardColumnId) {
        rules.push(Rule.H1);
      }
      if (config.kanbanColumns.doneColumnId === cardColumnId) {
        rules.push(Rule.K1);
      }
    }

    this.logger.info(`Rules are : ${rules.join(', ')}`);

    return rules;
  }
};
