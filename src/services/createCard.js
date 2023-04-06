/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

const mutation = (projectId, contentId) => `
 mutation {
   addProjectV2ItemById(input: {projectId: "${projectId}" contentId: "${contentId}"}) {
     item {
       id
     }
   }
 }
`;

module.exports.createCard = async (githubClient, projectId, contentId) => {
  const datas = await githubClient.graphql(mutation(projectId, contentId));

  return datas;
};
