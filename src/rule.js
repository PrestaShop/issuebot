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
  /* Scenarios A: Add an Issue to the kanban */
  A1: 'A1',
  /*
   * Scenario: Auto-add an Issue to the kanban when setting the milestone
   * GIVEN an Issue not in the kanban
   * WHEN it is milestoned for the next patch or minor release
   * THEN it is added to the kanban in "To Do" column
   */

  /* Scenarios B: Remove Issue from the kanban */
  B2: 'B2',
  /*
   * Scenario: remove an Issue from the kanban when the milestone is unset
   * GIVEN an Issue in the kanban
   * WHEN its milestone is unset
   * THEN remove the Issue from the kanban
   */

  /* Scenarios C: Move issue in the kanban according to its status */
  C1: 'C1',
  /*
   * Scenario: place an Issue in the "To do" column according to its label
   * GIVEN an Issue in the kanban not in the "To do" column
   * WHEN it is labeled "To Do"
   * THEN it is placed in the "To do" column
   */
  C2: 'C2',
  /*
   * Scenario: place an Issue in the "Done" column when it is closed
   * GIVEN an Issue in the kanban not in the "Done" column
   * WHEN it is closed
   * THEN it is placed in the "Done" column
   */
  D1: 'D1',
  /*
   * Scenario: make automatic status labels mutually exclusive
   * GIVEN an Issue
   * WHEN it is labeled using one of the automatic status labels
   * THEN any other automatic status label is removed
   */
  D2: 'D2',
  /*
   * Scenario: label an Issue when it is reopened
   * GIVEN a closed Issue
   * WHEN it is reopened
   * AND there is no other automatic label
   * THEN labeled it “To Do”
   */
  D3: 'D3',
  /*
   * Scenario: remove status label when closing an Issue
   * GIVEN an open Issue
   * WHEN it is closed
   * THEN any automatic status label is removed
   */
  D4: 'D4',
  /*
   * Scenario: reopen an Issue when its status label is changed
   * GIVEN a closed Issue
   * WHEN it is labeled using one of the automatic status labels
   * THEN it is reopened
   */
  E1: 'E1',
  /*
   * Scenario: reflect the Pull Request milestone in the linked Issue
   * GIVEN an open Issue
   * AND a Pull Request linked to it
   * WHEN the PR is set to a milestone
   * THEN apply that milestone to the Issue
   */
  E3: 'E3',
  /*
   * Scenario: move Issue in kanban to the “To be tested” column when the linked PR is ready for test
   * GIVEN an open Issue
   * AND a Pull Request linked to it
   * WHEN the PR is labeled “Waiting for QA”
   * THEN move the linked issue to the “To be tested” column
   */
  E4: 'E4',
  /*
   * Scenario: move Issue in kanban to the “To be merged” column when the linked PR is ready for merge
   * GIVEN an open Issue
   * AND a Pull Request linked to it
   * WHEN the PR is labeled “QA ✅”
   * IF the PR is approved
   * THEN move the linked issue to the “To be merged” column
   */
  E5: 'E5',
  /*
   * Scenario: close the Issue in kanban when the linked PR is merged
   * GIVEN an open Issue
   * AND a Pull Request linked to it
   * WHEN the PR is merged
   * THEN close the Issue
   * AND label the issue “Fixed”
   */
  E6: 'E6',
  /*
   * Scenario: linking a PR to a closed issue re-opens it
   * GIVEN a closed Issue
   * WHEN a Pull Request is linked to it via “Fixes #123”
   * THEN re-open the Issue
   * AND apply the PR automation rules to update it
   */
  F1: 'F1',
  /*
   * Scenario: requesting changes in a PR moves the linked issue to the “In progress” column
   * GIVEN an open Issue
   * AND a Pull Request linked to it
   * WHEN changes are requested in the PR
   * THEN move the linked Issue to the “In progress” column
   */
  F2: 'F2'
  /*
   * Scenario: requesting changes in a PR moves the linked issue to the “In progress” column
   * GIVEN an open Issue
   * AND a Pull Request linked to it
   * WHEN changes are requested in the PR
   * THEN move the linked Issue to the “In progress” column
   */
};

module.exports = Rules;
