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