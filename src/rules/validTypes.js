import _ from 'lodash';
import {parse} from 'jsdoctypeparser';
import iterateJsdoc from '../iterateJsdoc';

/** @param {string} tag */
const isLink = (tag) => {
  return /^(@link|@linkcode|@linkplain|@tutorial) /.test(tag);
};

const asExpression = /as\s+/;

export default iterateJsdoc(({
  jsdoc,
  report,
  utils
}) => {
  _.forEach(jsdoc.tags, (tag) => {
    const validTypeParsing = function (type) {
      try {
        parse(type);
      } catch (error) {
        if (error.name === 'SyntaxError') {
          report('Syntax error in type: ' + type, null, tag);

          return false;
        }
      }

      return true;
    };

    if (tag.tag === 'borrows') {
      const thisNamepath = tag.description.replace(asExpression, '');

      if (!asExpression.test(tag.description) || !thisNamepath) {
        report('@borrows must have an "as" expression. Found "' + tag.description + '"', null, tag);

        return;
      }

      if (validTypeParsing(thisNamepath)) {
        const thatNamepath = tag.name;

        validTypeParsing(thatNamepath);
      }
    } else if (utils.isNamepathType(tag.tag)) {
      if (utils.passesEmptyNamepathCheck(tag)) {
        return;
      }
      validTypeParsing(tag.name);
    } else if (tag.type && !isLink(tag.type)) {
      validTypeParsing(tag.type);
    }
  });
});
