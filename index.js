module.exports = function (kibana) {
  let { resolve, join, sep } = require('path');
  let Joi = require('joi');
  let Boom = require('boom');
  let modules = resolve(__dirname, 'public/webpackShims/');
  let src = resolve(__dirname, 'public/src/');
  let { existsSync } = require('fs');
  const { startsWith, endsWith } = require('lodash');
  let Wreck = require('wreck');
  let { fromNode: fn } = require('bluebird');

  const apps = [
    {
      title: 'Sense',
      description: 'JSON aware developer\'s interface to ElasticSearch',
      icon: 'plugins/sense/bonsai.png',
      main: 'plugins/sense/sense',
      autoload: kibana.autoload.styles,
      injectVars: function (server, options) {
        return options;
      }
    }
  ];

  if (existsSync(resolve(__dirname, 'public/tests'))) {
    apps.push({
      title: 'Sense Tests',
      id: 'sense-tests',
      main: 'plugins/sense/tests',
      autoload: kibana.autoload.styles,
      hidden: true
      //listed: false // uncomment after https://github.com/elastic/kibana/pull/4755
    });
  }

  return new kibana.Plugin({
    id: 'sense',

    config: function (Joi) {
      return Joi.object({
        enabled: Joi.boolean().default(true),
        defaultServerUrl: Joi.string().default('http://localhost:9200'),
        proxyFilter: Joi.array().items(Joi.string()).single().default(['.*']),
      }).default();
    },

    init: function (server, options) {
      const filters = options.proxyFilter.map(str => new RegExp(str));
      const usingSsl = !!(server.config().get('server.ssl.cert') && server.config().get('server.ssl.key'));

      const proxyErr = function (reply, status, uri, message) {
        reply(`Error connecting to '${uri}':\n\n${message}`).code(502).type('text/plain');
      };

      server.route({
        path: '/api/sense/exec',
        method: 'POST',
        config: {
          validate: {
            query: Joi.object().keys({
              uri: Joi.string().uri().required(),
              method: Joi.valid('HEAD', 'GET', 'PUT', 'POST', 'DELETE').required(),
            }),
          },
          payload: {
            parse: false,
            output: 'stream',
          },
        },
        handler(req, reply) {
          let { method, uri } = req.query;

          if (!filters.some(re => re.test(uri))) {
            return proxyErr(reply, 403, uri, 'Unable to send requests to that url.');
          }

          const xForwarding = {};
          if (req.info.remoteAddress && req.info.remotePort) {
            xForwarding['x-forwarded-for'] = req.info.remoteAddress;
            xForwarding['x-forwarded-port'] = req.info.remotePort;
            xForwarding['x-forwarded-proto'] = usingSsl;
          }

          Wreck.request(method, uri, {
            payload: req.payload,
            headers: {
              ...req.headers,
              ...xForwarding,
            }
          }, function (err, upResp) {
            if (err) proxyErr(reply, 503, uri, err.message);
            else reply(null, upResp);
          });
        }
      });

      server.route({
        path: '/api/sense/api_server',
        method: ['GET', 'POST'],
        handler: function (req, reply) {
          let server = require('./api_server/server');
          let {sense_version, apis} = req.query;
          if (!apis) {
            reply(Boom.badRequest('"apis" is a required param.'));
            return;
          }

          return server.resolveApi(sense_version, apis.split(","), reply);
        }
      });

      server.route({
        path: '/app/sense-tests',
        method: 'GET',
        handler: function (req, reply) {
          return reply.renderApp(kibana.uiExports.apps.hidden.byId['sense-tests']);
        }
      });
    },

    uiExports: {
      apps: apps,

      noParse: [
        join(modules, 'ace' + sep),
        join(modules, 'moment_src/moment' + sep),
        join(src, 'sense_editor/mode/worker.js')
      ]
    }
  })
};
