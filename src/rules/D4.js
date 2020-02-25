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

module.exports = class D4 extends Rule {

    /**
     * @param {Context} context
     *
     * @public
     */
    async apply(context) {
        if (this.isAutomaticLabel(context.payload.label)) {
            const issueId = context.payload.issue.number;

            for (const label of context.payload.issue.labels) {
                if (this.isAutomaticLabel(label)) {
                    this.logger.info(`[Rule Applier] D4 - Remove label ${label.name}`);

                    await this.githubApiClient.issues.update({
                        issue_number: issueId,
                        owner: context.payload.repository.owner.login,
                        repo: context.payload.repository.name,
                        state: 'open'
                    })
                }
            }
        }
    }
};