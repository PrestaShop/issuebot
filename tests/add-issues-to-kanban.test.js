const {Application} = require('probot');
const myProbotApp = require('..');
const TestUtils = require('./test-utils');
const config = require('./config');

const testUtils = new TestUtils();

describe('PrestaShop Kanban automation app test: add issues to Kanban', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);
  });

  test('scenario A1: success', async () => {
    const webhookPayload = testUtils.getDefaultPayloadMock('milestoned', 2);
    const githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.projects.createCard).toHaveBeenCalledWith({
      column_id: config.kanbanColumns.toDoColumnId,
      content_id: 12345,
      content_type: 'Issue',
    });
  });

  test('scenario A1: issue already exists in kanban', async () => {
    const webhookPayload = testUtils.getDefaultPayloadMock('milestoned', 2);
    const githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    // mock customization
    githubApiClientMock.projects.listCards = jest.fn().mockReturnValue(Promise.resolve({
      data:
        [
          {content_url: 'https://github.com/prestashop/test-project-bot/issues/2', id: 'z'},
          {content_url: 'https://github.com/prestashop/test-project-bot/issues/11', id: 'a'},
        ],
    }));

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.projects.createCard).not.toHaveBeenCalled();
  });

  test('scenario A1: bad milestone', async () => {
    const webhookPayload = testUtils.getDefaultPayloadMock('milestoned', 2);
    const githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    // mock customization
    webhookPayload.issue.milestone = {title: 'a'};

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.projects.createCard).not.toHaveBeenCalled();
  });
});
