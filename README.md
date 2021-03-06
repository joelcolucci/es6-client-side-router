# ES6 Client-side Router
> A client-side router written as an ES6 module

## Installation
```shell
# NPM
npm install es6-client-side-router

# Yarn
yarn add es6-client-side-router
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
### Router
Create an instance of the Router class.
```javascript
import Router from 'es6-client-side-router';

let router = new Router();
```

#### Methods
#### router.on(path, callback)
The following table describes the arguments required by the `on` method.

| Argument | Description | Type |
| -------- | ----------- | ---- |
| path | A URL path/pattern to match | String |
| callback | The function to execute when the path is matched | Function |

Example:

```javascript
router.on('/widgets', (ctx) => {
  // fetch all widgets
});
```

##### path parsing
The path parameter is converted to a REGEX internally using [path-to-regexp](https://github.com/pillarjs/path-to-regexp).

When a path is matched:
* The URL path is parsed using the internally stored REGEX
* The parsed parameters are converted to an Object
* The params Object is made available via `ctx.params`

This allows for:
```javascript
router.on('/widgets/:widgetId', (ctx) => {
  ctx.params.widgetId;
});
```

##### Callback function
Callback functions are invoked with one argument `ctx`.

The following table describes the properties of the `ctx` argument.

| Property | Description | Type |
| -------- | ----------- | ---- |
| ctx.params | URL parameter key/values | Object |
| ctx.url | [Instance of the URL class](https://developer.mozilla.org/en-US/docs/Web/API/URL)  | URL instance |

##### Accessing query string values
A URLs query string can be accessed through the URL class instance.

View documentation: [MDN URL Search Params](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)

Example:
```javascript
router.on('/widget/:widgetId', (ctx) => {
  ctx.url.href; // http://www.example.com/cats?type=tabby&color=gray
  ctx.url.searchParams.toString(); // type=tabby&color=gray
});
```

#### Handling 'no-match' routes
We use the term 'no-match' to mean when a user navigates to a route that does 
not have a defined handler.

When a 'no-match' occurs a default callback is invoked. The default callback will log the occurrence to the console.

The default callback can be overwritten by the following:
```javascript
router.on('router-no-match', (ctx) => {
  console.log('No route matched');
});
```

#### router.enable()
Start listening and intercepting [navigation actions](#what-is-a-navigation-action).

When router.enable() is called it will check the current URL and attempt to match/invoke the assigned callback.

#### router.disable()
Stop listening and intercepting [navigation actions](#what-is-a-navigation-action).

#### Disabling route handling on specific Links
Route handling can be disabled on a per link basis by adding the attribute `data-router-ignore` to the anchor element.

```html
<a href="/" data-router-ignore>Router will ignore handling this click</a>
```

*Note this attribute is handled as a boolean. The value set does not matter. If it's present it will be considered true.*

## Design Decisions
A client-side routers primary responsbility is to:
* Intercept navigation actions
* Provide a hook to complete an alternative action

### What is a navigation action?
 This library defines a navigation action is:
* A click on an anchor element
* Manipulation of browser history controls (Back, Forward button)

### Clicks on anchor elements are filtered down by the following criteria:
* Click is not modified (Control + click)
* Click is a left click
* Anchor does not contain "target" attribute
* Anchor does not contain "download" attribute
* Anchor does not contain "data-router-ignore" attribute
* Anchor contains a "href" attribute
* Anchor HREF is not to a different domain
* Anchor HREF is not to an email address (mailto: link)

### URL bar changes
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