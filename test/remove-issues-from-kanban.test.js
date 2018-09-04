const {Application} = require('probot');
const myProbotApp = require('..');

describe('PrestaShop Kanban automation app test: removes issues from Kanban', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);

  });

  test('scenario B2: success', async () => {
    let webhookPayload = {
      'action': 'demilestoned',
      'issue': {
        'id': 12345,
        'node_id': 'abcd',
        'number': 11,
        'title': 'Unmilestoned issue',
        'milestone': null,
      }
    };

    let githubApiClientMock = {
      projects: {
        getProjectCards: jest.fn().mockReturnValue(Promise.resolve({
          data:
            [
              {content_url: 'https://github.com/matks/test-project-bot/issues/8', id: 'z'},
              {content_url: 'https://github.com/matks/test-project-bot/issues/11', id: 'a'},
            ],
        })),
        deleteProjectCard: jest.fn().mockReturnValue(Promise.resolve({}))
      }
    };
    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.deleteProjectCard).toHaveBeenCalledWith({card_id: 'a'});
  });

  test('scenario B2: issue is not in Kanban', async () => {
    let webhookPayload = {
      'action': 'demilestoned',
      'issue': {
        'id': 12345,
        'node_id': 'abcd',
        'number': 13,
        'title': 'Unmilestoned issue',
        'milestone': null,
      }
    };

    let githubApiClientMock = {
      projects: {
        getProjectCards: jest.fn().mockReturnValue(Promise.resolve({
          data:
            [
              {content_url: 'https://github.com/matks/test-project-bot/issues/8', id: 'z'},
              {content_url: 'https://github.com/matks/test-project-bot/issues/11', id: 'a'},
            ],
        })),
        deleteProjectCard: jest.fn().mockReturnValue(Promise.resolve({}))
      }
    };
    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.deleteProjectCard).not.toHaveBeenCalled();
  });
});
