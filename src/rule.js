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
   * Scenario: remove automatic status labels when closing an Issue in the kanban
   * GIVEN an open Issue
   * WHEN it is closed
   * THEN any automatic status label is removed
   * AND add the FIxed label
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
   * AND remove assignee if there is one
   */
  E5: 'E5',
  /*
   * Scenario: close the Issue in kanban when the linked PR is merged
   * GIVEN an open Issue
   * AND a Pull Request linked to it
   * WHEN the PR is merged
   * THEN close the Issue
   * AND label the issue “Fixed”
   * AND remove assignee if there is one
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
  G2: 'G2',
  /*
   * Scenario: label new Issue created in “To Do” column
   * GIVEN an Issue in any state
   * WHEN it is created into the column “To Do”
   * IF the Issue has not the label “To Do”
   * THEN add the label “To Do” to the Issue
   * AND remove all other status labels
   * AND IF the Issue is closed
   * THEN re-open it
   */
  H1: 'H1',
  /*
   * Scenario: label Issue as in progress when moved to “In progress” column
   * GIVEN an Issue in any state
   * WHEN it is moved into the column “In progress”
   * THEN add the label “WIP” to the Issue
   * AND remove all other status labels
   * AND IF the Issue is closed
   * THEN re-open it
   */
  H2: 'H2',
  /*
   * Scenario: mark Issue as in-progress if WIP PR is linked
   * WHEN a PR is linked to an Issue
   * IF the Issue is in the column “To Do” in the Kanban
   * AND IF the PR has the label “WIP”
   * THEN move the Issue into “In progress” column
   * AND remove “To Do” label if it exists
   */
  I1: 'I1',
  /*
   * Scenario: mark Issue as TBR if PR is linked
   * WHEN a PR is linked to an Issue
   * IF the PR does not have the label “WIP” OR the PR is not in draft
   * AND IF the Issue is in the column “To Do” or “In progress” in the Kanban
   * THEN move the Issue into “To be reviewed” column
   * AND remove “To Do” label if it exists
   */
  J1: 'J1',
  /*
   * Scenario: mark Issue as TBT if PR is approved
   * WHEN a PR is approved
   * IF the linked Issue is in “In To be reviewed” column
   * THEN move the Issue into “To be tested” column
   * AND add the label TBT
   * AND remove assignee if there is one
   */
  J3: 'J3',
  /*
   * Scenario: label Issue when moved to “To be tested” column
   * WHEN an Issue is moved into the column “To be tested”
   * IF the Issue has not the label “waiting for QA”
   * THEN add the label “waiting for QA” to the Issue
   */
  J4: 'J4',
  /*
   * Scenario: mark Issue as in-progress if QA disapproves
   * WHEN a PR is labeled “waiting for author”
   * IF the linked Issue is in “In To be tested” column
   * THEN move the Issue into “In progress” column
   */
  K1: 'K1',
  /*
   * Scenario: label/update Issue moved in “Done” column
   * WHEN an Issue is moved into the column “Done”
   * THEN add the label “Fixed” to the Issue
   * AND close the Issue if it is open
   * AND remove assignee if there is one
   */
  L1: 'L1',
  /*
   * Scenario: label/update Issue moved in “TBS” column
   * WHEN an Issue is moved into the column “TBS”
   * AND add the label “TBS” to the Issue
   * AND remove assignee if there is one
   */
  L2: 'L2',
  /*
   * Scenario: label/update Issue moved in “TBS” column
   * WHEN an Issue is moved into the column “TBS”
   * AND add the label “TBS” to the Issue
   * AND remove assignee if there is one
   */
};

module.exports = Rules;
