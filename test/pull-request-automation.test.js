const {Application} = require('probot');
const myProbotApp = require('..');
const TestUtils = require('./test-utils');

let testUtils = new TestUtils();

describe('PrestaShop Kanban automation app test: pull request automation', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);
  });

  test('scenario E1: success', async () => {
    let webhookPayload = testUtils.getDefaultPullRequestPayloadMock('milestoned', 13);
    let githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.issues.edit).toHaveBeenCalledWith({
      owner: 'matks',
      repo: 'test-project-bot',
      number: 12,
      milestone: '1.7.4.3'
    });
  });

  test('scenario E1: no issue linked', async () => {
    let webhookPayload = testUtils.getDefaultPullRequestPayloadMock('milestoned', 13);
    let githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    // mock customization
    webhookPayload.issue.body = '';

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.issues.edit).not.toHaveBeenCalled();
  });

  test('scenario E1: issue already milestoned', async () => {
    let webhookPayload = testUtils.getDefaultPullRequestPayloadMock('milestoned', 13);
    let githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();

    // mock customization
    githubApiClientMock.issues.get = jest.fn().mockReturnValue(Promise.resolve({
      data:
        [
          {milestone: 'a', id: 'a'},
        ],
    }));

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.issues.edit).not.toHaveBeenCalled();
  });
});
