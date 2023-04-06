/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

// GraphQL Datas are different than the REST API, we need IDs from the GraphQL API
const query = (nodeId) => `
  {
    node(id: "${nodeId}") {
      ... on ProjectV2Item {
        id
        fieldValueByName(name: "Status") {
          ... on ProjectV2ItemFieldSingleSelectValue {
            id
            name
            optionId
          }
        }
      }
    }
  }
`;

module.exports.getStatus = async (githubClient, nodeId) => {
  const datas = await githubClient.graphql(query(nodeId));

  return datas;
};
