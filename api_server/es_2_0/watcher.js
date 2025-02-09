module.exports = function (api) {

  var httpRequestCompletionTemplate = {
    __template : {
      host: '',
      port: 80
    },
    scheme: { __one_of: [ 'http', 'https' ] },
    host: '',
    port: 80,
    path: '/',
    method: { __one_of: [ 'GET', 'PUT', 'POST', 'DELETE'] },
    headers: {},
    params: {},
    auth: {
      __template : {
        basic: {
          username: '',
          password: ''
        }
      },
      basic: {
        username: '',
        password: ''
      }
    },
    connection_timeout: '10s',
    read_timeout: '10s',
    body: '',
    response_content_type: { __one_of: [ 'json', 'yaml', 'text' ] },
    extract: [ '' ],
    proxy: {
      __template : {
        host: '',
        port: 8080
      },
      host: '',
      port: 8080,
    },
    url: ''
  };

  var searchRequestCompletionTemplate = {
    request: {
      search_type: { __one_of: [ 'query_then_fetch', 'dfs_query_then_fetch', 'query_and_fetch', 'dfs_query_and_fetch', 'scan' ] },
      indices: [],
      types: [],
      body: { __scope_link: "_search" },
      template: { __scope_link: "_search_template" },
      indices_options: {
        expand_wildcards: { __one_of: [ 'all', 'open', 'closed' ] },
        ignore_unavailable: { __one_of: [ 'true', 'false' ] },
        allow_no_indices: { __one_of: [ 'true', 'false' ] }
      }
    },
    extract: [ '' ],
    timeout: '30s'
  }

  var transformTemplate = {
    search: searchRequestCompletionTemplate,
    script: { __scope_link: "script" },
    chain: []
  };


  api.addEndpointDescription('_put_watch', {
    methods: ['PUT'],
    patterns: [ "_watcher/watch/{id}" ],
    url_params: {
      master_timeout: "",
      force: ["true", "false"]
    },
    data_autocomplete_rules: {
      trigger: {
        schedule : {
          hourly: {
            minute: {}
          },
          daily: {
            at: {
              hour: 0,
              minute: 0
            }
          },
          weekly: {
            on: 'friday',
            at: '17:00'
          },
          cron : '"0 0 12 * * ?"',
          interval: '10m'
        }
      },


      input: {
        simple: {},
        search: searchRequestCompletionTemplate,
        http: { request: httpRequestCompletionTemplate },
        chain: {
          __template: [ { simple: {} } ]
        }
      },



      condition: {
        always: {},
        never: {},
        script: { __scope_link: "script" },
        compare: {
          __template: {
            '' : {
              'gte': 5
            }
          }
        },
        array_compare: {}
      },


      transform: {
        search: searchRequestCompletionTemplate,
        script: { __scope_link: "script" },
        chain: []
      },


      actions: {
        '{field}' : {
          throttle_period: '15m',
          transform: transformTemplate,

          email: {
            __template : {
              to: '',
              body: {
                text: ''
              }
            },
            account: '',
            from: '',
            to: '',
            cc: '',
            bcc: '',
            reply_to: '',
            subject: '',
            body : {
              text: '',
              html: '',
            },
            priority: { __one_of: [ 'lowest', 'low', 'normal', 'high', 'highest' ] },
            attach_data : { format : { __one_of: [ 'yaml', 'json' ] } }
          },

          webhook: httpRequestCompletionTemplate,

          index: {
            __template: {
              index: '',
              doc_type: ''
            },
            index: '',
            doc_type: '',
            execution_time_field: '_timestamp',
            timeout: '60s'
          },

          logging: {
            __template : {
              text: ''
            },
            text: '',
            category: 'watcher.actions.logging',
            level: { __one_of: [ 'error', 'warn', 'info', 'debug', 'trace' ] }
          },

          hipchat: {
            __template: {
              message: {
                room: '#',
                body: ''
              }
            },
            account: '',
            message : {
              body: '',
              format: { __one_of: [ 'text', 'html' ] },
              color: { __one_of: [ 'yellow', 'gray', 'green', 'purple', 'red', ] },
              notify: { __one_of: [ true, false ] },
              from: '',
              room: '',
              user: ''
            }
          },

          slack: {
            __template: {
              message: {
                to: '',
                text: ''
              }
            },
            message: {
              from: '',
              to: '',
              icon: '',
              text: '',
              attachments: {},
              dynamic_attachments: {}
            }
          },

          pagerduty: {
            __template: {
              description: '',
            },
            account: '',
            description: '',
            event_type: { __one_of: [ 'trigger', 'acknowledge', 'resolve' ] },
            incident_key: '',
            client: '',
            client_url: '',
            attach_payload: {  __one_of: [ true, false ] },
            contexts: []
          }
        }
      },

      metadata: {}
    }
  });

  api.addEndpointDescription('_delete_watch', {
    methods: ['DELETE'],
    patterns: [ "_watcher/watch/{id}" ],
    url_params: {
      master_timeout: "",
      force: ["true", "false"]
    }
  });

  api.addEndpointDescription('_get_watch', {
    methods: ['GET'],
    patterns: [ "_watcher/watch/{id}" ],
  });

  api.addEndpointDescription('_activate_watch', {
    methods: ['POST', 'PUT'],
    patterns: [ "_watcher/watch/{id}/_activate" ],
    url_params: {
      master_timeout: ""
    }
  });

  api.addEndpointDescription('_deactivate_watch', {
    methods: ['POST', 'PUT'],
    patterns: [ "_watcher/watch/{id}/_deactivate" ],
    url_params: {
      master_timeout: ""
    }
  });

  api.addEndpointDescription('_execute_watch', {
    methods: ['POST', 'PUT'],
    patterns: [ "_watcher/watch/{id}/_execute", "_watcher/watch/_execute" ],
    url_params: {
      "debug": ["true", "false"]
    }
  });

  api.addEndpointDescription('_info_watch', {
    methods: ['GET'],
    patterns: [ "_watcher" ],
  });

  api.addEndpointDescription('_restart_watcher', {
    methods: ['PUT'],
    patterns: [ "_watcher/_restart" ],
  });

  api.addEndpointDescription('_start_watcher', {
    methods: ['PUT'],
    patterns: [ "_watcher/_start" ],
  });

  api.addEndpointDescription('_stop_watcher', {
    methods: ['PUT'],
    patterns: [ "_watcher/_stop" ],
  });

  api.addEndpointDescription('_stats_watcher', {
    methods: ['GET'],
    patterns: [ "_watcher/stats", "_watcher/stats/{metric}" ],
    url_components : {
      metric: [ "_all", "queued_watches", "pending_watches" ]
    },
    url_params : {
      metric: [ "_all", "queued_watches", "pending_watches" ]
    }
  });

};
