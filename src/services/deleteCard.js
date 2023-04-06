/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const {getProjectFieldDatas} = require('./getProjectFieldDatas');

const mutation = (projectId, itemId) => `
 mutation {
    deleteProjectV2Item(
      input: {
        projectId: "${projectId}"
        itemId: "${itemId}"
      }
    ) {
      deletedItemId
    }
  }
`;

module.exports.deleteCard = async (githubClient, projectId, issue) => {
  const fieldDatas = getProjectFieldDatas(issue);

  const datas = await githubClient.graphql(mutation(projectId, fieldDatas.itemId));

  return datas;
};
