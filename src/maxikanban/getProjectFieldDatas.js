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

// Used to get the `Status` field id (current column field inside Project Next API)
module.exports.getProjectFieldDatas = (issue) => {
  console.log(issue, issue.data, issue.repository.issue.projectNextItems)
  // All these values always exist because they are in a MaxiKanban
  const projectCard = issue.repository.issue.projectNextItems.nodes[0];
  const issueNode = projectCard.fieldValues.nodes.filter((node) => node.projectField.name === 'Status')[0];

  return issueNode && issueNode.projectField ? {itemId: projectCard.id, fieldId: issueNode.projectField.id} : false;
};
