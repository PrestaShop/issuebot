/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
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
