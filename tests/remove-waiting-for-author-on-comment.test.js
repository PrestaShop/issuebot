/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
const { Application } = require('probot')
const myProbotApp = require('../index')
const TestUtils = require('./test-utils');

const testUtils = new TestUtils();
const { configTestRepository } = require('./config');

describe('Remove `Waiting for author`  label on comment', () => {
  let app;
  let githubApiClientMock;

  beforeEach(() => {
    app = new Application();
    app.load(myProbotApp);
    githubApiClientMock = testUtils.getDefaultGithubAPIClientMock();
    app.auth = () => Promise.resolve(githubApiClientMock);
  });

  test('scenario M2: issue with WFA label and new comment from issue author', async () => {
    const webhookPayload = testUtils.getDefaultCommentPayloadMock(
      'created',
      10,
      configTestRepository.labels.waitingAuthor.name,
      123,
      123
    );

    await app.receive({
      name: 'issue_comment',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.issues.removeLabel).toHaveBeenCalled();
  });

  test('scenario M2: issue with WFA label and new comment not from issue author', async () => {
    const webhookPayload = testUtils.getDefaultCommentPayloadMock(
      'created',
      20,
      configTestRepository.labels.waitingAuthor.name,
      123,
      200
    );

    await app.receive({
      name: 'issue_comment',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.issues.removeLabel).not.toHaveBeenCalled();
  });

  test('scenario M2: issue without WFA label and new comment from issue author', async () => {
    const webhookPayload = testUtils.getDefaultCommentPayloadMock(
      'created',
      20,
      configTestRepository.labels.todo.name,
      123,
      123
    );

    await app.receive({
      name: 'issue_comment',
      payload: webhookPayload,
    });

    expect(githubApiClientMock.issues.removeLabel).not.toHaveBeenCalled();
  });

});
