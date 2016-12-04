---
date: 2016-10-23T12:00:00
type: blog

draft: true

seo_title: How to Use Ramda in a Real Project — Step-by-Step Tutorial
description: |
  Learn how to use Ramda to build a real-world app using test-driven, 
  functional JavaScript in this in-depth tutorial.

title: Functional Programming in the Real World
subtitle: |
  Learn how to use Ramda to build a real-world app using test-driven, 
  functional JavaScript in this in-depth tutorial.

slug: learn-functional-programming-ramda-pt3
series: functional-programming
series_title: Create an API Request and Load User Media
series_order: 3

images:
  - /images/code-lengstorf.jpg

category: front-end
tag:
  - ramda
  - javascript
  - functional programming

videoid: hJ2RVXEIgkk
video_settings:
  - key: listType
    val: playlist
  - key: list
    val: PLz8Iz-Fnk_eRM5oTjUdn2CQ7lPf-zmhVD
  - key: rel
    val: 0
repo_url: https://github.com/jlengstorf/learn-ramda
---

This is the third part in the [Functional Programming in the Real World series](/series/functional-programming/). In this part of the series, we'll build and execute an Instagram API request to retrieve the authenticated user's most recent uploads.

{{< series-nav >}}

## Build a Request to Load Recent Media From the Instagram API

Now that we have a valid token, we can start building the request that will load the user's recent media from Instagram's API.

To do this, let's think about it functionally and list out all of our steps. We need to:

1. Retrieve the token from the URI hash
2. Add the token to the arguments for the request
3. Format the arguments for the request as a query string
4. Build the full request URI for the Instagram API
5. Send the request to the Instagram API
6. Return the response as JSON for further processing

This is the first place where the power of functional programming starts to peek through: we've already built the function for formatting arguments, so we can simply reuse it here.

### Retrieve the access token.

First, we need to remove the `#access_token=` from the hash, which we can do using Ramda's [`replace`](http://ramdajs.com/docs/#replace), which is a functional version of [`String.prototype.replace`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/replace).

Add the following to `src/scripts/instagram-feed-reader.js`, above the `initialize` function:

``` js
const getToken = replace('#access_token=', '');
```

### Include the token in the arguments.

Next, we need a way to include the token in the arguments. This is done using Ramda's [`assoc`](http://ramdajs.com/docs/#assoc), which takes a key, a value, and an object into which they should be inserted:

``` js
const darkKnight = { hero: 'Batman' };
assoc('villain', 'Joker', darkKnight);
//=> {"hero": "Batman", "villain": "Joker"}
```
{{% code-caption %}}
  You can also [play with this example](https://goo.gl/GDfPAM) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

In order to avoid hard-coding data, we're going to create a function called `addTokenToArgs`, which is the curried result of calling `assoc` with just the first parameter — a key of `access_token` — applied.

Add the new function just below `getToken` in `src/scripts/instagram-feed-reader.js`:

``` js
const addTokenToArgs = assoc('access_token');
```

Calling this function requires two arguments: the retrieved access token, and the arguments object.

At this point, we can add a token to our arguments object like so:

``` js
const token = getToken('#access_token=a_mighty_roar');
const args = {
  name: 'Jason',
  spirit_animal: 'bear',
};

addTokenToArgs(token, args);
//=> {"access_token": "a_mighty_roar", "name": "Jason", "spirit_animal": "bear"}
```
{{% code-caption %}}
  You can also [play with this example](https://goo.gl/YF5BYf) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

### Format the arguments as a query string.

Now that we have function to create an object with all the arguments we need to make a request to the Instagram API, we can add functions to convert that object into a query string.

Fortunately, we already wrote `getQueryString`, so all we have to do to include the new steps for adding the token is to use `compose` to combine it with our new `addTokenToArgs` function.

To do this, add a new function called `getQueryStringWithToken` below `addTokenToArgs` in `src/scripts/instagram-feed-reader.js`:

``` js
const getQueryStringWithToken = compose(getQueryString, addTokenToArgs);
```


{{% aside %}}
  **NOTE:** Something important to notice here is that `getQueryString` only takes one argument (the arguments object), but `getQueryStringWithToken` takes a second argument: the token.

  That's because the first function called is `addTokenToArgs`, which requires both the token and the arguments, but returns the updated argument object for use with `getQueryString`.
{{% /aside %}}

Now we can create a query string _with_ a token (for the media request) and _without_ a token (for authentication requests) — and we were able to share a good portion of the code between these two goals.

If we call the functions now, we get the expected query strings back:

``` js
const token = getToken('#access_token=a_mighty_roar');
const args = {
  name: 'Jason',
  spirit_animal: 'bear',
};

getQueryString(args);
//=> "name=Jason&spirit_animal=bear"

getQueryStringWithToken(token, args);
//=> "name=Jason&spirit_animal=bear&access_token=a_mighty_roar"
```
{{% code-caption %}}
  You can also [play with this example](https://goo.gl/XbA25w) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

### Build the full request URI.

The final step in this process is to use the query string to build a valid request URI.

This will be handled by a function that uses Ramda's [`concat`](http://ramdajs.com/docs/#concat) to combine the [Instagram endpoint for loading the logged-in user's recent media](https://www.instagram.com/developer/endpoints/users/#get_users_media_recent_self) (which is stored in an environment variable in this app; see `.env`) with the the query string generated by `getQueryStringWithToken`.

We'll call it `getRecentMediaEndpoint`, and place it just above the `initialize` function in `src/scripts/instagram-feed-reader.js`.

``` js
const getRecentMediaEndpoint = concat(`${IG_API_SELF_MEDIA_RECENT}?`);
```

To get the full URI as a string, we can `compose` this new function with `getQueryStringWithToken`. Add the following to `src/scripts/instagram-feed-reader.js`:

```js
const buildRequestURI = compose(getRecentMediaEndpoint, getQueryStringWithToken);
```

Calling this while logged in would result in a URI similar to the following:

``` text
https://api.instagram.com/v1/users/self/media/recent/?count=16&access_token=12345678.a1b2c3d.abcdef1234567890abcdef1234567890
```

{{% aside %}}
  **NOTE:** The "count" is used to tell Instagram how many media items to return. We aren't quite there yet, so don't worry about it for now.
{{% /aside %}}

## Make a JSONP Request to the Instagram API

Now that we have a full API request URI, all that's left to do is send the request to Instgram.

### Use JSONP to bypass CORS restrictions.

Since Instagram doesn't allow [cross-origin requests (CORS)](https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS), we need to use a technique called [JSONP](http://stackoverflow.com/a/3840118/463471), which means that Instagram will wrap the response in a callback to bypass the cross-origin restrictions.

{{% aside %}}
  **NOTE:** You don't need to know or care about JSONP for this app; we have a great third-party package to solve this problem for us. It never hurts to know what's happening under the hood, though.
{{% /aside %}}

### The request is handled by Promises.

Due to the asynchronous nature of making API requests, we have to handle the response differently than a standard function output. My current preferred way of handling async code is [Promises](https://github.com/getify/You-Dont-Know-JS/blob/master/async%20%26%20performance/ch3.md), which allow us to define actions in an easy-to-read, chronological order:

``` js
// Assume that getArticles() returns a Promise
getArticles()
    .then(formatArticles)
    .then(displayArticles);
```

It's very easy to tell what's going on here, even if you've never used Promises before: the `getArticles` function executes, then the `formatArticles` function executes, then the `displayArticles` function executes. Each of these functions has access to the result of the previous step (kind of like `compose`), so we can easily define a series of steps for our data.

### Write the unsafe function that sends the JSONP request.

Asynchronous requests are impure because they don't return a value. So we need to add our new function to the `unsafe` object.

Update the `unsafe` object in `src/scripts/instagram-feed-reader.js` with the highlighted lines:

``` diff
  const unsafe = {
    renderStringToDOM: (selector, htmlStr) => {
      document.querySelector(selector).innerHTML = htmlStr;
    },
+
+   fetchMediaAsJSON: endpoint => {
+     return fetchJSONP(endpoint)
+       .then(data => data.json())
+       .then(logAndReturn);
+   },
  };
```

To make sending the request easy, we're using a third-party package called [fetch-jsonp](https://github.com/camsong/fetch-jsonp). We've imported the function to send a JSONP request as `fetchJSONP`, so we need to call that.

`fetchJSONP` returns a Promise, and in order to access JSON data, we need to call the `json` method on the response, which we do using `then`.

Finally — only for the purpose of seeing the output in development — we use another `then` to call our `logAndReturn` function, which will print its argument to the console and return it unchanged.

{{% aside %}}
  **NOTE:** The `logAndReturn` function was included in this tutorial's [starter code](https://github.com/jlengstorf/instagram-feed/tree/starter). It uses Ramda's [`tap`](http://ramdajs.com/docs/#tap) function — which executes a function on its argument, then returns the argument unchanged — to log the value without breaking the composability of our functions.
{{% /aside %}}

In the next section, we'll execute the request and actually take a look at some data.

## Execute the Request and Return the JSON Response

The last thing to do before we can actually see some data is to create a function to call our fetch function, then implement that in our `initialize` function.

### Write a function to start the API request with the right data.

To actually make the API request, we need to assemble our arguments and our token.

In `src/scripts/instagram-feed-reader.js`, add the following just above the `initialize` function:

``` js
const showPhotos = (args = { count: 16 }) => {
  const token = getToken(document.location.hash);
  const endpoint = buildRequestURI(token, args);

  unsafe.fetchMediaAsJSON(endpoint);
};
```

The arguments will be accepted as the argument, because we ultimately want to allow anyone using this script to alter the arguments when they call `initialize`. However, we're also going to set defaults in case they don't.

The token is then retrieved from `document.location.hash` using `getToken`, and the endpoint is generated using our `buildRequestURI` function.

Finally, we can call our unsafe fetch function using the generated endpoint.

{{% aside %}}
  **NOTE:** Although it might seem like a lot of work to set up this app in the functional programming way, we can see the payoff here. Look at how clean and self-descriptive this code is.
{{% /aside %}}

### Add the new function to the `initialize` function.

Now that we have a function to make the request, let's call it when the user is logged in. Update the `initialize` function in `src/scripts/instagram-feed-reader.js` as shown in the highlighted lines below:

``` diff
+ export default function initialize(args) {
    if (isLoggedIn(document.location.hash)) {
+     showPhotos(args);
    } else {
      showLogin();
    }
  }
```

We added an `args` argument to the `initialize` function — this is what allows anyone importing this module to modify the API arguments — and then pass `args` to `showPhotos` if the user is logged in.

After saving, we can open the app in our browser and authorize it, and the console will show us our recent Instagram media.

{{< amp-img src="/images/learn-functional-programming-ramda-04.jpg"
            height="630" >}}
    We’re now successfully loading data from the Instagram API.
{{< /amp-img >}}

## What's Next?

We can see that Instagram sends a _ton_ of data back in its response — we don't need all of that. In the [final part of this series]({{< ref "learn-ramda-pt4.md" >}}), we'll wrestle that data into a simpler format that's easier to work with.
