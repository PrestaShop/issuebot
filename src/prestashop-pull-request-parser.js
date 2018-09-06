/**
 * 2007-2018 PrestaShop
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the Open Software License (OSL 3.0)
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * https://opensource.org/licenses/OSL-3.0
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to license@prestashop.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not edit or add to this file if you wish to upgrade PrestaShop to newer
 * versions in the future. If you wish to customize PrestaShop for your
 * needs please refer to http://www.prestashop.com for more information.
 *
 * @author    PrestaShop SA <contact@prestashop.com>
 * @copyright 2007-2018 PrestaShop SA
 * @license   https://opensource.org/licenses/OSL-3.0 Open Software License (OSL 3.0)
 * International Registered Trademark & Property of PrestaShop SA
 */
module.exports = class PrestashopPullRequestParser {

  /**
   * @param {Logger} logger
   */
  constructor (logger) {
    if (null !== logger) {
      this.logger = logger;
    }
  }

  /**
   * @param {string} body
   */
  parseBodyForIssuesNumbers (body) {
    const lines = body.split('\n');

    let ticketNumbers = null;
    lines.forEach((line) => {

      if (line.indexOf('Fixed ticket?') === -1) {
        return;
      }

      var regex = /#[0-9]+/g;
      var found = line.match(regex);

      if (null !== found) {
        ticketNumbers = found;
      }
    });

    let result = null;
    if (null !== ticketNumbers) {
      if (undefined !== this.logger) {
        this.logger.debug('[Pull Request Parser] Found ticket numbers ' + ticketNumbers.join());
      }
      result = ticketNumbers.map((ticketNumber) => {return parseInt(ticketNumber.replace('#', ''));});
    }

    return result;
  }
};
