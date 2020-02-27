const {Application} = require('probot');
const myProbotApp = require('..');
const TestUtils = require('./test-utils');
const config = require('./config');

const testUtils = new TestUtils();

describe('PrestaShop Kanban automation app test: removes issues from Kanban', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);
  });

  test('scenario B2: success', async () => {
    const webhookPayload = testUtils.getDefaultPayloadMock('demilestoned', 11);
    const githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.projects.deleteCard).toHaveBeenCalledWith({card_id: 'a'});
  });

  test('scenario B2: issue is not in Kanban', async () => {
    const webhookPayload = testUtils.getDefaultPayloadMock('demilestoned', 13);
    const githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.projects.deleteCard).not.toHaveBeenCalled();
  });
});
