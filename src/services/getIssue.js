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

// GraphQL Datas are different than the REST API, we need IDs from the GraphQL API
const query = (repositoryName, owner, issueId) => `
  {
    repository(name: "${repositoryName}", owner: "${owner}") {
      issue(number: ${issueId}) {
        id
        title
        createdAt
        projectItems(first: 100) {
          nodes {
            id
            project {
              field(name: "Status") {
                ... on ProjectV2SingleSelectField {
                  id
                  name
                }
              }
            }
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
    }
  }
`;

const queryByNodeId = (nodeId) => `
  {
    node(id: "${nodeId}") {
      ... on Issue {
        id
        number
        state
        repository {
          name
          owner {
            id
            login
          }
        }
      }
    }
  }
`;

module.exports.getIssue = async (githubClient, repositoryName, owner, issueId) => {
  const datas = await githubClient.graphql(query(repositoryName, owner, issueId));

  return datas;
};

module.exports.getIssueByNodeId = async (githubClient, nodeId) => {
  const datas = await githubClient.graphql(queryByNodeId(nodeId));

  return datas;
};
