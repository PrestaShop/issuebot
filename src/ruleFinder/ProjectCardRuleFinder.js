/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const Rule = require('../rule');
const Utils = require('./Utils');
const {deleteCard} = require('../services/deleteCard');
const {changeColumn} = require('../services/changeColumn');
const {getIssue} = require('../services/getIssue');
const {createCard} = require('../services/createCard');
const {getStatus} = require('../services/getStatus');
const {getIssueByNodeId} = require('../services/getIssue.js');
const {getProjectFieldDatas} = require('../services/getProjectFieldDatas');

module.exports = class ProjectCardRuleFinder {
  /**
     * @param config
     * @param {ConfigProvider} configProvider
     * @param {ProjectCardDataProvider} projectCardDataProvider
     * @param {Logger} logger
     */
  constructor(config, configProvider, logger, projectCardDataProvider, issueDataProvider) {
    this.config = config;
    this.configProvider = configProvider;
    this.projectCardDataProvider = projectCardDataProvider;
    this.logger = logger;
    this.issueDataProvider = issueDataProvider;
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
      const fieldDatas = getProjectFieldDatas(issueGraphqlData);

      // Setup the GraphQL query to save some line of codes
      const mimicColumnMove = async (maxiKanbanColumnId) => {
        if (
          fieldDatas.columnId !== this.config.maxiKanban.columns.sandboxColumnId
          || maxiKanbanColumnId === this.config.maxiKanban.columns.toBeTestedColumnId
        ) {
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
        }

        return false;
      };

      // If it has been created in the not ready column, add it to the sandbox column in the maxi kanban
      if (!cardColumnId) {
        return mimicColumnMove(this.config.maxiKanban.columns.sandboxColumnId);
      }

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
      if (config.kanbanColumns.notReadyColumnId !== context.payload.project_card.column_id) {
        await mooveInSameColumn(cardColumnId);
      } else {
        await mooveInSameColumn();
      }
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

      if (config.kanbanColumns.notReadyColumnId !== cardColumnId) {
        await mooveInSameColumn(cardColumnId);
      }
    }

    if (Utils.contextHasAction(context, 'deleted') && config) {
      const issueGraphqlData = await getIssue(context.github, issueRepo, issueOwner, issueId);
      await deleteCard(context.github, this.config.maxiKanban.id, issueGraphqlData);
    }

    this.logger.info(`Rules are : ${rules.join(', ')}`);

    return rules;
  }

  /**
     * Try to find whether webhook context matches an Project v2 Item rule requirements.
     *
     * @param {Context} context
     *
     * @returns {Promise<*>}
     *
     * @public
     */
  async findProjectv2Rules(context) {
    const config = this.config.maxiKanban;
    const {node: {fieldValueByName: {optionId: cardColumnId}}} = await getStatus(
      context.github,
      context.payload.projects_v2_item.node_id,
    );

    const mooveInSameColumn = async () => {
      const {
        node: {
          number: issueId,
          repository: {name: repo, owner: {login: owner}},
        },
      } = await getIssueByNodeId(context.github, context.payload.projects_v2_item.content_node_id);

      const relatedCard = await this.issueDataProvider.getRelatedCardInKanban(issueId, owner, repo);

      if (!relatedCard) return;

      // Setup the GraphQL query to save some line of codes
      const mimicColumnMove = async (kanbanColumnId) => {
        await context.github.projects.moveCard({
          card_id: relatedCard.id,
          position: 'bottom',
          column_id: kanbanColumnId,
        });
      };

      if (config.columns.toDoColumnId === cardColumnId) {
        mimicColumnMove(relatedCard.projectConfig.kanbanColumns.toDoColumnId);
      }

      if (config.columns.inProgressColumnId === cardColumnId) {
        mimicColumnMove(relatedCard.projectConfig.kanbanColumns.inProgressColumnId);
      }

      if (config.columns.toBeReviewedColumnId === cardColumnId) {
        mimicColumnMove(relatedCard.projectConfig.kanbanColumns.toBeReviewedColumnId);
      }

      if (config.columns.toBeMergedColumnId === cardColumnId) {
        mimicColumnMove(relatedCard.projectConfig.kanbanColumns.toBeMergedColumnId);
      }

      if (config.columns.notReadyColumnId === cardColumnId) {
        mimicColumnMove(relatedCard.projectConfig.kanbanColumns.notReadyColumnId);
      }

      if (config.columns.toBeSpecifiedColumnId === cardColumnId) {
        mimicColumnMove(relatedCard.projectConfig.kanbanColumns.toBeSpecifiedColumnId);
      }

      if (config.columns.toBeTestedColumnId === cardColumnId) {
        mimicColumnMove(relatedCard.projectConfig.kanbanColumns.toBeTestedColumnId);
      }

      if (config.columns.doneColumnId === cardColumnId) {
        mimicColumnMove(relatedCard.projectConfig.kanbanColumns.doneColumnId);
      }
    };

    if (Utils.contextHasAction(context, 'edited')) {
      mooveInSameColumn();
    }

    return [];
  }
};
