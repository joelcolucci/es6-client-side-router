import {
  isDifferentDomain,
  isMailTo,
  isModifiedClick,
  isNotLeftClick} from './utilities.js';

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

    if (anchor.hasAttribute('data-router-ignore')) {
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
