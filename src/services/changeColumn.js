/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const {createCard} = require('./createCard');
const {getProjectFieldDatas} = require('./getProjectFieldDatas');
const config = require('../../config.js');

const mutation = (projectId, itemId, fieldId, value) => `
  mutation {
    updateProjectV2ItemFieldValue(
      input: {
        projectId: "${projectId}"
        itemId: "${itemId}"
        fieldId: "${fieldId}"
        value: {
          singleSelectOptionId: "${value}"
        }
      }
    ) {
      projectV2Item {
        id
      }
    }
  }
`;

module.exports.changeColumn = async (githubClient, issue, projectId, value) => {
  const fieldDatas = getProjectFieldDatas(issue);

  // In case the card doesn't have any column
  if (!fieldDatas) {
    await createCard(githubClient, config.maxiKanban.id, issue.repository.issue.id);

    return false;
  }

  // If it has a column, it can be moved because it's an update operation
  const datas = await githubClient.graphql(mutation(projectId, fieldDatas.itemId, fieldDatas.fieldId, value));

  return datas;
};
