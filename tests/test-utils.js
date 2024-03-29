/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

module.exports = class TestUtils {
  /**
   * @param {string} action
   * @param {int} issueNumber
   * @param {string} label
   * @param {string} milestone
   */
  getDefaultIssuePayloadMock(action, issueNumber, label, milestone) {
    // We need a copy of this required payload (not the original one, because we mutate him in memory.)
    let payload = JSON.parse(JSON.stringify(require("./payload/issue/" + action)));

    payload = replaceInObject(payload, 'ISSUE_NUMBER', issueNumber);
    payload = replaceInObject(payload, 'ISSUE_LABEL', label);
    payload = replaceInObject(payload, 'MILESTONE', milestone);

    return payload;
  }

  /**
   * @param action
   * @param issueNumber
   * @param issueLabel
   * @param issueUserId
   * @param commentUserId
   */
  getDefaultCommentPayloadMock(action, issueNumber, issueLabel, issueUserId, commentUserId) {
    // We need a copy of this required payload (not the original one, because we mutate him in memory.)
    let payload = JSON.parse(JSON.stringify(require("./payload/comment/" + action)));

    payload = replaceInObject(payload, 'ISSUE_NUMBER', issueNumber);
    payload = replaceInObject(payload, 'ISSUE_LABEL', issueLabel);
    payload = replaceInObject(payload, 'ISSUE_USER_ID', issueUserId);
    payload = replaceInObject(payload, 'COMMENT_USER_ID', commentUserId);

    return payload;
  }

  getDefaultGithubAPIClientMock() {
    return {
      projects: {
        listCards: jest.fn().mockReturnValue(Promise.resolve({
          data:
            [
              {
                content_url: 'https://github.com/prestashop/test-project-bot/issues/8',
                column_url: 'https://api.github.com/projects/columns/8032027',
                id: 'z',
              },
              {
                content_url: 'https://github.com/prestashop/test-project-bot/issues/11',
                column_url: 'https://api.github.com/projects/columns/3311239',
                id: 'a',
              },
            ],
        })),
        createCard: jest.fn().mockReturnValue(Promise.resolve({})),
        deleteCard: jest.fn().mockReturnValue(Promise.resolve({})),
        moveCard: jest.fn().mockReturnValue(Promise.resolve({})),
      },
      issues: {
        get: jest.fn().mockReturnValue(Promise.resolve({
          data: {
            user: {
              login: 'toto',
            },
            labels: [

            ]
          }
        })),
        addLabels: jest.fn().mockReturnValue(Promise.resolve({})),
        removeLabel: jest.fn().mockReturnValue(Promise.resolve({})),
        removeAssignees: jest.fn().mockReturnValue(Promise.resolve({})),
      }
    };
  }
};

function replaceInObject (object, pattern, replacement) {
  for (const key in object) {
    if (object.hasOwnProperty(key)) {
      if (typeof object[key] === 'object') {
        object[key] = replaceInObject(object[key], pattern, replacement);
      } else if (typeof object[key] === 'string') {
        const r = new RegExp(pattern, "s");
        object[key] = object[key].replace(r, replacement);
      }
    }
  }

  return object;
}
