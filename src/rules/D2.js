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

module.exports = class D2 extends Rule {
  /**
   * @param {Context} context
   *
   * @public
   */
  async apply(context) {
    const {issue} = context.payload;
    const issueId = parseInt(issue.number, 10);
    const owner = context.payload.repository.owner.login;
    const repo = context.payload.repository.name;

    const repositoryConfig = await this.getRepositoryConfigFromIssue(issue);
    const projectConfig = await this.getProjectConfigFromIssue(issue);

    if (Utils.issueHasLabel(issue, repositoryConfig.labels.fixed.name)) {
      this.logger.info(`[Rule Applier] D2 - Remove label ${repositoryConfig.labels.fixed.name}`);
      await this.githubApiClient.issues.removeLabel({
        issue_number: issueId,
        owner,
        repo,
        name: repositoryConfig.labels.fixed.name,
      });
    }

    this.logger.info(`[Rule Applier] D2 - Add label ${repositoryConfig.labels.toBeSpecified.name}`);
    await this.githubApiClient.issues.addLabels({
      issue_number: issueId,
      owner,
      repo,
      labels: {labels: [repositoryConfig.labels.toBeSpecified.name]},
    });

    await this.moveCardTo(
      issueId,
      owner,
      repo,
      projectConfig.kanbanColumns.toBeSpecifiedColumnId,
    );
  }
};
