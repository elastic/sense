/**
 * ELASTICSEARCH CONFIDENTIAL
 * _____________________________
 *
 *  [2014] Elasticsearch Incorporated All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of Elasticsearch Incorporated and its suppliers,
 * if any.  The intellectual and technical concepts contained
 * herein are proprietary to Elasticsearch Incorporated
 * and its suppliers and may be covered by U.S. and Foreign Patents,
 * patents in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from Elasticsearch Incorporated.
 */

let ace = require('ace');
let $ = require('jquery');
let ZeroClipboard = require('zeroclip');
let ext_searchbox = require('ace/ext-searchbox');
let Autocomplete = require('./autocomplete');
let mappings = require('./mappings');
let output = require('./output');
let SenseEditor = require('./sense_editor/editor');
let settings = require('./settings');
let utils = require('./utils');
let es = require('./es');
let history = require('./history');


var input = new SenseEditor($('#editor'));

input.autocomplete = new Autocomplete(input);

input.$actions = $("#editor_actions");

input.commands.addCommand({
  name: 'auto indent request',
  bindKey: {win: 'Ctrl-I', mac: 'Command-I'},
  exec: function () {
    input.autoIndent();
  }
});
input.commands.addCommand({
  name: 'move to previous request start or end',
  bindKey: {win: 'Ctrl-Up', mac: 'Command-Up'},
  exec: function () {
    input.moveToPreviousRequestEdge()
  }
});
input.commands.addCommand({
  name: 'move to next request start or end',
  bindKey: {win: 'Ctrl-Down', mac: 'Command-Down'},
  exec: function () {
    input.moveToNextRequestEdge()
  }
});


/**
 * COPY AS CURL
 *
 * Since the copy functionality is powered by a flash movie (via ZeroClipboard)
 * the only way to trigger the copy is with a litteral mouseclick from the user.
 *
 * The original shortcut will now just open the menu and highlight the
 *
 */
var $copyAsCURL = $('#copy_as_curl');
var zc = (function setupZeroClipboard() {
  var zc = new ZeroClipboard($copyAsCURL); // the ZeroClipboard instance

  zc.on('wrongflash noflash', function () {
    if (!localStorage.getItem('flash_warning_shown')) {
      alert('Sense needs flash version 10.0 or greater in order to provide "Copy as cURL" functionality');
      localStorage.setItem('flash_warning_shown', 'true');
    }
    $copyAsCURL.hide();
  });

  zc.on('ready', function () {
    function setupCopyButton(cb) {
      cb = typeof cb === 'function' ? cb : $.noop;
      $copyAsCURL.css('visibility', 'hidden');
      input.getRequestsAsCURL(function (curl) {
        $copyAsCURL.attr('data-clipboard-text', curl);
        $copyAsCURL.css('visibility', 'visible');
        cb();
      });
    }

    input.$actions.on('mouseenter', function () {
      if (!$(this).hasClass('open')) {
        setupCopyButton();
      }
    });
  });

  zc.on('complete', function () {
    $copyAsCURL.click();
    input.focus();
  });

  return zc;
}());

/**
 * Setup the "send" shortcut
 */

var CURRENT_REQ_ID = 0;

function sendCurrentRequestToES() {

  var req_id = ++CURRENT_REQ_ID;

  input.getRequestsInRange(function (requests) {
    if (req_id != CURRENT_REQ_ID) {
      return;
    }
    output.update('');

    if (requests.length == 0) {
      return;
    }

    var isMultiRequest = requests.length > 1;

    $("#notification").text("Calling ES....").css("visibility", "visible");

    var finishChain = function () {
      $("#notification").text("").css("visibility", "hidden");
    };

    var isFirstRequest = true;

    var sendNextRequest = function () {
      if (req_id != CURRENT_REQ_ID) {
        return;
      }
      if (requests.length == 0) {
        finishChain();
        return;
      }
      var req = requests.shift();
      var es_path = req.url;
      var es_method = req.method;
      var es_data = req.data.join("\n");
      if (es_data) {
        es_data += "\n";
      } //append a new line for bulk requests.

      es.send(es_method, es_path, es_data).always(function (dataOrjqXHR, textStatus, jqXhrORerrorThrown) {
        if (req_id != CURRENT_REQ_ID) {
          return;
        }
        var xhr;
        if (dataOrjqXHR.promise) {
          xhr = dataOrjqXHR;
        }
        else {
          xhr = jqXhrORerrorThrown;
        }
        function modeForContentType(contentType) {
          if (contentType.indexOf("text/plain") >= 0) {
            return "ace/mode/text";
          }
          else if (contentType.indexOf("application/yaml") >= 0) {
            return "ace/mode/yaml";
          }
          return null;
        }

        if (typeof xhr.status == "number" &&
            // things like DELETE index where the index is not there are OK.
          ((xhr.status >= 200 && xhr.status < 300) || xhr.status == 404)
        ) {
          // we have someone on the other side. Add to history
          history.addToHistory(es.getBaseUrl(), es_path, es_method, es_data);


          let value = xhr.responseText;
          let mode = modeForContentType(xhr.getAllResponseHeaders("Content-Type") || "");

          if (mode === null || mode === "application/json") {
            // assume json - auto pretty
            try {
              value = JSON.stringify(JSON.parse(value), null, 3);
            }
            catch (e) {

            }
          }

          if (isMultiRequest) {
            value = "# " + req.method + " " + req.url + "\n" + value;
          }
          if (isFirstRequest) {
            output.update(value, mode);
          }
          else {
            output.append("\n" + value);
          }
          isFirstRequest = false;
          // single request terminate via sendNextRequest as well
          sendNextRequest();
        }
        else {
          let value, mode;
          if (xhr.responseText) {
            value = xhr.responseText; // ES error should be shown
            mode = modeForContentType(xhr.getAllResponseHeaders("Content-Type") || "");
            if (value[0] == "{") {
              try {
                value = JSON.stringify(JSON.parse(value), null, 3);
              }
              catch (e) {
              }
            }
          } else {
            value = "Request failed to get to the server (status code: " + xhr.status + ")";
            mode = 'ace/mode/text';
          }
          if (isMultiRequest) {
            value = "# " + req.method + " " + req.url + "\n" + value;
          }
          if (isFirstRequest) {
            output.update(value, mode);
          }
          else {
            output.append("\n" + value);
          }
          finishChain();
        }
      });
    };

    sendNextRequest();
  });
}


input.commands.addCommand({
  name: 'send to elasticsearch',
  bindKey: {win: 'Ctrl-Enter', mac: 'Command-Enter'},
  exec: sendCurrentRequestToES
});


/**
 * Init the editor
 */
if (settings) {
  settings.applyCurrentSettings(input);
}
input.focus();
input.highlightCurrentRequestsAndUpdateActionBar();

input.sendCurrentRequestToES = sendCurrentRequestToES;

module.exports = input;
