## Series Navigation

- [Part I: How to Use Rollup to Process and Bundle JavaScript Files]({{< ref "drafts/learn-rollup-js.md" >}}) <— you are here
- [Part II: How to Use Rollup to Process and Bundle Stylesheets]({{< ref "drafts/learn-rollup-css.md" >}})
- [Part III: How to Use Rollup to Watch and Live Reload Files During Development]({{< ref "drafts/learn-rollup-css.md#livereload" >}})

+++

date = "2016-08-16"
type = "blog"
draft = true

seo_title = "How to Bundle Stylesheets With Rollup — Step-by-Step Tutorial"
description = "Learn how to use the JavaScript bundler Rollup — as an alternative for Grunt or Gulp — to process stylesheets using PostCSS in this step-by-step tutorial."

title = "Tutorial: How to Bundle Stylesheets With Rollup"
subtitle = "Learn how to use the JavaScript bundler Rollup — as an alternative for Grunt or Gulp — to process stylesheets using PostCSS in this step-by-step tutorial."

slug = "learn-rollup-css"
series = "rollup"

images = [
    "/images/code-lengstorf.jpg"
]

category = "build-tools"
tag = [
    "rollup",
    "javascript",
    "postcss",
    "modules"
]
videoid = "kR06NoSzAXY"
repo_url = "https://github.com/jlengstorf/learn-rollup-js"

+++

Last week, we walked through the process of [setting up Rollup as a front-end build tool for JavaScript]({{< ref "blog/learn-rollup-js.md" >}}).

This week, we'll continue working on that project to add support for stylesheet processing through [Rollup](http://rollupjs.org/), using [PostCSS](https://github.com/postcss/postcss) to run some transforms and allow us to use syntactic sugar like simpler variable syntax and nested rules.

## How to Use Rollup.js for Your Next Project: PostCSS

Another part of Rollup that's nice, depending on how your project is set up, is that you can easily process CSS and inject it into the `head` of the document.

On the plus side, this keeps all your build steps in one place, which keeps the complexity down in our development process — that's a big help, especially if we're working on a team.

But on the down side, we're making our stylesheets rely on JavaScript, and creating a brief flicker of unstyled HTML before the styles are injected. So this approach may not make sense for some projects, and should be weighed against approaches like using PostCSS separately.

Since this article is about Rollup, though: fuck it. Let's use Rollup!

### Step 0: Load the stylesheet in `main.js`.

This is a little funky if you've never used a build tool before, but stick with me. To use our styles in the document, we're not going to use a `<link>` tag like we normally would; instead, we're going to use an `import` statement in `main.min.js`.

Right at the top of `src/scripts/main.js`, load the stylesheet:

``` js
// Import styles (automatically injected into <head>).
import '../styles/main.css';

// Import a couple modules for testing.
import { sayHelloTo } from './modules/mod1';
import addArray from './modules/mod2';

// Import a logger for easier debugging.
import debug from 'debug';
const log = debug('app:log');

// The logger should only be disabled if we’re not in production.
if (ENV !== 'production') {

  // Enable the logger.
  debug.enable('*');
  log('Logging is enabled!');
} else {
  debug.disable();
}

// Run some functions from our imported modules.
const result1 = sayHelloTo('Jason');
const result2 = addArray([1, 2, 3, 4]);

// Print the results on the page.
const printTarget = document.getElementsByClassName('debug__output')[0];

printTarget.innerText = `sayHelloTo('Jason') => ${result1}\n\n`;
printTarget.innerText += `addArray([1, 2, 3, 4]) => ${result2}`;
```

### Step 1: Install PostCSS as a Rollup plugin.

The first thing we need is Rollup's PostCSS plugin, so install that with the following:

``` sh
npm install --save-dev rollup-plugin-postcss
```

### Step 2: Update `rollup.config.js`.

Next, let's add the plugin to our `rollup.config.js`:

``` js
// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';

export default {
  entry: 'src/scripts/main.js',
  dest: 'build/js/main.min.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    postcss({
      extensions: [ '.css' ],
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs(),
    eslint({
      exclude: [
        'src/styles/**',
      ]
    }),
    babel({
      exclude: 'node_modules/**',
    }),
    replace({
      ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
    }),
    (process.env.NODE_ENV === 'production' && uglify()),
  ],
};
```

#### Take a look at the generated bundle.

Now that we're able to process the stylesheet, we can regenerate the bundle and see how this all works.

Run `./node_modules/.bin/rollup -c`, then look at the generated bundle at `build/js/main.min.js`, right near the top. You'll see a new function called `__$styleInject()`:

``` js
function __$styleInject(css) {
  css = css || '';
  var head = document.head || document.getElementsByTagName('head')[0];
  var style = document.createElement('style');
  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }
  head.appendChild(style);
}
__$styleInject("/* Styles omitted for brevity... */");
```

In a nutshell, this function creates a `<style>` element, sets the stylesheet as its content, and appends that to the document's `<head>`.

Just below the function declaration, we can see that it's called with the styles output by PostCSS. Pretty snazzy, right?

Except right now, those styles aren't actually being processed; PostCSS is just passing our stylesheet straight across. So let's add the PostCSS plugins we need to make our stylesheet work in our target browsers.

### Step 3: Install your necessary PostCSS plugins.

I love PostCSS. I started out in the LESS camp, found myself more or less forced into the Sass camp when everyone abandoned LESS, and then was extremely happy to learn that PostCSS existed.

I like it because it gives me access to the parts of LESS and Sass that I liked — nesting, simple variables — and doesn't open me up to the parts of LESS and Sass that I think were tempting and dangerous,[^dangerous] like logical operators.

[^dangerous]:
    I say "dangerous" because the logical features of LESS/Sass always felt a little flimsy to me, and in discussions with people they were always a sticking point. That was a red flag: using them introduced a kind of brittleness in a stylesheet, and while one person may be perfectly clear on what's going on, the rest of the team may feel like mixins are voodoo pixie magic — and that's never good for maintainability.

One of the things that I like most about it is the use of plugins, rather than an overarching language construct called "PostCSS". We can choose only the features we'll actually use — and more importantly, we can leave out the features we _don't_ want used.

So in our project, we'll 

#### Allow simpler, Sass-style variables.

TKTK

`postcss-simple-vars`

#### Allow nested rules.

TKTK

`postcss-nested`

#### Enable new CSS features now.

TKTK

`postcss-cssnext`

#### Compress and minify the CSS output.

TKTK

`cssnano`

#### Check the output



## How to Use Rollup.js for Your Next Project: LiveReload

TKTK

### Step 1: Add a Watch Plugin to Rollup

TKTK

### Step 2: LiveReload

TKTK

