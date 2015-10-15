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
let ace_mode_json = require('ace/mode-json');

var oop = ace.require("ace/lib/oop");
var JsonHighlightRules = ace.require("ace/mode/json_highlight_rules").JsonHighlightRules;

var OutputJsonHighlightRules = function () {

  // regexp must not have capturing parentheses. Use (?:) instead.
  // regexps are ordered -> the first match is used
  this.$rules = new JsonHighlightRules().getRules();

  this.$rules.start.unshift(
    {
      "token": "comment",
      "regex": "#.*$"
    }
  );

};

oop.inherits(OutputJsonHighlightRules, JsonHighlightRules);

module.exports.OutputJsonHighlightRules = OutputJsonHighlightRules;
