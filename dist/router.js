import {isDifferentDomain, isMailTo} from './utilities.js';
import Route from './route.js';


/**
 *
 */
export default class Router {
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
    let url = location;
    this._handleRoute(url.pathname);
  }

  /**
   *
   */
  _onClick(e) {
    let element = e.target;

    // Check if click occurred on anchor element or
    // on element wrapped by anchor element
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
        // Iterate
        element = element.parentNode;
      }
    }

    if (!(anchor)) {
      // Click did NOT occur on an anchor we
      // therefor do not intercept/alter it
      return;
    }

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

    if (anchor.hasAttribute('target')) {
      return;
    }

    if (anchor.hasAttribute('download')) {
      return;
    }

    // We have verified the click occurred on an anchor tag
    // AND the link meets our criteria to intercept/handle
    e.preventDefault();
    this._handleRequest(url);
  }

  /**
   *
   */
  _handleRequest(url) {
    let requestPath = url.pathname;
    this._handleRoute(requestPath);
    this._setPushState(requestPath);
  }

  /**
   *
   */
  _handleRoute(requestPath) {
    let route = this._getRoute(requestPath);
    if (!route) {
      console.log('[Router] 404 - No route matched path: ', requestPath);
      return;
    }

    let ctx = {};
    ctx.url = window.location;
    ctx.params = route.parsePath(requestPath);

    route.callback.call({}, ctx);
  }

  /**
   *
   */
  _setPushState(pathname) {
    let stateObject = {};
    history.pushState(stateObject, '', pathname);   
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

    let url = location;
    this._handleRoute(url.pathname);
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
