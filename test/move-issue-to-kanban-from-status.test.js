const {Application} = require('probot');
const myProbotApp = require('..');

describe('PrestaShop Kanban automation app test: move issues in Kanban from status', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);
  });

  test('scenario C1: success', async () => {
    let webhookPayload = {
      'action': 'labeled',
      'issue': {
        'id': 12345,
        'node_id': 'abcd',
        'number': 2,
        'title': 'Labeled todo issue',
      }
    };

    let githubApiClientMock = {
      projects: {
        getProjectCards: jest.fn().mockReturnValue(Promise.resolve({
          data:
            [{
              content_url: 'https://github.com/matks/test-project-bot/issues/2',
              column_url: 'https://api.github.com/projects/columns/3311239',
              id: 'aa'
            }]
        })),
        moveProjectCard: jest.fn().mockReturnValue(Promise.resolve({}))
      }
    };

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.moveProjectCard).toHaveBeenCalledWith({
      card_id: 'aa',
      position: 'bottom',
      column_id: 3311230
    });
  });

  test('scenario C1: card already in todo column', async () => {
    let webhookPayload = {
      'action': 'labeled',
      'issue': {
        'id': 12345,
        'node_id': 'abcd',
        'number': 2,
        'title': 'Labeled todo issue',
      }
    };

    let githubApiClientMock = {
      projects: {
        getProjectCards: jest.fn().mockReturnValue(Promise.resolve({
          data:
            [{
              content_url: 'https://github.com/matks/test-project-bot/issues/2',
              column_url: 'https://api.github.com/projects/columns/3311230',
              id: 'aa'
            }]
        })),
        moveProjectCard: jest.fn().mockReturnValue(Promise.resolve({}))
      }
    };

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.moveProjectCard).not.toHaveBeenCalled();
  });
});
