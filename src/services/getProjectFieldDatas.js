/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// Used to get the `Status` field id (current column field inside Project Next API)
module.exports.getProjectFieldDatas = (object) => {
  // All these values always exist because they are in a MaxiKanban
  const projectCard = object.repository ? object.repository.issue.projectItems.nodes[0] : object.projectItems;

  if (!projectCard || !projectCard.project) return false;

  return {
    itemId: projectCard.id,
    fieldId: projectCard.project.field.id,
    columnId: projectCard.fieldValueByName.optionId,
  };
};
