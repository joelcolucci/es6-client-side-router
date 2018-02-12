/**
 *
 */
function isDifferentDomain(url, hostName) {
  if (url.href.indexOf(hostName) === -1) {
    return true;
  }
  return false;
}

/**
 *
 */
function isMailTo(url) {
  if (url.origin.indexOf('mailto') > -1) {
    return true;
  }
  return false;
}

/**
 *
 */
function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey;
}

/**
 *
 */
function isNotLeftClick(event) {
  return event.button !== 0;
}

/**
 * Expose `pathToRegexp`.
 */
/**
 * Default configs.
 */
var DEFAULT_DELIMITER = '/';
var DEFAULT_DELIMITERS = './';

/**
 * The main path matching regexp utility.
 *
 * @type {RegExp}
 */
var PATH_REGEXP = new RegExp([
  // Match escaped characters that would otherwise appear in future matches.
  // This allows the user to escape special characters that won't transform.
  '(\\\\.)',
  // Match Express-style parameters and un-named parameters with a prefix
  // and optional suffixes. Matches appear as:
  //
  // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
  // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
  '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
].join('|'), 'g');

/**
 * Parse a string for the raw tokens.
 *
 * @param  {string}  str
 * @param  {Object=} options
 * @return {!Array}
 */
function parse (str, options) {
  var tokens = [];
  var key = 0;
  var index = 0;
  var path = '';
  var defaultDelimiter = (options && options.delimiter) || DEFAULT_DELIMITER;
  var delimiters = (options && options.delimiters) || DEFAULT_DELIMITERS;
  var pathEscaped = false;
  var res;

  while ((res = PATH_REGEXP.exec(str)) !== null) {
    var m = res[0];
    var escaped = res[1];
    var offset = res.index;
    path += str.slice(index, offset);
    index = offset + m.length;

    // Ignore already escaped sequences.
    if (escaped) {
      path += escaped[1];
      pathEscaped = true;
      continue
    }

    var prev = '';
    var next = str[index];
    var name = res[2];
    var capture = res[3];
    var group = res[4];
    var modifier = res[5];

    if (!pathEscaped && path.length) {
      var k = path.length - 1;

      if (delimiters.indexOf(path[k]) > -1) {
        prev = path[k];
        path = path.slice(0, k);
      }
    }

    // Push the current path onto the tokens.
    if (path) {
      tokens.push(path);
      path = '';
      pathEscaped = false;
    }

    var partial = prev !== '' && next !== undefined && next !== prev;
    var repeat = modifier === '+' || modifier === '*';
    var optional = modifier === '?' || modifier === '*';
    var delimiter = prev || defaultDelimiter;
    var pattern = capture || group;

    tokens.push({
      name: name || key++,
      prefix: prev,
      delimiter: delimiter,
      optional: optional,
      repeat: repeat,
      partial: partial,
      pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
    });
  }

  // Push any remaining characters.
  if (path || index < str.length) {
    tokens.push(path + str.substr(index));
  }

  return tokens
}

/**
 * Escape a regular expression string.
 *
 * @param  {string} str
 * @return {string}
 */
function escapeString (str) {
  return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
}

/**
 * Escape the capturing group by escaping special characters and meaning.
 *
 * @param  {string} group
 * @return {string}
 */
function escapeGroup (group) {
  return group.replace(/([=!:$/()])/g, '\\$1')
}

/**
 * Get the flags for a regexp from the options.
 *
 * @param  {Object} options
 * @return {string}
 */
function flags (options) {
  return options && options.sensitive ? '' : 'i'
}

/**
 * Pull out keys from a regexp.
 *
 * @param  {!RegExp} path
 * @param  {Array=}  keys
 * @return {!RegExp}
 */
function regexpToRegexp (path, keys) {
  if (!keys) return path

  // Use a negative lookahead to match only capturing groups.
  var groups = path.source.match(/\((?!\?)/g);

  if (groups) {
    for (var i = 0; i < groups.length; i++) {
      keys.push({
        name: i,
        prefix: null,
        delimiter: null,
        optional: false,
        repeat: false,
        partial: false,
        pattern: null
      });
    }
  }

  return path
}

/**
 * Transform an array into a regexp.
 *
 * @param  {!Array}  path
 * @param  {Array=}  keys
 * @param  {Object=} options
 * @return {!RegExp}
 */
function arrayToRegexp (path, keys, options) {
  var parts = [];

  for (var i = 0; i < path.length; i++) {
    parts.push(pathToRegexp(path[i], keys, options).source);
  }

  return new RegExp('(?:' + parts.join('|') + ')', flags(options))
}

/**
 * Create a path regexp from string input.
 *
 * @param  {string}  path
 * @param  {Array=}  keys
 * @param  {Object=} options
 * @return {!RegExp}
 */
function stringToRegexp (path, keys, options) {
  return tokensToRegExp(parse(path, options), keys, options)
}

/**
 * Expose a function for taking tokens and returning a RegExp.
 *
 * @param  {!Array}  tokens
 * @param  {Array=}  keys
 * @param  {Object=} options
 * @return {!RegExp}
 */
function tokensToRegExp (tokens, keys, options) {
  options = options || {};

  var strict = options.strict;
  var end = options.end !== false;
  var delimiter = escapeString(options.delimiter || DEFAULT_DELIMITER);
  var delimiters = options.delimiters || DEFAULT_DELIMITERS;
  var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|');
  var route = '';
  var isEndDelimited = false;

  // Iterate over the tokens and create our regexp string.
  for (var i = 0; i < tokens.length; i++) {
    var token = tokens[i];

    if (typeof token === 'string') {
      route += escapeString(token);
      isEndDelimited = i === tokens.length - 1 && delimiters.indexOf(token[token.length - 1]) > -1;
    } else {
      var prefix = escapeString(token.prefix);
      var capture = token.repeat
        ? '(?:' + token.pattern + ')(?:' + prefix + '(?:' + token.pattern + '))*'
        : token.pattern;

      if (keys) keys.push(token);

      if (token.optional) {
        if (token.partial) {
          route += prefix + '(' + capture + ')?';
        } else {
          route += '(?:' + prefix + '(' + capture + '))?';
        }
      } else {
        route += prefix + '(' + capture + ')';
      }
    }
  }

  if (end) {
    if (!strict) route += '(?:' + delimiter + ')?';

    route += endsWith === '$' ? '$' : '(?=' + endsWith + ')';
  } else {
    if (!strict) route += '(?:' + delimiter + '(?=' + endsWith + '))?';
    if (!isEndDelimited) route += '(?=' + delimiter + '|' + endsWith + ')';
  }

  return new RegExp('^' + route, flags(options))
}

/**
 * Normalize the given path string, returning a regular expression.
 *
 * An empty array can be passed in for the keys, which will hold the
 * placeholder key descriptions. For example, using `/user/:id`, `keys` will
 * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
 *
 * @param  {(string|RegExp|Array)} path
 * @param  {Array=}                keys
 * @param  {Object=}               options
 * @return {!RegExp}
 */
function pathToRegexp (path, keys, options) {
  if (path instanceof RegExp) {
    return regexpToRegexp(path, keys)
  }

  if (Array.isArray(path)) {
    return arrayToRegexp(/** @type {!Array} */ (path), keys, options)
  }

  return stringToRegexp(/** @type {string} */ (path), keys, options)
}

/**
 *
 */
class Route {
  /**
   *
   */
  constructor(pathPattern, callback) {
    this.path = pathPattern;

    this.callback = callback;

    this._keys = [];
    this._options = {};

    this.regex = pathToRegexp(
      this.path,
      this._keys,
      this._options
    );
  }

  /**
   * 
   */
  matches(requestPath) {
    let match = this.regex.exec(decodeURIComponent(requestPath));
    if (match) {
      return true
    }
    return false;
  }

  /**
   * 
   */
  parsePath(requestPath) {
    // In our Router we check if there is a match prior to calling parsePath
    // However we keep the check in to avoid errors
    let match = this.regex.exec(decodeURIComponent(requestPath));
    if (!match) {
      console.log('[Route] 404 - No route matched path: ', pathname);
      return false;
    }

    let parameters = {};
    for (let i = 0; i < this._keys.length; i++) {
      let key = this._keys[i];
      let param = match[i + 1];
      if (!param) {
        continue;
      }

      parameters[key.name] = decodeURIComponent(param);
      if (key.repeat) {
        parameters[key.name] = parameters[key.name].split(key.delimiter);
      }
    }

    return parameters;
  }
}

/**
 *
 */
class Router {
  /**
   *
   */
  constructor() {
    this._routeMap = new Map();

    // Bind here so that function passed to
    // add/remove event listener is the same
    this._onClick = this._onClick.bind(this);
    this._onPopState = this._onPopState.bind(this);
  }

  /**
   *
   */
  _addEventListeners() {
    document.addEventListener('click', this._onClick);
    window.addEventListener('popstate', this._onPopState);
  }

  /**
   *
   */
  _removeEventListeners() {
    document.removeEventListener('click', this._onClick);
    window.removeEventListener('popstate', this._onPopState);
  }

  /**
   *
   */
  _onPopState(e) {
    let url = new URL(location);
    this._handleRoute(url);
  }

  /**
   *
   */
  _onClick(e) {
    // Step 1: Verify click is one we want to potentially intercept
    if (isNotLeftClick(e)) {
      return;
    }

    if(isModifiedClick(e)) {
      return;
    }

    // Step 2: Verify click occurred on anchor element or
    // on element wrapped by anchor element
    let element = e.target;
  
    let anchor;
    if (e.composedPath) {
      // If browser supports composedPath use it to crawl
      // Preferred over parentNode as it works with Shadow DOM
      // in addition to regular DOM
      let paths = e.composedPath();
      for (let i = 0, n = paths.length; i < n; i++) {
        let item = paths[i];
        if (item.tagName === 'A') {
          anchor = item;
          break;
        }
      }
    } else {
      // Fallback to legacy parentNode crawl
      while (element) {
        if (element.tagName === 'A') {
          anchor = element;
          break;
        }
        // Update iterator
        element = element.parentNode;
      }
    }

    if (!(anchor)) {
      // Click did NOT occur on an anchor
      return;
    }

    // Step 3: Verify anchor meets criteria
    if (anchor.hasAttribute('target')) {
      return;
    }

    if (anchor.hasAttribute('download')) {
      return;
    }

    if (!(anchor.hasAttribute('href'))) {
      return;
    }

    // Step 4: Verify anchor HREF meets criteria
    let pageOrigin = location.origin;
    let pageHostname = location.hostname;

    let href= anchor.getAttribute('href');
    let url = new URL(href, pageOrigin); // Normalize href via URL API

    if (isDifferentDomain(url, pageHostname)) {
      return;
    }

    if (isMailTo(url)) {
      return;
    }

    // We have verified:
    // * click type
    // * anchor tag clicked
    // * anchor tag criteria
    // * anchor HREF criteria
    e.preventDefault();

    this._handleRequest(url);
  }

  /**
   *
   */
  _handleRequest(url) {
    this._handleRoute(url);
    this._setPushState(url);
  }

  /**
   *
   */
  _handleRoute(url) {
    let requestPath = url.pathname;
    let route = this._getRoute(requestPath);
    if (!route) {
      console.log('[Router] 404 - No route matched path: ', requestPath);
      return;
    }

    let ctx = {};
    ctx.url = url;
    ctx.params = route.parsePath(requestPath);

    route.callback.call({}, ctx);
  }

  /**
   *
   */
  _setPushState(url) {
    let absoluteUrl = url.href;
    let stateObject = {};
    history.pushState(stateObject, '', absoluteUrl);   
  }

  /**
   * 
   */
  _getRoute(requestPath) {
    let route;
    for (let [key, value] of this._routeMap) {
      route = value;
      if (route.matches(requestPath)) {
        console.log('[Router] Route matched path: ', requestPath);
        break;
      }
      // Reset route to ensure if for loops never finds
      // a match route is correctly null
      route = null;
    }
    return route;
  }

  /* Public API */
  /**
   *
   */
  enable() {
    this._addEventListeners();

    // Create a URL instance from location since
    // we use the URL API internally
    let url = new URL(location.href);
    this._handleRoute(url);
  }

  /**
   *
   */
  disable() {
    this._removeEventListeners();
  }

  /**
   *
   */
  route(pathPattern, callback) {
    let route = new Route(pathPattern, callback);

    this._routeMap.set(route.regex, route);
  }
}

export default Router;
//# sourceMappingURL=router-es.js.map
