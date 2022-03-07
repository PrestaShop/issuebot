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
const {deleteCard} = require('../maxikanban/deleteCard');
const {changeColumn} = require('../maxikanban/changeColumn');
const {getIssue} = require('../maxikanban/getIssue');
const {createCard} = require('../maxikanban/createCard');

module.exports = class ProjectCardRuleFinder {
  /**
     * @param config
     * @param {ConfigProvider} configProvider
     * @param {ProjectCardDataProvider} projectCardDataProvider
     * @param {Logger} logger
     */
  constructor(config, configProvider, logger, projectCardDataProvider) {
    this.config = config;
    this.configProvider = configProvider;
    this.projectCardDataProvider = projectCardDataProvider;
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
    const issueId = await this.projectCardDataProvider.getRelatedIssueId(context.payload.project_card);
    const issueOwner = context.payload.repository.owner.login;
    const issueRepo = context.payload.repository.name;

    // So we don't duplicate all these conditions
    const mooveInSameColumn = async (cardColumnId) => {
      const issueGraphqlData = await getIssue(context.github, issueRepo, issueOwner, issueId);

      // Setup the GraphQL query to save some line of codes
      const mimicColumnMove = async (maxiKanbanColumnId) => {
        const datas = await changeColumn(
          context.github,
          issueGraphqlData,
          this.config.maxiKanban.id,
          maxiKanbanColumnId,
        );

        if (!datas) {
          setTimeout(() => {
            mooveInSameColumn(cardColumnId);
          }, 3000);

          return false;
        }

        return datas;
      };

      if (config.kanbanColumns.toDoColumnId === cardColumnId) {
        return mimicColumnMove(this.config.maxiKanban.columns.toDoColumnId);
      }

      if (config.kanbanColumns.inProgressColumnId === cardColumnId) {
        return mimicColumnMove(this.config.maxiKanban.columns.inProgressColumnId);
      }

      if (config.kanbanColumns.toBeReviewedColumnId === cardColumnId) {
        return mimicColumnMove(this.config.maxiKanban.columns.toBeReviewedColumnId);
      }

      if (config.kanbanColumns.toBeMergedColumnId === cardColumnId) {
        return mimicColumnMove(this.config.maxiKanban.columns.toBeMergedColumnId);
      }

      if (config.kanbanColumns.notReadyColumnId === cardColumnId) {
        return mimicColumnMove(this.config.maxiKanban.columns.notReadyColumnId);
      }

      if (config.kanbanColumns.toBeSpecifiedColumnId === cardColumnId) {
        return mimicColumnMove(this.config.maxiKanban.columns.toBeSpecifiedColumnId);
      }

      if (config.kanbanColumns.toBeTestedColumnId === cardColumnId) {
        return mimicColumnMove(this.config.maxiKanban.columns.toBeTestedColumnId);
      }

      if (config.kanbanColumns.doneColumnId === cardColumnId) {
        return mimicColumnMove(this.config.maxiKanban.columns.doneColumnId);
      }

      return false;
    };


    if (Utils.contextHasAction(context, 'created')) {
      const issueGraphqlData = await getIssue(context.github, issueRepo, issueOwner, issueId);
      const cardColumnId = context.payload.project_card.column_id;

      if (config.kanbanColumns.toDoColumnId === context.payload.project_card.column_id) {
        rules.push(Rule.G2);
      }
      if (config.kanbanColumns.inProgressColumnId === context.payload.project_card.column_id) {
        rules.push(Rule.H1);
      }

      await createCard(context.github, this.config.maxiKanban.id, issueGraphqlData.repository.issue.id);
      await mooveInSameColumn(cardColumnId);
    }

    if (Utils.contextHasAction(context, 'moved')) {
      const cardColumnId = context.payload.project_card.column_id;

      if (config.kanbanColumns.toDoColumnId === cardColumnId) {
        rules.push(Rule.G2);
      }

      if (config.kanbanColumns.inProgressColumnId === cardColumnId) {
        rules.push(Rule.H1);
      }

      if (config.kanbanColumns.toBeReviewedColumnId === cardColumnId) {
        rules.push(Rule.H1);
      }

      if (config.kanbanColumns.toBeMergedColumnId === cardColumnId) {
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

      await mooveInSameColumn(cardColumnId);
    }

    if (Utils.contextHasAction(context, 'deleted')) {
      const issueGraphqlData = await getIssue(context.github, issueRepo, issueOwner, issueId);
      await deleteCard(context.github, this.config.maxiKanban.id, issueGraphqlData);
    }

    this.logger.info(`Rules are : ${rules.join(', ')}`);

    return rules;
  }
};
