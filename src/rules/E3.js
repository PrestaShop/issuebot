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
const Rule = require('./Rule.js');
const Utils = require('../ruleFinder/Utils');
const {getIssue} = require('../maxikanban/getIssue');
const {changeColumn} = require('../maxikanban/changeColumn');

module.exports = class E3 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const pullRequestId = context.payload.pull_request.number;
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const referencedIssuesData = await this.pullRequestDataProvider.getReferencedIssues(
      pullRequestId,
      owner,
      repo,
    );

    if (referencedIssuesData.length > 0) {
      for (let index = 0; index < referencedIssuesData.length; index += 1) {
        const referencedIssueData = referencedIssuesData[index];

        const referencedIssue = await this.issueDataProvider.getData(
          referencedIssueData.number,
          referencedIssueData.owner,
          referencedIssueData.repo,
        );
        const repositoryConfig = this.getRepositoryConfigFromIssue(referencedIssue);
        const projectConfig = await this.getProjectConfigFromIssue(referencedIssue);

        // Remove automatic labels
        await this.removeIssueAutomaticLabels(referencedIssue, owner, repo);

        // Remove WIP label
        if (Utils.issueHasLabel(referencedIssue, repositoryConfig.labels.inProgress.name)) {
          // Remove label toBeTested
          await this.githubApiClient.issues.removeLabel({
            issue_number: referencedIssueData.number,
            owner: referencedIssueData.owner,
            repo: referencedIssueData.repo,
            name: repositoryConfig.labels.inProgress.name,
          });
        }

        // Move card in toBeTested column
        this.logger.info(
          `E3 - Moving issue #${referencedIssueData.number} card in ToBeTested linked to #${pullRequestId}`
        );
        const issueGraphqlData = await getIssue(this.githubApiClient, referencedIssueData.repo, referencedIssueData.owner, referencedIssueData.number);

        await changeColumn(
          this.githubApiClient,
          issueGraphqlData,
          projectConfig.maxiKanban.id,
          projectConfig.maxiKanban.columns.toBeTestedColumnId,
        );

        await this.moveCardTo(
          referencedIssueData.number,
          referencedIssueData.owner,
          referencedIssueData.repo,
          projectConfig.kanbanColumns.toBeTestedColumnId,
        );

        // Remove the previous assignee
        // await this.githubApiClient.issues.removeAssignees({
        //   issue_number: referencedIssueData.number,
        //   owner: referencedIssueData.owner,
        //   repo: referencedIssueData.repo,
        //   assignees: context.payload.pull_request.user.login,
        // });
      }
    }
  }
};
