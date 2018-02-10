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

## Documentation
### Design Decisions
Coming soon..

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
| ctx.url | [Instance of URL for given path](https://developer.mozilla.org/en-US/docs/Web/API/URL) |


#### router.enable()
Add event listeners for `click` and `popstate`.

Check/run callback for given page path

#### router.disable()
Remove event listeners for `click` and `popstate`.

## Inspirations
* Polymer's iron-location
* Polymer's iron-route
* VisionMedia PageJS

## License