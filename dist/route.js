import {pathToRegexp} from './path-to-regexp.js';


/**
 *
 */
export default class Route {
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
        parameters[key.name] = parameters[key.name].split(key.delimiter)
      }
    }

    return parameters;
  }
}
