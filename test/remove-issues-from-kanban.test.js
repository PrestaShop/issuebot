const {Application} = require('probot');
const myProbotApp = require('..');
const TestUtils = require('./test-utils');

let testUtils = new TestUtils();

describe('PrestaShop Kanban automation app test: removes issues from Kanban', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);
  });

  test('scenario B2: success', async () => {
    let webhookPayload = testUtils.getDefaultIssuePayloadMock('demilestoned', 11);
    let githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.deleteProjectCard).toHaveBeenCalledWith({card_id: 'a'});
  });

  test('scenario B2: issue is not in Kanban', async () => {
    let webhookPayload = testUtils.getDefaultIssuePayloadMock('demilestoned', 13);
    let githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.deleteProjectCard).not.toHaveBeenCalled();
  });
});
