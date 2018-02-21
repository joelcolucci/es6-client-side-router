# ES6 Client-side Router
> An ES6 client-side router

## Installation
```
Coming soon.
```

## Getting Started
```javascript
import Router from 'es6-client-side-router';


let router = new Router();

router.on('/hello', (ctx) => {
  console.log('hello world');
});

router.enable();
```

## API Reference
### Router Class
#### router.on(path, callback)
On URL match, run the given callback.

```javascript
router.on('/widget/:widgetId', widget.view);
```

The callback is invoked with one argument `ctx`.

|  The ctx argument | |
| ---------- | ------ |
| ctx.params | URL parameter key/values |
| ctx.url | Instance of URL class ([See MDN URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL)) |

#### Handling routes that don't match
If a user navigates to a route that does not match a special callback will be invoked.

Developers can set this callback by:

```javascript
router.on('router-no-match', (ctx) => {
  console.log('No route matched');
});
```

We do not call this a "404" or "not found" on purpose.

"404" and "not found" is terminology specific to HTTP.

In our case, nomatch just means that no callback was found for the given route.

No HTTP requests were involved.

#### router.enable()
Add event listeners for `click` and `popstate`.

Check/run callback for given page path

#### router.disable()
Remove event listeners for `click` and `popstate`.

### Disabling route handling on specific Links
Route handling can be disabled on a per link basis by adding the attribute `data-router-ignore` to the anchor element.

```html
<a href="/" data-router-ignore>Router will ignore handling this click</a>
```

*Note this attribute is handled as a boolean. The value set does not matter. If it's present it will be considered true.*

### Design Decisions
A client-side routers primary responsbility is to:
* Intercept navigation actions
* Provide a hook to complete an alternative action

#### How does this library define a navigation action?
 This library defines a navigation action is:
* A click on an anchor element
* Manipulation of browser history controls (Back, Forward button)

#### Clicks on anchor elements are filtered down by the following criteria:
* Click is not modified (Control + click)
* Click is a left click
* Anchor does not contain "target" attribute
* Anchor does not contain "download" attribute
* Anchor does not contain "data-router-ignore" attribute
* Anchor contains a "href" attribute
* Anchor HREF is not to a different domain
* Anchor HREF is not to an email address (mailto: link)

#### URL bar changes
URL changes in the URL bar trigger a popstate event. We catch this event
and run the URL against the registered routes.

## Contributing
Coming soon..

## Credit/Inspirations
* [Polymer's iron-location](https://github.com/PolymerElements/iron-location)
* [Turbolinks](https://github.com/turbolinks/turbolinks)
* [page.js](https://github.com/visionmedia/page.js)

## License
MIT (See LICENSE)