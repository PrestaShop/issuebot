const {Application} = require('probot');
const myProbotApp = require('..');
const TestUtils = require('./test-utils');

let testUtils = new TestUtils();

describe('PrestaShop Kanban automation app test: move issues in Kanban from status', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);
  });

  test('scenario C1: success', async () => {
    let webhookPayload = testUtils.getDefaultPayloadMock('labeled', 8);
    let githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.moveProjectCard).toHaveBeenCalledWith({
      card_id: 'z',
      position: 'bottom',
      column_id: 3311230
    });
  });

  test('scenario C1: card already in todo column', async () => {
    let webhookPayload = testUtils.getDefaultPayloadMock('labeled', 8);
    let githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    // mock customization
    githubApiClientMock.projects.getProjectCards = jest.fn().mockReturnValue(Promise.resolve({
      data:
        [{
          content_url: 'https://github.com/prestashop/test-project-bot/issues/8',
          column_url: 'https://api.github.com/projects/columns/3311230',
          id: 'aa'
        }]
    }));

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.moveProjectCard).not.toHaveBeenCalled();
  });

  test('scenario C1: not the todo label', async () => {
    let webhookPayload = testUtils.getDefaultPayloadMock('labeled', 8);
    let githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    // mock customization
    webhookPayload.issue.labels = [{
      'id': 789,
      'node_id': 'abcd',
      'url': 'https://github.com/prestashop/test-project-bot/labels/todo',
      'name': 'xyz',
      'color': 'eadd85',
      'default': false
    }];

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.moveProjectCard).not.toHaveBeenCalled();
  });
});
