const Parser = require('../src/prestashop-pull-request-parser');
const TestUtils = require('./test-utils');

const fs = require('fs');
const path = require('path');

const testUtils = new TestUtils();

describe('Prestashop Pull Request Parser', () => {
  test('parse body with one fixed issue', async () => {

    const parser = new Parser();
    const body = fs.readFileSync(path.resolve(__dirname, './datasets/pull-request-body-1.txt')).toString();

    const result = parser.parseBodyForIssuesNumbers(body);
    const expected = [9556];

    testUtils.expectArraysToBeEqual(result, expected);
  });

  test('parse body with two fixed issues', async () => {

    const parser = new Parser();
    const body = fs.readFileSync(path.resolve(__dirname, './datasets/pull-request-body-2.txt')).toString();

    const result = parser.parseBodyForIssuesNumbers(body);
    const expected = [160, 6300];

    testUtils.expectArraysToBeEqual(result, expected);
  });

  test('parse body with no fixed issue', async () => {

    const parser = new Parser();
    const body = fs.readFileSync(path.resolve(__dirname, './datasets/pull-request-body-3.txt')).toString();

    const result = parser.parseBodyForIssuesNumbers(body);
    const expected = null;

    testUtils.expectArraysToBeEqual(result, expected);
  });
});
