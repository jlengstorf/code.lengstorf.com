+++

date = "2016-10-23T10:00:00"
type = "blog"

draft = true

seo_title = "How to Use Ramda in a Real Project — Step-by-Step Tutorial"
description = "Learn how to use Ramda to build a real-world app using test-driven, functional JavaScript in this in-depth tutorial."

title = "Functional Programming in the Real World"
_title = "How to Use Functional Programming in a Real Project, Part 1"
subtitle = "Learn how to use Ramda to build a real-world app using test-driven, functional JavaScript in this in-depth tutorial."

slug = "learn-functional-programming-ramda"
series = "functional-programming"
series_title = "Why Functional Programming + App Setup"
series_order = 1

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

For months, I've been seeing comments that hint at the advantages of functional programming:

- Functional programming is _so_ much easier to test!
- Functional programming is amazing for making code reusable!
- Functional programming makes maintenance a breeze!

But despite all that promise, there's a problem:

Functional programming is _really_ confusing. And it's confusing for two main reasons:

1. Functional programming feels awkward at first, because it forces us to reverse the way most of us think about coding.
2. **Most of the people talking about functional programming are so goddamn smart that the rest of us can't understand what the hell they're talking about.**

The average functional programming discussion is so far over my head that I don't even feel the _whoosh_ as it passes by.

Reading articles about functional programming stresses me out. I hate feeling stupid, and most discussions about functional programming make me feel _really_ stupid.

## So... Why Write a Tutorial About Functional Programming?

I don't really give a fuck about monads. I don't care at all about category theory, either. And I have literally no idea what lambda calculus is.

**What I _do_ care about is writing code that is simple to debug, simple to test, and simple to understand for someone who didn't write it.**

So when I talk about functional programming, it's not because I have an interest in the academia and mathematical theory behind it; it's because I have an interest in writing _good code that works_.

### I've really struggled with functional programming.

When I started trying to learn functional programming, I felt like I was too stupid to even read the documentation.

I mean, look at this:

``` text
(s → a) → ((a, s) → s) → Lens s a
Lens s a = Functor f => (a → f a) → s → f s
```

This is [how Ramda describes its lens function](http://ramdajs.com/docs/#lens). I've been told that this is called the function's "signature".

And I'm sure, if you know how to read it, this makes perfect sense. I, however, do not know how to read it.

The code examples don't offer much help, either:

``` js
var xLens = R.lens(R.prop('x'), R.assoc('x'));

R.view(xLens, {x: 1, y: 2});            //=> 1
R.set(xLens, 4, {x: 1, y: 2});          //=> {x: 4, y: 2}
R.over(xLens, R.negate, {x: 1, y: 2});  //=> {x: -1, y: 2}
```

Well, shit. So before I can really understand what `lens` does, I need to look up _five other functions_.

But even after I've done _that_, I'm still not really sure how I might use this in a real project. The terminology is over my head, and if I keep crawling down the rabbit hole I end up in — I swear to god I'm not making this up — [Fantasy Land](https://github.com/fantasyland/fantasy-land).

**Isn't there someone who can just please explain functional programming like I'm five?**

{{% aside %}}
  **NOTE:** I'm picking on Ramda here, but honestly they've put together _excellent_ documentation. The real issue is the enormous amount of assumed knowledge surrounding discussions about functional programming in general.
{{% /aside %}}

### There are very few (actually) practical examples.

**I tend to learn best by building a real project that puts new concepts into practice**. But there's a distinct lack of practical tutorials for functional programming. If you run a search for "practical functional programming tutorial", the first page of results doesn't have a single example application — just a bunch of example snippets.

And, look: that's not to claim that all the articles out there aren't any good. They're great; they just don't cover the concepts in my preferred learning style.

So that's why this article exists: **for anyone who learns better by _writing code_ than by _reading theory_, I wanted to create an _actually_ practical functional programming tutorial**.

And since I don't know the jargon and don't understand the mathematical theory, there will be no jargon and no mathematical theory — just a **real-world use-case for functional programming.**

## What Are We Building?

A common task I find myself tackling is to read data from an API, do something with the response, and show new elements on the page that display some of the data.

So that's what we're going to do in this app, using the Instagram API as our data source.

Once completed, our app will do the following:

1. Ask users to authenticate with Instagram
2. Make an AJAX request to the Instagram API for the user's recent photos
3. Process the API response and append newly-generated markup to the DOM

The goal is to create something complex enough to constitute a "real-world" application of functional programming, but not so complex that it takes hours to complete.

To see the final product, [check out the demo](https://code.lengstorf.com/instagram-feed/#access_token=30794906.99a650f.3f54c33a89294856a9b2ca2719aa29ea).

## Series Navigation

{{< series-nav >}}

## Prerequisites

- An Instagram account
- An Instagram client ID (set one up at the [Instagram Developer site](https://www.instagram.com/developer/clients/))
- At least a passing familiarity with ES 2015+

## Set Up the Project

To keep this tutorial from getting too far out of hand, we're going to use a starter app and avoid the hassle of setting up a build pipeline, writing HTML, and styling it.

The app uses [`http-server`](https://www.npmjs.com/package/http-server) to serve a static HTML file (with CSS embedded in the `<head>`). Since we want to have access to ES2015+ features, npm packages, and a few other nice-to-haves, we're going to use [Rollup](https://github.com/rollup/rollup) for transpiling and bundling our JavaScript.

In this section, we'll walk through the steps of cloning the starter app, getting the necessary credentials from Instagram, setting up environment variables, and enabling some debugging features.

{{% aside %}}
  **NOTE:** If you've never used Rollup before, check out my [tutorial on getting started with Rollup]({{< ref "learn-rollup-js.md" >}}).
{{% /aside %}}

### 1. Clone the repo.

``` sh
# Only clone the starter branch
git clone -b starter --single-branch https://github.com/jlengstorf/instagram-feed.git

# Move into the cloned repo
cd instagram-feed/

# Install dependencies
npm install
```

### 2. Create an Instagram client.

Create an [Instagram client](https://www.instagram.com/developer/clients/manage/) and copy the Client ID.

Make sure to set the "Valid redirect URIs" in the "Security" tab. (For development, this is `http://127.0.0.1:8080/`.)

### 3. Set environment variables.

``` sh
# Create a `.env` file
cp .env.EXAMPLE .env
```

Edit `.env` and set the `IG_CLIENT_ID` and `IG_REDIRECT_URI` variables with your own Client ID and redirect URI.

### 4. Start the app.

``` sh
# Start the app in development mode
npm run dev
```

### 5. View the app and enable debugging.

Once the app is running, you can open it at [127.0.0.1:8080](http://127.0.0.1:8080/) and authorize your Instagram account.

To see debugging output in the console, open the developer tools and enable debugging by entering the following in the console:

``` js
localStorage.debug = '*'
```

After reloading, we can see the app, as well as the debugging messages in the console.

{{< amp-img src="/images/learn-functional-programming-ramda-01.jpg" 
            height="505" >}}
    The starter, before we start building anything.
{{< /amp-img >}}

{{% aside %}}
  **NOTE:** We're using [`debug`](https://www.npmjs.com/package/debug) for console logging, which uses `localStorage` to determine whether or not to display messages. See the debug docs for more information.
{{% /aside %}}

## What's Next?

In the [second part of this series]({{< ref "learn-ramda-pt2.md" >}}), we'll build the user authentication portion of the app so we can get a valid token for sending requests to the Instagram API.
