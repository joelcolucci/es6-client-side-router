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
    this.handleRoute(url.pathname);
  }

  /**
   *
   */
  _onClick(e) {
    // Check if target element is a link or wrapped by a link
    let element = e.target;

    if (e.composedPath) {
      // Browser supports composedPath therefore use it
      // Works to walk nodes inside Shadow DOM and regular DOM
      let paths = e.composedPath();
      for (let i = 0, n = paths.length; i < n; i++) {
        let item = paths[i];
        if (item.tagName === 'A') {
          element = item;
          break;
        } else {
          element = null;
        }
      }
    } else {
      // Fallback to legacy parentNode crawl
      while (!(element && element.matches('a'))) {
        let parentNode = element.parentNode;
        if (parentNode.nodeName === '#document') {
          // Exit to avoid exception caused by invoking matches
          // on document which does not have matches method
          element = null;
          break;
        } else {
          element = parentNode;
        }
      }
    }


    if (!(element)) {
      return;
    }

    let href= element.getAttribute('href');

    let pageOrigin = location.origin;
    let pageHostname = location.hostname;

    // Normalize href via URL API
    let url = new URL(href, pageOrigin);
  
    // Validate if we want to intercept link click
    if (isDifferentDomain(url, pageHostname)) {
      return;
    }

    if (isMailTo(url)) {
      return;
    }

    if (element.getAttribute('target') === '_blank') {
      return;
    }

    if (element.hasAttribute('download')) {
      return;
    }

    // At this point we have verified the click was on a link
    // and that link is a link we want to handle
    e.preventDefault();
    this.handleRequest(url);
  }

  /**
   *
   */
  handleRequest(url) {
    let requestPath = url.pathname;
    this.handleRoute(requestPath);
    this._setPushState(requestPath);
  }

  /**
   *
   */
  handleRoute(requestPath) {
    let route = this.getRoute(requestPath);
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
  getRoute(requestPath) {
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

  /**
   *
   */
  enable() {
    this._addEventListeners();

    let url = location;
    this.handleRoute(url.pathname);
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

  /* Private methods */
  /**
   *
   */
  _setPushState(pathname) {
    let stateObject = {};
    history.pushState(stateObject, '', pathname);   
  }
}
