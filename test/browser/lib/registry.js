(function (glob) {
  var reSep = /[\/\.]/;
  
  function WildcardMatcher(text) {
      this.parts = (text || '').split(reSep);
  }
  
  WildcardMatcher.prototype.match = function(input) {
      var matches = true,
          parts = this.parts, 
          ii, partsCount = parts.length;
      
      if (typeof input == 'string' || input instanceof String) {
          var testParts = (input || '').split(reSep);
  
          for (ii = 0; matches && ii < partsCount; ii++) {
              matches = parts[ii] === '*' || parts[ii] === testParts[ii];
          }
      }
      else if (typeof input.splice == 'function') {
          matches = [];
          
          for (ii = input.length; ii--; ) {
              if (this.match(input[ii])) {
                  matches[matches.length] = input[ii];
              }
          }
      }
      else if (typeof input == 'object') {
          matches = {};
          
          for (var key in input) {
              if (this.match(key)) {
                  matches[key] = input[key];
              }
          }
      }
      
      return matches;
  };
  
  function wildcard(text, test) {
      var matcher = new WildcardMatcher(text);
      
      if (typeof test != 'undefined') {
          return matcher.match(test);
      }
  
      return matcher;
  }
  
  glob.wildcard = wildcard;
  
})(this);

;(function (glob) {
  var reExpr = /([\w\.]+)\s*([\><\!\=]\=?)\s*([\-\w\.]+)/,
      reQuotedExpr = /([\w\.]+)\s*([\><\!\=]\=?)\s*\"([^\"]+)\"/,
      reRegexExpr = /([\w\.]+)\s*([\=\!]\~)\s*(\/[^\s]+\/\w*)/,
      reRegex = /^\/(.*)\/(\w*)$/,
      reBool = /^(true|false)$/i,
      reFalsyWords = /(undefined|null|false)/g,
      reTruthyWords = /(true)/g,
      reWords = /([\w\.]{2,})/,
      reSillyFn = /0\(.*?\)/g,
      exprLookups = {
          '==': ['equals'],
          '>':  ['gt'],
          '>=': ['gte'],
          '<':  ['lt'],
          '<=': ['lte'],
          '!=': ['equals', 'not'],
          '=~': ['regex'],
          '!~': ['regex', 'not']
      },
      wordReplacements = {
          and: '&&',
          or: '||'
      };
  
  /**
   * class Matcher
   *
   **/
   
  /**
   * new Matcher(target, [opts])
   * - target (Object): the object that match operations will be checked against
   *
   **/
  function Matcher(target, opts) {
      // initialise options
      this.opts = opts || {};
  
      // initialise members
      this.target = target;
      this.ok = true;
  }
  
  Matcher.prototype = {
      /** chainable
      * Matcher#gt(prop, value, [result])
      *
      * Check whether the specified property of the target object is greater than 
      * the specified value.  If the optional result argument is passed to the function
      * then the result is passed back in that object. If not the result is stored in
      * the local `ok` property of the matcher instance.  Other comparison methods use
      * the same principle as this function.
      **/
      gt: function(prop, value, result) {
          result = result || this;
          result.ok = result.ok && this.target && this._val(prop) > value;
          
          return this;
      },
      
      /** chainable
      * Matcher#gte(prop, value, [result])
      *
      * Greater than or equal to check.
      **/
      gte: function(prop, value, result) {
          result = result || this;
          result.ok = result.ok && this.target && this._val(prop) >= value;
          
          return this;
      },
      
      /** chainable
      * Matcher#lt(prop, value, [result])
      *
      * Less than property value check
      **/
      lt: function(prop, value, result) {
          result = result || this;
          result.ok = result.ok && this.target && this._val(prop) < value;
          
          return this;
      },
      
      // Test for a property being equal or less than the specified value
      lte: function(prop, value, result) {
          result = result || this;
          result.ok = result.ok && this.target && this._val(prop) <= value;
          
          return this;
      },
      
      // Test for equality of the specified property
      equals: function(prop, value, result) { 
          result = result || this;
          
          if (result.ok && this.target) {
              var testVal = this._val(prop),
                  strings = (typeof testVal == 'string' || testVal instanceof String) &&
                      (typeof value == 'string' || value instanceof String);
  
              // if the test value is a string and the value is a string
              if (strings && (! this.opts.caseSensitive)) {
                  result.ok = testVal.toLowerCase() === value.toLowerCase();
              }
              else {
                  result.ok = testVal === value;
              }
          }
          
          return this;
      },
      
      not: function(prop, value, result) {
          // invert the passes state
          result = result || this;
          result.ok = !result.ok;
          
          return this;
      },
      
      regex: function(prop, value, result) {
          result = result || this;
          
          // if the result is still ok, then check the regex
          if (result.ok && this.target) {
              var regex = value;
              
              // if the regex is currently a string, then parse into a regular expression
              if (typeof regex == 'string' || regex instanceof String) {
                  var match = reRegex.exec(value);
                  if (match) {
                      regex = new RegExp(match[1], match[2]);
                  }
              }
              
              // if we now have a regex, then update the result ok
              if (regex instanceof RegExp) {
                  result.ok = regex.test(this._val(prop));
              }
          }
          
          return this;
      },
      
      query: function(text) {
          var match;
          
          // evaluate expressions
          text = this._evaluateExpressions(text, reQuotedExpr);
          text = this._evaluateExpressions(text, reRegexExpr);
          text = this._evaluateExpressions(text, reExpr);
          
          // replace falsy words with 0s and truthy words with 1s
          text = text.replace(reFalsyWords, '0').replace(reTruthyWords, '1');
          
          // find any remaining standalone words
          match = reWords.exec(text);
          while (match) {
              var replacement = wordReplacements[match[0].toLowerCase()];
              
              // if we don't have a replacement for a word then look for the value of the property on the target
              if ((! replacement) && this.target) {
                  replacement = this._val(match[0]) ? true : false;
              }
              
              text = text.slice(0, match.index) + replacement + text.slice(match.index + match[0].length);
              
              // replace falsy words with 0s and truthy words with 1s
              text = text.replace(reFalsyWords, '0').replace(reTruthyWords, '1');
              
              // run the test again
              match = reWords.exec(text);
          }
          
          // replace peoples attempts at including functions with 0
          text = text.replace(reSillyFn, '0');
          
          // evaluate the expression
          try {
              this.ok = eval(text) == true;
          }
          catch (e) {
              this.ok = false;
              this._errtext = text;
          }
          
          return this;
      },
      
      /** internal
      * Matcher#_evaluateExpressions(text, expr)
      *
      **/
      _evaluateExpressions: function(text, expr) {
          var match = expr.exec(text);
              
          while (match) {
              var fns = exprLookups[match[2]] || [],
                  result = {
                      ok: fns.length > 0
                  },
                  val1 = parseFloat(match[1]) || match[1],
                  val2 = parseFloat(match[3]) || match[3];
                  
              // if value 2 is a boolean, then parse it
              if (reBool.test(val2)) {
                  val2 = val2 == 'true';
              }
              
              // iterate through the required functions in order and evaluate the result
              for (var ii = 0, count = fns.length; ii < count; ii++) {
                  var evaluator = this[fns[ii]];
                  
                  // if we have the evaluator, then run it
                  if (evaluator) {
                      evaluator.call(this, val1, val2, result);
                  }
              }
              
              text = text.slice(0, match.index) + result.ok + text.slice(match.index + match[0].length);
              match = expr.exec(text);
          }
          
          return text;
      },
      
      _val: function(prop) {
          var value = this.target[prop];
  
          // if the value is undefined, we'll attempt looking for nested properties
          if (typeof value == 'undefined') {
              var props = prop.split('.');
              if (props.length > 1) {
                  value = this.target;
                  while (value && props.length) {
                      value = value[props.shift()];
                  }
              }
          }
          
          return value;
      }
  };
  
  /*
  Create a matcher that will execute against the specified target.
  */
  function matchme(target, opts, query) {
      var matcher;
      
      // check for no options being supplied (which is the default)
      if (typeof opts == 'string' || opts instanceof String) {
          query = opts;
          opts = {};
      }
      
      // create the matcher
      matcher = new Matcher(target, opts);
      
      if (typeof query != 'undefined') {
          return matcher.query(query).ok;
      }
      else {
          return matcher;
      }
  }
  
  matchme.filter = function(array, query, opts) {
      var matcher;
      
      // if the array has been ommitted (perhaps underscore is being used)
      // then push up arguments and undef the array
      if (typeof array == 'string' || array instanceof String) {
          opts = query;
          query = array;
          array = null;
      }
      
      // create the matcher on a null target
      matcher = new Matcher(null, opts);
      
      if (array) {
          var results = [];
          for (var ii = 0, count = array.length; ii < count; ii++) {
              matcher.target = array[ii];
              if (matcher.query(query).ok) {
                  results[results.length] = array[ii];
              }
          }
          
          return results;
      }
      else {
          return function(target) {
              // update the matcher target
              matcher.target = target;
              
              return matcher.query(query).ok;
          };
      }
  };
  
  glob.matchme = matchme;
  
})(this);

;(function (glob) {
  
  (function(glob) {
      var definitions = {};
          
      var _listeners = {},
          reEventType = /^(\w+)\:(.*)$/;
          
      function _parseEventPattern(pattern) {
          // extract the event type from the pattern
          var match = reEventType.exec(pattern),
              details = {
                  type: 'default',
                  pattern: pattern
              };
          
          // if we have a match, then appropriately map the pattern 
          if (match) {
              details.type = match[1];
              details.pattern = match[2];
          }
          
          return details;
      }
      
      function _bind(pattern, handler) {
          var evt = _parseEventPattern(pattern);
          
          // create the array if required
          if (! _listeners[evt.type]) {
              _listeners[evt.type] = [];
          }
          
          _listeners[evt.type].push({ matcher: wildcard(evt.pattern), handler: handler });
      }
      
      function _trigger(eventType, def) {
          var listeners = _listeners[eventType] || [];
          
          for (var ii = 0, count = listeners.length; ii < count; ii++) {
              if (listeners[ii].matcher.match(def.namespace)) {
                  listeners[ii].handler.call(this, def);
              }
          }
      }
      
      function _unbind(pattern, handler) {
          var evt = _parseEventPattern(pattern),
              listeners = _listeners[evt.type] || [];
              
          // iterate through the listeners and splice out the matching handler
          for (var ii = listeners.length; ii--; ) {
              var matcher = listeners[ii].matcher;
              
              if (matcher && matcher.match(evt.pattern) && listeners[ii].handler === handler) {
                  listeners.splice(ii, 1);
              }
          } 
      }
      function RegistryDefinition(namespace, constructor, attributes) {
          var key;
          
          // initialise members
          this.namespace = namespace;
          
          // initialise the attributes
          this.attributes = attributes || {};
          
          // initialise the prototype
          this._prototype = {};
          
          // deal with the various different constructor values appropriately
          if (typeof constructor == 'function') {
              var emptyPrototype = true;
              
              // update the constructor
              this.constructor = constructor;
      
              // check for prototype keys
              for (key in constructor.prototype) {
                  emptyPrototype = false;
                  break;
              }
              
              // add the prototype associated with the constructor to the current prototype
              if (! emptyPrototype) {
                  this._prototype = constructor.prototype;
              }
          }
          else {
              this.instance = constructor;
          }
          
          // mark this as not being a singleton instance (until told otherwise)
          this._singleton = false;
      }
      
      RegistryDefinition.prototype = {
          create: function() {
              var newObject = this.instance, key;
              
              // if the object has not already been created, then create the new instance
              if ((! newObject) && this.constructor) {
                  // create the new object or re-use the instance if it's there
                  newObject = this.instance || this.constructor.apply(null, arguments);
                  
                  // update the attribute values on the new instance
                  for (key in this.attributes) {
                      if (typeof newObject[key] == 'undefined') {
                          newObject[key] = this.attributes[key];
                      }
                  }
                  
                  // if the new object has successfully been created, and is of type object
                  // then assign the prototype
                  if (typeof newObject == 'object') {
                      var proto = Object.getPrototypeOf(newObject);
                      
                      // copy any methods from the object prototype into this prototype
                      for (key in this._prototype) {
                          if (typeof proto[key] == 'undefined') {
                              proto[key] = this._prototype[key];
                          }
                      }
                  }
                  
                  // if we have the new object, then trigger the create event
                  if (typeof newObject != 'undefined') {
                      // trigger the create
                      _trigger.call(newObject, 'create', this);
      
                      // if the definition is a singleton and the instance is not yet assigned, then do that now
                      if (this._singleton && (! this.instance)) {
                          this.instance = newObject;
                      }
                  }
              } 
      
              return newObject;
          },
          
          extend: function(proto) {
              for (var key in proto) {
                  // if none of the descendant prototypes have implemented this member, then copy
                  // it across to the new prototype
                  if (typeof this._prototype[key] == 'undefined') {
                      this._prototype[key] = proto[key];
                  }
              }
              
              return this;
          },
          
          matches: function(test) {
              return matchme(this.attributes, test) || matchme(this._prototype, test);
          },
          
          singleton: function() {
              this._singleton = true;
              return this;
          }
      };
      function RegistryResults() {
          this.items = [];
      }
      
      RegistryResults.prototype.create = function() {
          return this.items[0] ? this.items[0].create.apply(this.items[0], arguments) : undefined;
      };
      
      RegistryResults.prototype.current = function() {
          return this.instances()[0];
      };
      
      RegistryResults.prototype.instances = function() {
          var results = [];
      
          for (var ii = 0, count = this.items.length; ii < count; ii++) {
              if (this.items[ii].instance) {
                  results[results.length] = this.items[ii].instance;
              }
          }
          
          return results;
      };
      
      RegistryResults.prototype.filter = function(callback) {
          var results = new RegistryResults();
          
          for (var ii = 0, count = this.items.length; ii < count; ii++) {
              if (callback(this.items[ii])) {
                  results.items.push(this.items[ii]);
              }
          }
          
          return results;
      };
      
      // john resig's getPrototypeOf shim: http://ejohn.org/blog/objectgetprototypeof/
      if ( typeof Object.getPrototypeOf !== "function" ) {
        if ( typeof "test".__proto__ === "object" ) {
          Object.getPrototypeOf = function(object){
            return object.__proto__;
          };
        } else {
          Object.getPrototypeOf = function(object){
            // May break if the constructor has been tampered with
            return object.constructor.prototype;
          };
        }
      }
      
      function registry(namespace, test) {
          var matcher = wildcard(namespace),
              results = new RegistryResults();
          
          for (var key in definitions) {
              if (matcher.match(key)) {
                  results.items.push(definitions[key]);
              }
          }
          
          // if we have been passed a matchme test string, then filter the results
          if (typeof test != 'undefined') {
              results = results.filter(function(item) {
                  return item.matches(test);
              });
          }
          
          return results;
      }
      
      function _define(namespace, constructor, attributes) {
          if (definitions[namespace]) {
              throw new Error('Unable to define "' + namespace + '", it already exists');
          }
          
          // create the definition and return the instance
          var definition = definitions[namespace] = new RegistryDefinition(namespace, constructor, attributes);
          
          // trigger the define event (use setTimeout to allow other assignments to complete)
          setTimeout(function() {
              // trigger the event
              _trigger.call(definition, 'define', definition);
          }, 0);
          
          // return the definition
          return definition;
      }
      
      function _fn(namespace, handler) {
          // create the definition
          var definition = _define(namespace);
          
          // set the instance of the definition to the handler
          definition.instance = handler;
          
          // return the definition
          return definition;
      }
      
      function _module() {
          var definition = _define.apply(null, arguments);
          
          // set the definition as a singleton
          definition.singleton();
          
          // return the new definition
          return definition;
      }
      
      // ## registry.scaffold
      // The scaffold function is used to define a prototype rather than a module pattern style 
      // constructor function.  Internally the registry creates a define call and creates an 
      // anonymous function that creates a new instance of the prototype via the constructor 
      // and ensures that the prototype has be assigned to the object
      function _scaffold(namespace, constructor, prototype) {
          // if the constructor is not a function, then remap the arguments
          if (typeof constructor != 'function') {
              prototype = constructor;
              constructor = null;
          }
          
          var def = _define(namespace, function() {
              var instance = constructor ? new constructor() : {};
              
              // if we have been supplied arguments, then call the constructor again
              // with the arguments supplied
              if (instance && arguments.length > 0) {
                  constructor.apply(instance, arguments);
              }
              
              // return the new instance
              return instance;
          });
          
          return prototype ? def.extend(prototype) : def;
      }
      
      function _undef(namespace) {
          delete _defitions[namespace];
      }
      
      registry.define = _define;
      registry.find = registry;
      registry.fn = _fn;
      registry.scaffold = _scaffold;
      registry.module = _module;
      registry.undef = _undef;
      
      // event handling
      registry.bind = _bind;
      registry.unbind = _unbind;
      
      if (typeof registry != 'undefined') {
          glob.registry = registry;
      }
  }(this));
  
  
   if (typeof registry != 'undefined') glob.registry = registry;
})(this);