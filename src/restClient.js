'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _types = require('admin-on-rest/lib/rest/types');

var _debug = require('debug');

var _debug2 = _interopRequireDefault(_debug);

var _objectDiff = require('object-diff');

var _objectDiff2 = _interopRequireDefault(_objectDiff);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var dbg = (0, _debug2.default)('aor-feathers-client:rest-client');

function getIdKey(_ref) {
  var resource = _ref.resource,
      options = _ref.options;

  return options[resource] && options[resource].id || options.id || 'id';
}

exports.default = function (client) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

  var usePatch = !!options.usePatch;
  var mapRequest = function mapRequest(type, resource, params) {
    var idKey = getIdKey({ resource: resource, options: options });
    dbg('type=%o, resource=%o, params=%o, idKey=%o', type, resource, params, idKey);
    var service = client.service(resource);
    var query = {};

    switch (type) {
      case _types.GET_MANY:
        var ids = params.ids || [];
        query[idKey] = { $in: ids };
        query['$limit'] = ids.length;
        return service.find({ query: query });
      case _types.GET_MANY_REFERENCE:
        if (params.target && params.id) {
          query[params.target] = params.id;
        }
      case _types.GET_LIST:
        var _ref2 = params.pagination || {},
            page = _ref2.page,
            perPage = _ref2.perPage;

        var _ref3 = params.sort || {},
            field = _ref3.field,
            order = _ref3.order;

        var sortKey = '$sort';
        dbg('field=%o, sort-key=%o', field, sortKey);
        var sortVal = order === 'DESC' ? -1 : 1;
        if (perPage && page) {
          query['$limit'] = perPage;
          query['$skip'] = perPage * (page - 1);
        }
        if (order) {
          var orderKey = field === 'id' ? idKey : field;
          query[sortKey] = {};
          query[sortKey][orderKey] = sortVal;
        }
        Object.assign(query, params.filter);
        dbg('query=%o', query);
        return service.find({ query: query });
      case _types.GET_ONE:
        return service.get(params.id);
      case _types.UPDATE:
        if (usePatch) {
          var data = params.previousData ? (0, _objectDiff2.default)(params.previousData, params.data) : params.data;
          return service.patch(params.id, data);
        }
        return service.update(params.id, params.data);
      case _types.CREATE:
        return service.create(params.data);
      case _types.DELETE:
        return service.remove(params.id);
      default:
        throw new Error('Unsupported FeathersJS restClient action type ' + type);
    }
  };

  var mapResponse = function mapResponse(response, type, resource, params) {
    var idKey = getIdKey({ resource: resource, options: options });
    switch (type) {
      case _types.GET_ONE:
      case _types.UPDATE:
      case _types.DELETE:
        return { data: _extends({}, response, { id: response[idKey] }) };
      case _types.CREATE:
        return { data: _extends({}, params.data, { id: response[idKey] }) };
      case _types.GET_MANY_REFERENCE: // fix GET_MANY_REFERENCE missing id
      case _types.GET_MANY: // fix GET_MANY missing id
      case _types.GET_LIST:
        response.data = response.data.map(function (item) {
          if (idKey !== 'id') {
            item.id = item[idKey];
          }
          return item;
        });
        return response;
      default:
        return response;
    }
  };

  return function (type, resource, params) {
    return client.authenticate().then(function () {
      return mapRequest(type, resource, params);
    }).then(function (response) {
      return mapResponse(response, type, resource, params);
    });
  };
};

module.exports = exports['default'];
