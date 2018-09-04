const {Application} = require('probot');
const myProbotApp = require('..');

describe('PrestaShop Kanban automation app test: add issues to Kanban', () => {
  let app;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);
  });

  test('scenario A1: success', async () => {
    let webhookPayload = {
      'action': 'milestoned',
      'issue': {
        'id': 12345,
        'node_id': 'abcd',
        'number': 2,
        'title': 'Milestoned issue',
        'milestone': {'title': '1.7.4.3'}
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
        createProjectCard: jest.fn().mockReturnValue(Promise.resolve({}))
      }
    };

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.createProjectCard).toHaveBeenCalledWith({
      column_id: 3311230,
      content_id: 12345,
      content_type: 'Issue'
    });
  });

  test('scenario A1: issue already exists in kanban', async () => {
    let webhookPayload = {
      'action': 'milestoned',
      'issue': {
        'id': 12345,
        'node_id': 'abcd',
        'number': 2,
        'title': 'Milestoned issue',
        'milestone': {'title': '1.7.4.3'}
      }
    };

    let githubApiClientMock = {
      projects: {
        getProjectCards: jest.fn().mockReturnValue(Promise.resolve({
          data:
            [
              {content_url: 'https://github.com/matks/test-project-bot/issues/2', id: 'z'},
              {content_url: 'https://github.com/matks/test-project-bot/issues/11', id: 'a'},
            ],
        })),
        createProjectCard: jest.fn().mockReturnValue(Promise.resolve({}))
      }
    };

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.createProjectCard).not.toHaveBeenCalled();
  });

  test('scenario A1: bad milestone', async () => {
    let webhookPayload = {
      'action': 'milestoned',
      'issue': {
        'id': 12345,
        'node_id': 'abcd',
        'number': 2,
        'title': 'Milestoned issue',
        'milestone': {'title': 'a'}
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
        createProjectCard: jest.fn().mockReturnValue(Promise.resolve({}))
      }
    };

    app.auth = () => Promise.resolve(githubApiClientMock);

    await app.receive({
      name: 'issues',
      payload: webhookPayload
    });

    expect(githubApiClientMock.projects.createProjectCard).not.toHaveBeenCalled();
  });
});
