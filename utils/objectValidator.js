'use strict';

const logger = require('./logger');

/**
 * Checks if the sent object has the expected structure. It will returns false if it doesn't
 * @param data The object that was sent
 * @param expected The expected structure of the object
 * @returns {boolean} Returns true if data has the expected structure
 */
function checkKeys(data, expected) {
  const expectedKeys = Object.keys(expected);

  for (let i = 0; i < expectedKeys.length; i++) {
    const expectedKey = expectedKeys[i];

    if ((!data[expectedKey] || data[expectedKey] === null) && typeof data[expectedKey] !== 'boolean') {
      logger.sendErrorMsg({
        code: logger.ErrorCodes.general,
        text: [`Key missing: ${expectedKey}`],
      });

      return false;
    }

    const dataObj = data[expectedKey];
    const expectedDataObj = expected[expectedKey];

    if (!(expectedDataObj instanceof Array) && typeof expectedDataObj === 'object') {
      return checkKeys(dataObj, expected[expectedKey]);
    }
  }

  return true;
}

/**
 * Calls checkKeys to check if the data has the expected structure
 * @param data Sent object
 * @param expected Expected structure of the object
 * @returns {boolean} Returns false if the data doesn't have the expected structure
 */
function isValidData(data, expected) {
  if ((!data || data === null) || (!expected || expected === null)) {
    logger.sendErrorMsg({
      code: logger.ErrorCodes.general,
      text: ['Data and expected structure have to be set'],
    });

    return false;
  }

  const isValid = checkKeys(data, expected);

  if (!isValid) {
    logger.sendErrorMsg({
      code: logger.ErrorCodes.general,
      text: [`Expected: ${JSON.stringify(expected)}`],
    });
  }

  return isValid;
}

exports.isValidData = isValidData;
