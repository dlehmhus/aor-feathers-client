'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.restClient = exports.authClient = undefined;

var _authClient2 = require('./authClient');

var _authClient3 = _interopRequireDefault(_authClient2);

var _restClient2 = require('./restClient');

var _restClient3 = _interopRequireDefault(_restClient2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

exports.authClient = _authClient3.default;
exports.restClient = _restClient3.default;