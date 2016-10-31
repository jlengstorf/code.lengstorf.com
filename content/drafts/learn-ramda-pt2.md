+++

date = "2016-10-23T11:00:00"
type = "blog"

draft = true

seo_title = "How to Use Ramda in a Real Project — Step-by-Step Tutorial"
description = "Learn how to use Ramda to build a real-world app using test-driven, functional JavaScript in this in-depth tutorial."

title = "Functional Programming in the Real World"
subtitle = "Learn how to use Ramda to build a real-world app using test-driven, functional JavaScript in this in-depth tutorial."

slug = "learn-functional-programming-ramda-pt2"
series = "functional-programming"
series_title = "Build a Login Link and Authorize the User"
series_order = 2

images = [
    "/images/code-lengstorf.jpg"
]

category = "front-end"
tag = [
    "ramda",
    "javascript",
    "functional programming",
]
videoid = "ICYLOZuFMz8"
repo_url = "https://github.com/jlengstorf/learn-ramda"

+++

In the [first part of this series]({{< ref "learn-ramda-pt1.md" >}}), we discussed the challenges of learning functional programming, some of the benefits of using it, and set up the foundation for our application.

In this section we'll actually start coding: **we'll build the part of the app that displays a login button with a properly-formed Instagram authentication request URI, and add a check to see if the user is authenticated.**

Instagram's API allows us to use [client-side authorization](https://www.instagram.com/developer/authentication/), which means we can ask the user to authorize the app, and upon doing so they'll be redirected to the URI we specify with `#access_token=...` added to the end. Since our app is front-end only, we need to use this authorization flow.

## Series Navigation

{{< series-nav >}}

## Thinking functionally feels backward... at first.

One of the concepts in functional programming that's hard to get your head around at first is that you start with functions first, and only add data at the last possible minute.

### The Non-Functional Way

To create the login link, it may be tempting to just write a single function:

``` js
function getLoginLink() {
  const markup = `
    <a href="https://www.instagram.com/oauth/authorize/?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=token"
       class="instagram-feed__auth">
        Authorize Instagram
    </a>
  `;

  document.querySelector('#app').innerHTML = markup;
}
```

This totally works. But it hard-codes a few values, which means that later on we'll end up writing the same code twice.

This also introduces a _side-effect_ (modifying the DOM), which is a big no-no in functional programming — at least until _absolutely necessary_.

### The Functional Way

To make this function more, well, _functional_, we're going to break it down into steps:

1. Create a query string from an object of `key: value` pairs (we'll reuse this later)
    - Create URI-encoded `key=value` strings from each `key: value` pair
    - Combine the strings into a valid query string using `&`
2. Create the full URI and generate markup for a link
3. Render the generated markup into the page

Each of these steps represents a function that will accept one argument and return a value. What this allows us to do is _compose_ these functions, which is the functional programming way of saying "run these functions in sequence, using the return value of the first function as the argument for the next one, and so on".

## Create a query string from an object of `key: value` pairs.

For the authorization request, we need to pass the following arguments:

``` js
  const args = {
    client_id: IG_CLIENT_ID,
    redirect_uri: IG_REDIRECT_URI,
    response_type: 'token',
  };
```

But since we're sending them as part of a URI, they need to be formatted as a query string:

``` text
client_id=IG_CLIENT_ID&redirect_uri=IG_REDIRECT_URI&response_type=token
```

So our first task is to write a series of functions to step through the conversion process.

### Map a function to each argument that creates a `key=value` string.

In functional programming, the goal is to avoid logical loops like `for` and `while`. That doesn't mean, however, that we can't iterate over data.

Probably the most common way to iterate in functional programming is to use [`map`](http://ramdajs.com/docs/#map), which applies a function to each element of an array.

In our case, the data is an object, though — so the usual `map` approach doesn't work. Instead, we need to use Ramda's [`mapObjIndexed`](http://ramdajs.com/docs/#mapObjIndexed), which iterates over objects and gives us access to both the values _and_ the keys.

We also need to URI-encode the data, so we'll use `encodeURIComponent` (aliased as `esc`) to do that.

Inside `src/scripts/instagram-feed-reader.js`, add the following code:

``` js
// Alias this long-ass function name for brevity.
const esc = encodeURIComponent;

const formatArgs = mapObjIndexed((arg, key) => `${esc(key)}=${esc(arg)}`);
```

{{% aside %}}
  **IMPORTANT:** The `starter` branch we cloned at the beginning already has all the required Ramda functions and other modules imported. If you did not clone the starter repo, make sure to [check the starter script for the required imports](https://github.com/jlengstorf/instagram-feed/blob/starter/src/scripts/instagram-feed-reader.js). The remainder of the tutorial assumes you've cloned the starter branch and won't mention importing functions.
{{% /aside %}}

If we were to run this function as-is, using the arguments listed earlier, we'd get the following output:

``` js
{
    client_id: "client_id=IG_CLIENT_ID",
    redirect_uri: "redirect_uri=IG_REDIRECT_URI",
    response_type: "response_type=token"
}
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/BIx7wk) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

### Extract only the values from the object.

At this point, we don't actually need to keys in this object anymore. And in fact, since working with arrays is more manageable than working with objects in functional programming, it's better if we drop the keys altogether.

Ramda has us covered with the [`values`](http://ramdajs.com/docs/#values) function, which takes an object and returns only its values in an array.

If we call `values` using the output of `formatArgs`, we get the following:

``` js
[
    "client_id=IG_CLIENT_ID",
    "redirect_uri=IG_REDIRECT_URI",
    "response_type=token"
]
```

The `values` function takes an object and returns only its values as an array. This is helpful because we need to call additional functions, and it's easier to use a list (an array) than to use an object.

### Convert the array into a single string.

By running [`join`](http://ramdajs.com/docs/#join) with `&` as the first argument and the output of `values` as the second, we get a valid query string:

``` js
"client_id=IG_CLIENT_ID&redirect_uri=IG_REDIRECT_URI&response_type=token"
```

The `join` function in Ramda produces the same output as `Array.prototype.join`, but changes the API so we provide the glue (`&`) first, then the pieces (the array from `values`).

### Compose the pieces into a single function.

You'll notice that we haven't actually written any code to implement `values` and `join` yet — this is because we're going to do something cool that functional programming allows us to do: we're going to _compose_ these functions into a single, powerful function. Kind of like a superfunction.

Here's how it works:

1. We call our composed function and call it with our arguments object as the parameter.
2. It calls the first function in the composition — `formatArgs` — with the arguments object.
3. The second function — `values` — is then called _using the result of `formatArgs`_.
4. The third function — `join` — already has the glue parameter, so it's called with the result of `values`.
5. The composed function returns the result of `join`, which is the last function in the composition.

You can visualize this process like this:

``` js
const args = { drink: 'whiskey', type: 'bourbon' };
const result1 = formatArgs(args);
const result2 = values(result1);
join('&', result2);
//=>"drink=whiskey&type=bourbon"
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/zrWYyV) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

Or, if we condense that to a single line:

``` js
join('&', values(formatArgs({ drink: 'whiskey', type: 'bourbon' })));
//=>"drink=whiskey&type=bourbon"
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/pScLAR) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

However, we want to have this function ready to go _without needing the data beforehand_.

Using Ramda's [`compose`](http://ramdajs.com/docs/#compose) function, we can do exactly that:

``` js
// Look! No data!
const getQueryString = compose(join('&'), values, formatArgs);

getQueryString({ drink: 'whiskey', type: 'bourbon' });
//=>"drink=whiskey&type=bourbon"
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/hpH91C) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

### Holy shit. Did we just half-call a function?

If you look at `getQueryString`, you can see that we called `join` with only one argument: `&`.

"But doesn't `join` require two arguments?"

It sure does.

So why doesn't this cause our app to explode into a fiery ball of undefined variables and errors?

The reason this works is because of one of Ramda's — and most, if not all, functional programming languages' — most powerful features: [_currying_](https://hughfdjackson.com/javascript/why-curry-helps/).

The short version of currying is this: a curried function knows how many arguments are required for proper execution, and only executes if it's received that many functions. If it _doesn't_ receive all the required arguments, it instead returns a new functions that accepts the remaining arguments.

This gives us the power to create lazy functions — and that's _huge_.

A curried function means these snippets are functionally equivalent:

``` js
// A list of tasty beverages.
const dranks = ['bourbon', 'rum', 'gin'];

// Call join the usual way.
join(' ♥ ', dranks);
//=> "bourbon ♥ rum ♥ gin"

// Call join the lazy way.
const joinWithHeart = join(' ♥ ');
joinWithHeart(dranks);
//=> "bourbon ♥ rum ♥ gin"

// Call join the why-would-you-do-that way.
join(' ♥ ')(dranks);
//=> "bourbon ♥ rum ♥ gin"
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/BnBWXB) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

For our purposes, this is all we need to know: **Ramda lets us build half-cocked functions so we can pass them around and reuse them as needed.**

{{% aside %}}
  **NOTE:** Ramda functions are automatically curried. We can also curry our own functions using Ramda's [`curry`](http://ramdajs.com/docs/#curry) function.
{{% /aside %}}

### Put it all together in `instagram-feed-reader.js`.

Edit `src/scripts/instagram-feed-reader.js` and insert our composed function below the others:

``` diff
  // Alias this long-ass function name for brevity.
  const esc = encodeURIComponent;
  
  const formatArgs = mapObjIndexed((arg, key) => `${esc(key)}=${esc(arg)}`);
  
+ const getQueryString = compose(join('&'), values, formatArgs);
```

## Create the full URI and generate markup for a link.

For this step, all that's left to do is grab the Instagram API endpoint URI — `IG_API_OAUTH`, which is set in `.env` — combine it with the query string, and generate HTML markup as a string.

Add the following to the bottom of `src/scripts/instagram-feed-reader.js` to make it happen:

``` js
const buildLoginLink = args => {
  const queryString = getQueryString(args);
  const loginLink = `${IG_API_OAUTH}?${queryString}`;
 
  const getClass = bemmit('instagram-feed');
  const loginClass = getClass('auth');
 
  return `
    <a href="${loginLink}" class="${loginClass}">Authorize Instagram</a>
  `;
};
```

{{% aside %}}
  **NOTE:** This app uses [Bemmit](https://www.npmjs.com/package/bemmit), which is a small utility I wrote to make it simpler to create BEM class names. It looks like overkill in this function, but it comes in handy later on when we're creating more complex markup.
{{% /aside %}}

## Render the generated markup into the page.

Now that we have the code written that will build our login link markup, all that's left to do is insert that new markup into the page.

However, this brings up a challenge: **modifying the DOM is a side-effect.** And functional programming is against side-effects.

### Quarantine "unsafe" functions.

The reason side-effects are off-limits in functional programming is that they can create hard-to-find bugs.

For example, look at this function:

``` js
let currentFavoriteThing = 'whiskey';

function drinkFact() {
  return `We like to drink ${currentFavoriteThing}.`;
}

drinkFact();
//=> We like to drink whiskey.

// ... stuff happens in the app ...

// But wait! Our friend just gave us a sweet gift basket.
currentFavoriteThing = 'scented bubble bath';

// ... more stuff happens ...

// Later, we want to show our drink fact again.
drinkFact();
//=> We like to drink scented bubble bath.

// Wait, what? That’s gross.
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/c3Qupq) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

Since the function relies on outside data, we can't be sure of what it will return. Calling `drinkFact()` in one place can generate a different result than calling it in another place. This kind of unpredictable output can be a _huge_ source of headache when debugging.

As a result, the goal of functional programming is to keep functions _pure_ — or free of side effects — meaning that every call to a function with the same input will _always_ generate the same output. Total predictability means no chance of bizarre, impossible-to-find bugs later on.

Here's how we could make the `drinkFact` function pure:

``` js
function drinkFact(drink) {
  return `We link to drink ${drink}.`;
}

drinkFact('whiskey');
//=> We like to drink whiskey.

drinkFact('juice');
//=> We like to drink juice.
```

Since we have to explicitly provide the `drink` argument, it's much easier to see what's gone wrong if we get unexpected results. **In a pure function, we know _for sure_ that the function will always return the same result for the same argument.**

However, it's not always possible to keep functions pure in a real application. DOM manipulation, for example, cannot be pure — but our app wouldn't be very useful if it couldn't update the information on the page.

**So while we can't completely eliminate side-effects in a real-world app, we _can_ take steps to make it really obvious when side-effects are happening.**

To do this, we can add a visual warning that side-effects are present by wrapping all impure functions inside an `unsafe` object. This is a signal to future debuggers that the hunt for that infuriating bug should probably start here.

### Write a function to render a string of markup into a given element.

Our app is designed to write to a single element a `<div id="app"></div>`. However, that may change, so we'll make a reusable rendering function (inside an `unsafe` object, since it has side-effects) and then create a more specific version that targets our app div.

Add the following to the bottom of `src/scripts/instagram-feed-reader.js`:

``` js
const unsafe = {
  renderStringToDOM: (selector, htmlStr) => {

    // This is a side-effect.
    document.querySelector(selector).innerHTML = htmlStr;
  },
};

// Create a shortcut for rendering into our app’s wrapper element.
const render = htmlString => unsafe.renderStringToDOM('#app', htmlString);
```

We're writing two functions here:

1. A general-purpose function to put any string of markup into any element with a give `selector`
2. A highly-specific `render` function that inserts markup into our app's wrapper element

{{% aside %}}
  **NOTE:** I went back and forth on whether or not `render` should be in the `unsafe` object. On the one hand, it uses a function with side-effects, but on the other hand, that means that every function calling render (and any functions calling those functions) would also end up in `unsafe`, and that makes the API messy.

  Ultimately I decided only functions that _actually_ have side-effects are kept in `unsafe`, and functions that call them are not. I could be convinced to go the other way, though, so feel free to [tweet at me](https://twitter.com/intent/tweet?text=@jlengstorf&url=https://code.lengstorf.com/learn-functional-programming-ramda/) or [open an issue](https://github.com/jlengstorf/instagram-feed/issues) to discuss.
{{% /aside %}}

### Put it all together (and finally supply some data).

Up until now, we've been writing functions, but there's no data anywhere to be found. **This is a central tenet of functional programming: no data until the very end.**

Now that we've built this pipeline of functions to properly process our data, we can actually drop some data in and see what comes out the other side.

In `src/scripts/instagram-feed-reader.js`, add the following to the bottom of the file:

``` js
const showLogin = () => {
  const args = {
    client_id: IG_CLIENT_ID,
    redirect_uri: IG_REDIRECT_URI,
    response_type: 'token',
  };

  render(buildLoginLink(args));
};
```

This function defines the arguments for the query string, passes them to `buildLoginLink`, then passes the result of that to `render`, which will set the markup as the `innerHTML` of our app's wrapper element.

## Initialize the app.

The last thing we need to do before we can, you know, _see_ something in our app is to create an initialization function. Exporting this function allows us to import the Instagram feed-reader module to our main script and get things started.

This function will need to be updated later, when there are photos to display, but for now let's just have our `initialize` function call the `showLogin` function. Add the following to `src/scripts/instagram-feed-reader.js`:

``` js
export default function initialize() {
  showLogin();
}
```

Next, in `src/scripts/main.js`, import the modules and initialize the app:

``` diff
+ import loadRecentInstagramPosts from './instagram-feed-reader';
+ 
  // Create a debugger.
  import debug from 'debug';
  const log = debug('app:main');
  
  log('Starting the app...');
  
  // Start the app.
+ loadRecentInstagramPosts();
  
  log('App started.');

```

Now, when we reload the app, we see a login button. And what's better is that it works!

{{< amp-img src="/images/learn-functional-programming-ramda-02.gif"
            srcset="/images/learn-functional-programming-ramda-02.gif" 
            height="621" >}}
    Our login button works, and a token is generated.
{{< /amp-img >}}

## Check if the user is authenticated.

Now that we're able to request and receive access tokens from Instagram, we need to check whether or not the user is logged in.

To do that, we'll use Ramda's [`test`](http://ramdajs.com/docs/#test) function, which is a functional programming version of [`RegExp.prototype.test`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/test).

Make the following changes in `src/scripts/instagram-feed-reader.js`:

``` diff
  // ... earlier code ommitted for brevity
  
  const showLogin = () => {
    const args = {
      client_id: IG_CLIENT_ID,
      redirect_uri: IG_REDIRECT_URI,
      response_type: 'token',
    };
  
    render(buildLoginLink(args));
  };
  
+ const isLoggedIn = test(/^#access_token=/);
  
  export default function initialize() {
+   if (isLoggedIn(document.location.hash)) {
+   
+     // TODO load user media from Instagram
+
+   } else {
+     showLogin();
+   }
  }
```

The implicit authorization flow from Instagram will always redirect to the URI pattern `REDIRECT_URI#access_token=IG_ACCESS_TOKEN`, which looks something like this:

``` text
http://example.com/my-app/#access_token=12345678.a1b2c3d.abcdef1234567890abcdef1234567890
```

Because of this, we can assume the user is authenticated if the document hash starts with `#access_token=`. Taking advantage of currying, we create a function called `isLoggedIn` by passing the regular expression `/^#access_token=/` to `test`.

Then, in the `initialize` function, we call `isLoggedIn` with the current document hash — accessed using `document.location.hash` — as the final argument. This returns a `true` or `false` value that tells us whether or not the user is currently authorized.

If so, we can request their recent media from the Instagram API. If not, we show the login button.

Once we save and reload the app, logging in shows us the loading animation.

{{< amp-img src="/images/learn-functional-programming-ramda-03.jpg" 
            height="525" >}}
    After authenticating, we see the loading animation.
{{< /amp-img >}}

## What's Next?

In the [third part of this series]({{< ref "learn-ramda-pt3.md" >}}), we'll build and execute an API request to load the authenticated user's recent Instagram uploads.
