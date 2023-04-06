/**
 * Copyright (c) Since 2007 PrestaShop.
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
/**
 * @param issue
 * @param {string} labelTitle
 *
 * @returns {boolean}
 */
module.exports.issueHasLabel = (issue, labelTitle) => {
  if (Object.prototype.hasOwnProperty.call(issue, 'labels') === false) {
    return false;
  }

  const issueLabels = issue.labels;

  for (let index = 0; index < issueLabels.length; index += 1) {
    const currentLabel = issueLabels[index];
    if (Object.prototype.hasOwnProperty.call(currentLabel, 'name') && currentLabel.name === labelTitle) {
      return true;
    }
  }

  return false;
};

/**
 * @param {Context} context
 * @param {string} actionName
 *
 * @returns {boolean}
 */
module.exports.contextHasAction = (context, actionName) => (context.payload.action === actionName);

/**
 * Parse a github URL to extract Issue / Pull Request informations
 *
 * @param {string} url
 *
 * @returns {object}
 */
module.exports.parseUrlForData = (url) => {
  const matches = url.match(/(.+)\/(.+)\/(.+)\/issues\/(\d+)/);

  return {
    number: parseInt(matches[4], 10),
    owner: matches[2],
    repo: matches[3],
  };
};
