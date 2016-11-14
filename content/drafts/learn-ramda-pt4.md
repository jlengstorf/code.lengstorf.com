---

date: 2016-10-23T13:00:00
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

slug: learn-functional-programming-ramda-pt4
series: functional-programming
series_title: Generate Markup From the Data and Display Photos
series_order: 4

images:
  - /images/code-lengstorf.jpg

category: front-end
tag:
  - ramda
  - javascript
  - functional programming

videoid: ICYLOZuFMz8
repo_url: https://github.com/jlengstorf/learn-ramda

---

This is the final installment in the [Functional Programming in the Real World series](/series/functional-programming/). In this part of the series, we'll work with the data returned from Instagram to generate markup and — finally — to display the images in our app.

{{< series-nav >}}

## How Do We Make This Giant Response Object Easy to Work With?

Now that we have the response from Instagram, we can see that it's organized like this (all but one media item have been removed for brevity):

``` json
{
  "pagination": {
    "next_url": "https://api.instagram.com/v1/users/30794906/media/recent?access_token=30794906.a1b2c3d.abcdef0123456789abcdef0123456789&count=16&max_id=1305322646359380905_30794906&callback=jsonp_1477439133443_90876",
    "next_max_id": "1305322646359380905_30794906"
  },
  "meta": {
    "code": 200
  },
  "data": [
    {
      "attribution": null,
      "tags": [
        "travel",
        "remotework",
        "adventure"
      ],
      "type": "image",
      "location": {
        "latitude": 49.25,
        "name": "Vancouver, British Columbia",
        "longitude": -123.1,
        "id": 213819997
      },
      "comments": {
        "count": 2
      },
      "filter": "Gingham",
      "created_time": "1476241529",
      "link": "https://www.instagram.com/p/BLcngG3BarJ/",
      "likes": {
        "count": 81
      },
      "images": {
        "low_resolution": {
          "url": "https://scontent.cdninstagram.com/t51.2885-15/s320x320/e35/14711940_641440612710141_8216518835226804224_n.jpg?ig_cache_key=MTM1OTEzNDkxNzc2MTgwNTAwMQ%3D%3D.2",
          "width": 320,
          "height": 320
        },
        "thumbnail": {
          "url": "https://scontent.cdninstagram.com/t51.2885-15/s150x150/e35/14711940_641440612710141_8216518835226804224_n.jpg?ig_cache_key=MTM1OTEzNDkxNzc2MTgwNTAwMQ%3D%3D.2",
          "width": 150,
          "height": 150
        },
        "standard_resolution": {
          "url": "https://scontent.cdninstagram.com/t51.2885-15/s640x640/sh0.08/e35/14711940_641440612710141_8216518835226804224_n.jpg?ig_cache_key=MTM1OTEzNDkxNzc2MTgwNTAwMQ%3D%3D.2",
          "width": 640,
          "height": 640
        }
      },
      "users_in_photo": [
        {
          "position": {
            "y": 0.7666666666666667,
            "x": 0.528
          },
          "user": {
            "username": "jlengstorf",
            "profile_picture": "https://scontent.cdninstagram.com/t51.2885-19/s150x150/12479385_579079358915033_1441286595_a.jpg",
            "id": "30794906",
            "full_name": "Jason Lengstorf"
          }
        }
      ],
      "caption": {
        "created_time": "1476241529",
        "text": "I'm experimenting with my video lighting setup, and I've decided I definitely don't know enough to do night shots; I look like a shiny psychopath.",
        "from": {
          "username": "jlengstorf",
          "profile_picture": "https://scontent.cdninstagram.com/t51.2885-19/s150x150/12479385_579079358915033_1441286595_a.jpg",
          "id": "30794906",
          "full_name": "Jason Lengstorf"
        },
        "id": "17857394470069241"
      },
      "user_has_liked": false,
      "id": "1359134917761805001_30794906",
      "user": {
        "username": "jlengstorf",
        "profile_picture": "https://scontent.cdninstagram.com/t51.2885-19/s150x150/12479385_579079358915033_1441286595_a.jpg",
        "id": "30794906",
        "full_name": "Jason Lengstorf"
      }
    },
  ]
}
```

This is _way too much data_ for what we're trying to do. And beyond that, it makes access the data really cumbersome. For example, to get the thumbnail URI right now, we need to do something like this:

``` js
const thumbnail = response.data[0].images.thumbnail.url;
```

For a simple app like ours, we only need a tiny bit of data. Ideally, we'd just have something like this for each image:

``` json
{
  "src": "https://scontent.cdninstagram.com/t51.2885-15/s320x320/e35/14711940_641440612710141_8216518835226804224_n.jpg?ig_cache_key=MTM1OTEzNDkxNzc2MTgwNTAwMQ%3D%3D.2",
  "caption": "I'm experimenting with my video lighting setup, and I've decided I definitely don't know enough to do night shots; I look like a shiny psychopath.",
  "user": "jlengstorf",
  "link": "https://www.instagram.com/p/BLcngG3BarJ/",
}
```

This is much simpler, and includes only the data we need for our app.

So our first task will be to simplify the response from Instagram.

To do this, we will:

1. Extract just the images from the response
2. Create a simplified object using only the data we want for each image
3. Map the lens creation function to all the images in the array

## Extract Only the Images From the Response

This step is simple: we just need to grab the images out of the response. They're stored in the `data` key of the response object, so we can use Ramda's [`prop`](http://ramdajs.com/docs/#prop) function to select them.

Add the following to `src/scripts/instagram-feed-reader.js`:

``` js
const getPhotos = prop('data');
```

If we run this function with some sample data, we can see that it works as expected:

``` js
const testResponse = {
  unused: 'this is not used',
  data: [
    { test: 'foo' },
    { test: 'bar' },
  ],
};

getPhotos(testResponse);
//=> [{"test": "foo"}, {"test": "bar"}]
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/JqfN6F) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

## Create an Object With Only the Data We Need for Each Image

Accessing the data in the Instagram response as-is would be pretty brittle What if Instagram changes `images.low_resolution` to `images.small`? Or renames `user.username` to `user.display_name`?

**If we're accessing the data directly, we have to update every place in our code that uses it.** In a complex app, this could lead to a lot of work — not to mention leaving room for missed updates and the bugs that follow.

So instead, we're going to create a smaller, simpler object that uses _only_ the data we need. This is easy to update, and if the API response changes in the future, we only need to update a single function to make the app compatible. (This also allows us to write automated tests that will fail if the API response changes, eliminating our need to manually check the response.)

### Simplifying objects the functional programming way.

We accomplish this by using Ramda's [`applySpec`](http://ramdajs.com/docs/#applySpec), which lets us define an object and set functions to determine each value.

Here's a simple example to show how that works in practice:

``` js
const favorites = {
  bears: {
    first: 'grizzly',
    second: 'panda',
    third: 'koala',
  },
  beverages: [ 'whiskey', 'rum', 'gin' ],
};

const extractFavoriteThings = applySpec({
  bear: path([ 'bears', 'first' ]),
  beverage: compose(head, prop('beverages')),
});

extractFavoriteThings(favorites);
//=> {"bear": "grizzly", "beverage": "whiskey"}
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/eijyQl) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

This example takes a somewhat complex object with two groups of favorite things, and creates a much simpler object that only contains the _most_ favorite thing from each group.

{{% aside %}}
  **NOTE:** The [`head`](http://ramdajs.com/docs/#head) function retrieves the first item from an array.
{{% /aside %}}

### Write the function to simplify image data.

Earlier, we landed on a simplified object structure for each image:

``` json
{
  "src": "https://scontent.cdninstagram.com/t51.2885-15/s320x320/e35/14711940_641440612710141_8216518835226804224_n.jpg?ig_cache_key=MTM1OTEzNDkxNzc2MTgwNTAwMQ%3D%3D.2",
  "caption": "I'm experimenting with my video lighting setup, and I've decided I definitely don't know enough to do night shots; I look like a shiny psychopath.",
  "user": "jlengstorf",
  "link": "https://www.instagram.com/p/BLcngG3BarJ/",
}
```

To create this, add the following to `src/scripts/instagram-feed-reader.js` below the `getPhotos` function:

``` js
const extractImageData = applySpec({
  src: path(['images', 'low_resolution', 'url']),
  caption: path(['caption', 'text']),
  link: prop('link'),
  user: path(['user', 'username']),
});
```

This accesses the deeply-nested properties of the Instagram response and returns an object that will be far simpler to work with later on.

## Simplify All the Images in the Array

To convert each of our image objects to this simplified format, we need to _map_ the function to the image array.

This is similar to `mapObjIndexed`, which we used in `formatArgs`, but it's simpler: Ramda's [`map`](http://ramdajs.com/docs/#map) function simply calls a given function on each item in a given array.

Here's a silly example of how that works:

``` js
const people = [
  {
    name: 'Marisa',
    spirit_animal: 'koala',
    favorite_beverage: 'tea',
  },
  {
    name: 'Jason',
    spirit_animal: 'bear',
    favorite_beverage: 'whiskey',
  },
];

// Obviously, anyone whose favorite beverage isn’t whiskey is mistaken.
const fixFavoriteBeverage = assoc('favorite_beverage', 'whiskey');

// It doesn’t work if we call the function on the array itself.
fixFavoriteBeverage(people);
//=> {"0": {"favorite_beverage": "tea", "name": "Marisa", "spirit_animal": "koala"}, "1": {"favorite_beverage": "whiskey", "name": "Jason", "spirit_animal": "bear"}, "favorite_beverage": "whiskey"}

// Map applies the function to each element in the array.
map(fixFavoriteBeverage, people);
// => [{"favorite_beverage": "whiskey", "name": "Marisa", "spirit_animal": "koala"}, {"favorite_beverage": "whiskey", "name": "Jason", "spirit_animal": "bear"}]
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/2it8UB) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

### Map the simplification function to all images in the response.

In our app, we need to map the `extractImageData` function to the images as returned from `getPhotos`.

Thanks to the fact that we're writing this app functionally, we can simply compose these functions together. Add the following to `src/scripts/instagram-feed-reader.js` below `extractImageData`:

``` js
const handlePhotos = compose(map(extractImageData), getPhotos);
```

### Add the image data processing function to the fetching function.

Now that we have functions that will convert our API response into an array of simple image objects, we need to include it as the next step in our unsafe `fetchMediaAsJSON` function:

``` diff
  const unsafe = {
    renderStringToDOM: (selector, htmlStr) => {
      document.querySelector(selector).innerHTML = htmlStr;
    },

    fetchMediaAsJSON: endpoint => {
      return fetchJSONP(endpoint)
        .then(data => data.json())
+       .then(logAndReturn)
+       .then(handlePhotos)
        .then(logAndReturn);
    },
  };
```

After saving these changes, we can reload the app in our browser and — after authenticating — see the array of simplified data objects logged in the console.

{{< amp-img src="/images/learn-functional-programming-ramda-05.jpg"
            height="585" >}}
  The console output now shows a much simpler array of image data objects.
{{< /amp-img >}}

## Generate Markup From the Array of Image Objects

At this point, we have an array of simple image objects — the heavy lifting is done. From here, we just need to create markup to display the images, and then we can plug them into the page — and we'll be done!

### Write a function to create markup from each image object.

The first function we need to create will take the image data and turn that into a string of HTML markup.

This function doesn't use Ramda; it's a straight-up vanilla JS function. Add it to `src/scripts/instagram-feed-reader.js` below `handlePhotos`:

``` js
const createImage = image => {

  // Bemmit makes BEM class names less unwieldy.
  const getClass = bemmit('instagram-feed');

  // Get class names ahead of time to keep things cleaner.
  const figureClass = getClass();
  const linkClass = getClass('link');
  const imageClass = getClass('image');
  const captionClass = getClass('caption');

  return `
    <figure class="${figureClass}">
      <a href="${image.link}" class="${linkClass}">
        <img src="${image.src}" alt="Photo by ${image.user}"
             class="${imageClass}" />
      </a>
      <figcaption class="${captionClass}">${image.caption}</figcaption>
    </figure>
  `;
};
```

This function is pretty straightforward: it accepts an image object, then returns a string of HTML markup that we can render into the app.

{{% aside %}}
  **NOTE:** To shortcut BEM class name creation, we're using [Bemmit](https://www.npmjs.com/package/bemmit).
{{% /aside %}}

### Map the markup function to each image in the array.

Since the image objects are in an array, we need to `map` the `createImage` class to the array.

Add the following to `src/scripts/instagram-feed-reader.js` below `createImage` to accomplish this:

``` js
const getImageMarkupArray = map(createImage);
```

### Create a single string of markup from the array of image markup.

After mapping `createImage` to the image array, we now have an array of markup strings.

{{< amp-img src="/images/learn-functional-programming-ramda-06.jpg"
            height="335" >}}
  The resulting array of markup strings.
{{< /amp-img >}}

Before we can do too much with this, we want to convert it into a single string.

For this, we'll use [`reduce`](http://ramdajs.com/docs/#reduce), which uses a function (called a _reducer_) to iterate through each item in an array, updating a value (called an _accumulator_) each time, until the entire array is _reduced_ (get it?) to a single value.

The [standard example](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce#How_reduce_works) is to show how to reduce an array of numbers:

``` js
const numbers = [1, 2, 3];
const initialValue = 0;
const reducer = (accumulator, current) => {
  console.log(`${accumulator} + ${current} = ${accumulator + current}`);
  return accumulator + current;
};
numbers.reduce(reducer, initialValue);
// log output:
//   0 + 1 = 1
//   1 + 2 = 3
//   3 + 3 = 6
//=> 6
```

{{% code-caption %}}
  You can also [play with this example](https://goo.gl/TQZ1FM) on the Ramda <abbr title="Read-Eval-Print Loop">REPL</abbr>.
{{% /code-caption %}}

But that's not all `reduce` can do. In addition to doing math — which admittedly falls into the neat-but-why-should-I-care category — we can use `reduce` to perform complex operations to create single values from lists of values, like combining an array of strings into a single string.

Add the following to `src/scripts/instagram-feed-reader.js` below `getImageMarkupArray`:

``` js
const combineImageMarkup = reduce(concat, '');
```

To create a single string, we use [`concat`](http://ramdajs.com/docs/#concat) as the reducer function and an empty string (`''`) as the initial value. The result of `combineImageMarkup` is a single string containing the markup for all of our media uploads.

{{% aside %}}
  **NOTE:** For another practical use-case for `reduce`, I wrote an article on [converting a form's values to JSON]({{< ref "get-form-values-as-json.md" >}}) that reduces the input values into an object.
{{% /aside %}}

#### Pass the list of markup to the function that combines it.

Next, we simply compose `getImageMarkupArray` with `combineImageMarkup` in a new function called `generateMarkup`, which allows us to add this functionality to the next `then` statement in `fetchMediaAsJSON`.

Add the following to `src/scripts/instagram-feed-reader.js`:

``` js
const generateMarkup = compose(combineImageMarkup, getImageMarkupArray);
```

#### Add the markup generation function to the image-fetching function.

Finally, to put this functionality to work, let's add it to the unsafe `fetchMediaAsJSON` function's Promise chain:

``` diff
   fetchMediaAsJSON: endpoint => {
     return fetchJSONP(endpoint)
       .then(data => data.json())
       .then(logAndReturn)
       .then(handlePhotos)
+      .then(logAndReturn)
+      .then(generateMarkup)
       .then(logAndReturn);
   },
```

After saving this, we can reload the app and check the console output to see the markup string.

{{< amp-img src="/images/learn-functional-programming-ramda-07.jpg"
            height="335" >}}
  The full markup string, ready to insert into the DOM.
{{< /amp-img >}}

## Display the Generated Markup on the Page

Finally, we need to insert the markup into the app.

But, wait! We've already done that when we built our login function.

And that means we only need to add our pre-existing `render` function into the `fetchMediaAsJSON` Promise chain:

``` diff
  fetchMediaAsJSON: endpoint => {
    return fetchJSONP(endpoint)
      .then(data => data.json())
      .then(logAndReturn)
      .then(handlePhotos)
      .then(logAndReturn)
      .then(generateMarkup)
-     .then(logAndReturn);
+     .then(logAndReturn)
+     .then(render);
  },
```

Now we can reload our app, make sure we're authenticated, and see our most recent uploads.

{{< amp-img src="/images/learn-functional-programming-ramda-08.jpg"
            height="510" >}}
  The full app, working as expected.
{{< /amp-img >}}

## Wrapping Up: Is Functional Programming Worth It?

When I first looked at functional programming, I thought to myself, "Why the fuck would I spend so much extra time writing all these functions when I could just write one function to do everything?"

**It seemed like a lot of work to write code this way, and I wasn't sure I believed that the benefits outweighed the effort.**

For my workflow, I've found that using _only_ functional programming can be cumbersome. Some operations — especially when we're dealing with DOM manipulation and other common client-side tasks that are, by necessity, side-effects — get too confusing and awkward.

_However_, there's no disputing that **applying functional programming principles in most of my code has yielded a ton of benefits:**

1. **Writing DRY code happens by default.** We don't have to untangle complex functions to reuse certain steps, and building new functions often just means plugging together existing functions rather than writing new code.
2. **Writing tests is _easy_.** I know that if I put the same arguments in, the same arguments should come out. Every time. No matter what. No state management or mocking required.
3. **Maintenance is far less painful.** Almost every step is encapsulated in a function that describes what it's doing — this means the code is self-documenting be design, and helps cut down on time spent writing comments to clarify intent (and the greater amount of time wasted when the comments _weren't_ written and you have no idea how or why something you wrote months ago works).

The big takeaway from learning to write code functionally is this: **functional programming, when applied as a sane default approach and not as dogma, proviced _enormous_ benefits to the reliability, clarity, and maintainability of your code.**

So what do you think? Did I convince you to use functional programming? Do you have questions? Want to argue about monads? [Tweet at me.](https://twitter.com/jlengstorf)

## Further Reading

- [Favoring Curry](http://fr.umio.us/favoring-curry/) — one of the most helpful posts I've found for practically applying functional programming concepts; this is a must-read if you're just getting started.
- [Thinking In Ramda](http://randycoulman.com/blog/2016/05/24/thinking-in-ramda-getting-started/) — this is the first part of a series that's helpful for getting your head around some of the terminology in functional programming.
