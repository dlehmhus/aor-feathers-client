'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }return target;
};

var _adminOnRest = require('admin-on-rest');

var _jwtDecode = require('jwt-decode');

var _jwtDecode2 = _interopRequireDefault(_jwtDecode);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

exports.default = function (client) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return function (type, params) {
    var _Object$assign = Object.assign({}, {
      storageKey: 'token',
      authenticate: { type: 'local' },
      permissionsKey: 'permissions',
      permissionsField: 'roles'
    }, options),
        storageKey = _Object$assign.storageKey,
        authenticate = _Object$assign.authenticate,
        permissionsKey = _Object$assign.permissionsKey,
        permissionsField = _Object$assign.permissionsField;

    switch (type) {
      case _adminOnRest.AUTH_LOGIN:
        var username = params.username,
            password = params.password;

        return client.authenticate(_extends({}, authenticate, {
          email: username,
          password: password
        }));
      case _adminOnRest.AUTH_LOGOUT:
        localStorage.removeItem(permissionsKey);
        return client.logout();
      case _adminOnRest.AUTH_CHECK:
        return localStorage.getItem(storageKey) ? Promise.resolve() : Promise.reject();
      case _adminOnRest.AUTH_ERROR:
        var code = params.code;

        if (code === 401) {
          localStorage.removeItem(storageKey);
          localStorage.removeItem(permissionsKey);
          return Promise.reject();
        }
        return Promise.resolve();
      case _adminOnRest.AUTH_GET_PERMISSIONS:
        /*
        JWT token may be providen by oauth,
        so that's why the permissions are decoded here and not in AUTH_LOGIN.
        */
        //Get the permissions from localstorage if any.
        var permissions = JSON.parse(localStorage.getItem(permissionsKey));
        //If any, provide them.
        if (permissions) {
          return Promise.resolve(permissions);
        }
        // Or find them from the token, save them and provide them.
        else {
            try {
              var jtwToken = localStorage.getItem(storageKey);
              var decodedToken = (0, _jwtDecode2.default)(jtwToken);
              var _permissions = decodedToken[permissionsField] ? decodedToken[permissionsField] : [];
              localStorage.setItem(permissionsKey, JSON.stringify(_permissions));
              return Promise.resolve(_permissions);
            } catch (e) {
              return Promise.resolve('[]');
            }
          }

      default:
        throw new Error('Unsupported FeathersJS authClient action type ' + type);
    }
  };
};

module.exports = exports['default'];