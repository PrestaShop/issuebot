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

module.exports = class IssueRuleFinder {

    /**
     * @param config
     * @param {IssueDataProvider} issueDataProvider
     * @param {Logger} logger
     */
    constructor(config, issueDataProvider, logger) {
        this.config = config;
        this.logger = logger;
        this.issueDataProvider = issueDataProvider;
    }
    /**
     * Try to find whether webhook context matches an Issue rule requirements.
     *
     * @param {Context} context
     *
     * @returns {Promise<*>}
     *
     * @public
     */
    async findRules (context) {

        const rules = [];
        if (Utils.contextHasAction(context, 'milestoned')) {
            const milestone = context.payload.issue.milestone.title;

            if ((milestone === this.config.milestones.next_minor_milestone) ||
                (milestone === this.config.milestones.next_patch_milestone)) {
                const issueId = context.payload.issue.number;
                const isIssueInKanbanPromise = this.issueDataProvider.isIssueInTheKanban(issueId);
                const isIssueInKanban = await isIssueInKanbanPromise;

                if (isIssueInKanban === false) {
                    rules.push(Rule.A1);
                }
            }
        }

        if (Utils.contextHasAction(context, 'demilestoned')) {
            const issueId = context.payload.issue.number;
            const isIssueInKanbanPromise = this.issueDataProvider.isIssueInTheKanban(issueId);
            const isIssueInKanban = await isIssueInKanbanPromise;

            if (isIssueInKanban === true) {
                rules.push(Rule.B2);
            }
        }

        if (Utils.contextHasAction(context, 'labeled')) {
            const issue = context.payload.issue;
            const issueId = issue.number;

            rules.push(Rule.D1);

            if (issue.state === 'closed' && context.payload.label.name !== this.config.labels.fixed.name) {
                rules.push(Rule.D4);
            }

            if (context.payload.label.name === this.config.labels.toBeMerged.name) {
                rules.push(Rule.L2);
            }

            const getCardInKanbanPromise = this.issueDataProvider.getRelatedCardInKanban(issueId);
            const getCardInKanban = await getCardInKanbanPromise;

            if (getCardInKanban !== null) {
                const cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(getCardInKanban.column_url));

                if (this.config.kanbanColumns.toDoColumnId !== cardColumnId && Utils.issueHasLabel(issue, this.config.labels.todo.name)) {
                    rules.push(Rule.C1);
                }
            }
        }

        if (Utils.contextHasAction(context, 'closed')) {
            rules.push(Rule.D3);

            const issueId = context.payload.issue.number;
            const getCardInKanbanPromise = this.issueDataProvider.getRelatedCardInKanban(issueId);
            const getCardInKanban = await getCardInKanbanPromise;

            if (getCardInKanban !== null) {
                const cardColumnId = parseInt(this.issueDataProvider.parseCardUrlForId(getCardInKanban.column_url));

                if (this.config.kanbanColumns.doneColumnId !== cardColumnId) {
                    rules.push(Rule.C2);
                }
            }
        }

        if (Utils.contextHasAction(context, 'reopened')) {
            rules.push(Rule.D2);
        }

        this.logger.info('Rules are : ' + rules.join(', '))

        return rules;
    }

}