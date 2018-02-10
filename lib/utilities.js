/**
 *
 */
export function isDifferentDomain(url, hostName) {
  if (url.href.indexOf(hostName) === -1) {
    return true;
  }
  return false;
}

/**
 *
 */
export function isMailTo(url) {
  if (url.origin.indexOf('mailto') > -1) {
    return true;
  }
  return false;
}

/**
 *
 */
export function isModifiedClick(event) {
  return event.metaKey || event.ctrlKey;
}

/**
 *
 */
export function isNotLeftClick(event) {
  return event.button !== 0;
}