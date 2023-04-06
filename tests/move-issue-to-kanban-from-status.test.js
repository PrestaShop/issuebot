/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const {Application} = require('probot');
const myProbotApp = require('..');
const TestUtils = require('./test-utils');

const testUtils = new TestUtils();
const config = require('./config');

describe('PrestaShop Kanban automation app test: move issues in Kanban from status', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);
  });

  test('scenario C2: card already in done column', async () => {
    const webhookPayload = testUtils.getDefaultPayloadMock('closed', 8, config.labels.fixed.name, config.milestones.next_patch_milestone);
    const githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    // mock customization
    githubApiClientMock.projects.listCards = jest.fn().mockReturnValue(Promise.resolve({
      data:
        [{
          content_url: 'https://github.com/prestashop/test-project-bot/issues/8',
          column_url: 'https://api.github.com/projects/columns/3329348',
          id: 'aa',
        }],
    }));

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.projects.moveCard).not.toHaveBeenCalled();
  });

  test('scenario C2: not the kanban', async () => {
    const webhookPayload = testUtils.getDefaultPayloadMock('closed', 20, config.labels.fixed.name, '1.7.6.4');
    const githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.projects.moveCard).not.toHaveBeenCalled();
  });
});
