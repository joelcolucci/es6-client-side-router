# ROUTER
> An ES6 client-side router

## Installation
```
Coming soon.
```

## Getting Started
```javascript
let router = new Router();

router.route('/hello', (ctx) => {

});

router.enable();
```

## Demo
```
git clone https://github.com/joelcolucci/router
yarn install
yarn gulp demo
```

## Design Decisions
A client-side routers primary responsbility is to:
* Intercept navigation actions
* Provide a hook to complete an alternative action

#### How does this library define a navigation action?
 This library defines a navigation action is:
* A click on an anchor element*
* Manipulation of browser history controls (Back, Forward button)

##### *Clicks on anchor elements are filtered down by the following criteria:
* Click is not modified (Control + click)
* Click is a left click
* Anchor does not contain "target" attribute
* Anchor does not contain "download" attribute
* Anchor does not contain "data-router-ignore" attribute
* Anchor contains a "href" attribute
* Anchor HREF is not to a different domain
* Anchor HREF is not to an email address (mailto: link)

##### URL bar changes
URL changes in the URL bar trigger a popstate event. We catch this event
and run the URL against the registered routes.

## Documentation
### Router Class

#### router.route(path, callback)
Register a callback for the given path.

```javascript
router.route('/widget/:widgetId', widget.view);
```

The callback is invoked with one argument `ctx`.

|  The ctx argument | |
| ---------- | ------ |
| ctx.params | URL parameter key/values |
| ctx.url | Instance of URL class[See MDN URL API](https://developer.mozilla.org/en-US/docs/Web/API/URL) |


#### router.enable()
Add event listeners for `click` and `popstate`.

Check/run callback for given page path

#### router.disable()
Remove event listeners for `click` and `popstate`.

#### Disabling route handling on specific Links
Route handling can be disabled on a per link basis by adding the attribute `data-router-ignore` to the anchor element.

```html
<a href="/" data-router-ignore>Router will ignore handling this click</a>
```

*Note this attribute is handled as a boolean. The value set does not matter. If it's present it will be considered true.*

## Inspirations
* [Polymer's iron-location](https://github.com/PolymerElements/iron-location)
* [Turbolinks](https://github.com/turbolinks/turbolinks)
* [page.js](https://github.com/visionmedia/page.js)

## License