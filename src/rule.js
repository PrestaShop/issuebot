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

/**
 * These Rules describe how the automation of the PrestaShop Kanban project
 * should behave
 *
 * @type {{A1: string, B2: string}}
 */
const Rules = {
  A1: 'A1',
  /*
   * Scenario: Auto-add an Issue to the kanban when setting the milestone
   * GIVEN an Issue not in the kanban
   * WHEN it is milestoned for the next patch or minor release
   * THEN it is added to the kanban in "To Do" column
   */
  B2: 'B2',
  /*
   * Scenario: remove an Issue from the kanban when the milestone is unset
   * GIVEN an Issue in the kanban
   * WHEN its milestone is unset
   * THEN remove the Issue from the kanban
   */
};

module.exports = Rules;
