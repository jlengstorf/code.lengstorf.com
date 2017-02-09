---
draft: true

date: 2017-02-08
type: blog

slug: lazyload-images-responsive

title: "Tutorial: Lazy Load Images Responsively Using srcset"
subtitle: >
    Speed up page loads and improve your site’s user experience: use JavaScript and built-in browser functionality to easily and quickly build a responsive image lazy loader.
seo_title: How to Lazy Load Images Using srcset
description: 

category: front-end

tag:
    - images
    - performance
    - javascript

images:
    - /images/jason-lengstorf.jpg

videoid: "ICYLOZuFMz8"
repo_url: https://github.com/jlengstorf/responsive-lazyload.js
---

Most websites today have a _ton_ of images on them. This is great, because lots of images can add a lot to the design of a site.

However, for people on slower connections, loading several dozen large images before the page is usable can be frustrating. Plus, for someone on a phone who's paying for data by the megabyte, loading 300MB of images before showing any content is a dick move.

Fortunately, there's a really simple solution for having our (picture of) cake and eating it, too: **lazy loading**.

Lazy loading means only downloading resources as they're needed, rather than downloading them all up front. For example, if you look at an article on [Medium](https://medium.com/), the images appear to fade in as you scroll — that's lazy loading in action.

The benefit here is that the page can be displayed quickly because off-screen assets are ignored. This adds a performance boost to the site, and — in the case of a pay-per-MB user — eliminates unnecessary (and expensive) bandwidth usage.

In this tutorial, we'll build a lazy loader that supports the [`srcset` attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/img#Example_3_Using_the_srcset_attribute), which lets us further optimize the size of images by delivering smaller assets for smaller viewports.

Our final script has no dependencies, is smaller than 1 KB _before_ gzipping, and will have an _enormous_ impact the perceived performance of your site.

## Part I: Markup and Styles

To start, we need to decide how our markup will look, then style it. 

### Step 0: Write the Lazy-Loaded Image Markup

In order to work properly, our markup needs to create a container with the same width and aspect ratio as the image it contains — this acts as a placeholder — and then define the image's `srcset` in a way that won't be loaded, but is easily accessible via JavaScript.

It will also set a transparent GIF as the value of `srcset` using a Base64-encoded data string, which allows us to keep the image from rendering its `src` attribute — which we use as a fallback for older browsers — and also prevents an unnecessary HTTP request.

{{% aside %}}
  **NOTE:** I picked up the GIF idea from [Ivo Petkov](https://ivopetkov.com/b/lazy-load-responsive-images/), whose lazy-loading solution was the inspiration for this post.
{{% /aside %}} 

If we're doing it right, the markup we come up with will be as simple as possible, and stay as close as we can to the semantic markup we'd use anyways. Ideally, we should be able to implement — or remove — this plugin with a single find-and-replace call on our existing markup.

```html
<div class="js--lazyload">
  <img alt="image description"
       src="http://placekitten.com/300/150"
       srcset="data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw=="
       data-lazyload="http://placekitten.com/300/150 300w,
                      http://placekitten.com/600/300 600w,
                      http://placekitten.com/690/345 690w,
                      http://placekitten.com/1380/690.jpg 1380w">
</div>
```

If we drop this markup into a document and load it in a browser... we see nothing.



## Part II: JavaScript

### Step 0: Configure the Build Pipeline

1. Install build dependencies
2. Create a `.babelrc`
3. Create a `webpack.config.js`
4. Add a script in `package.json` to build the production-ready package.

### Step 1: Check for Browser Support

1. Check for `srcset` support.
2. If it's supported, fire the initialization function.
3. If not, do nothing.

### Step 2: Write an Initialization Function

2. Find all container elements.
3. Add a loading class to containers.
4. Build a list of all images to be lazy-loaded using a (currently nonexistent) function.
5. Create a custom `lazyload-init` event for signaling when it's time to load.
6. Add an event handler to each image for the `load` event to:
    1. call a (currently nonexistent) function to remove the loading class from its container
    2. fire a callback to allow custom functionality
7. Add an event handler to the image for the custom `lazyload-init` event to:
    1. call a (currently nonexistent) function to trigger the image loader
8. Call a (currently nonexistent) function to check the document for images to be loaded immediately (e.g. images currently in the viewport).
9. Create an event handler for the `scroll` event to check if images should be loaded.

### Step 3: Find the Image Element Inside a Container

1. Get the container's tag name
2. If the container's tag name is `img`, return the container
3. Otherwise run `querySelector()` on the element to find the first `img` tag

### Step 4: Remove the Loading Class From the Image's Container

1. Create a loop that runs until we hit the body tag.
2. Check if the current element has the supplied class.
3. If so, remove it and end the loop.
4. If not, use the element's parent for the next iteration of the loop.

### Step 5: Load an Image

1. Update the value of `srcset` to the value of `data-lazyload`.
2. Set `data-loaded` to `true` to prevent duplicate loads.

Browsers have already done all the hard work of determining which image should be loaded, so we don't need to reinvent the wheel — we just have to give the browser a new `srcset` and it'll do the heavy lifting for us.

### Step 6: Check If an Element Is in the Viewport

1. Get the bounding client rectangle.
2. Get the viewport's height and width.
3. Return whether any part of the element is currently inside the viewport.

### Step 7: Conditionally Trigger an Image to Load

1. Check whether the image is:
    1. already loaded
    2. in the viewport
2. If so, dispatch the supplied event and return `true`.
3. If not, return `false`.

### Step 6: Add a Throttling Function for Better Performance

For events that fire in rapid succession, such as the `scroll` event, it's a good idea to implement a throttling function to prevent the page from bogging down.

1. Create a variable called `wait` that says whether or not a function should fire.
2. Return a function that checks the value of `wait` and:
    1. If `wait` is `true`, does nothing
    2. If `wait` is `false`, it:
        1. Executes the function
        2. Sets `wait` to `true`
        3. Creates a timeout to set `wait` to `false` at a specified point in the future

Our `throttle` function will allow functions to fire every 200 milliseconds, which is short enough to be more or less unnoticeable to the human eye, but will prevent a ton of function calls in rapid succession from slowing down the browser.

### Step 7: Add a Browser-Friendly Wrapper

To make sure that this module works in the browser as well as in preprocessed code, we're going to add a quick wrapper that attaches our module to the `window`. This is what we'll compress and minify as our "production" version.

1. Import the module
2. Attach it to the `window`

## Part III: Testing

Don't skip this part. I know you're about to skip this part. Stop it. Keep going.

### Step 1: Install the 
