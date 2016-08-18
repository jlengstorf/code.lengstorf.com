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

In the first part of this series, we walked through the process of [setting up Rollup as a front-end build tool for JavaScript]({{< ref "learn-rollup-js.md" >}}).

This article covers parts two and three.

First, we'll continue working on that project in [Part II](#stylesheets) to add support for stylesheet processing through [Rollup](http://rollupjs.org/), using [PostCSS](https://github.com/postcss/postcss) to run some transforms and allow us to use syntactic sugar like simpler variable syntax and nested rules.

After that, we'll wrap up with [Part III](#livereload), where we'll add file watching and live reloading to the project so we don't have to manually regenerate the bundle whenever files are changed.

## Prerequisites

- We'll be continuing with the project we started last week, so if you haven't gone through that part yet, it's [probably worth a look]({{< ref "learn-rollup-js.md" >}}).

{{% aside %}}
  **NOTE:** If you don't have a copy of the project, you can clone the project as it stands at the end of Part I using this command: `git clone -b part-2-starter --single-branch https://github.com/jlengstorf/learn-rollup.git`
{{% /aside %}}

## Series Navigation

- [Part I: How to Use Rollup to Process and Bundle JavaScript Files]({{< ref "learn-rollup-js.md" >}})
- [Part II: How to Use Rollup to Process and Bundle Stylesheets]({{< ref "learn-rollup-css.md" >}}) <— you are here
- [Part III: How to Use Rollup to Watch and Live Reload Files During Development]({{< ref "learn-rollup-css.md#livereload" >}})

## Part II: How to Use Rollup.js for Your Next Project: PostCSS {#stylesheets}

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

### Step 3: Install the necessary PostCSS plugins.

I love PostCSS. I started out in the LESS camp, found myself more or less forced into the Sass camp when everyone abandoned LESS, and then was extremely happy to learn that PostCSS existed.

I like it because it gives me access to the parts of LESS and Sass that I liked — nesting, simple variables — and doesn't open me up to the parts of LESS and Sass that I think were tempting and dangerous,[^dangerous] like logical operators.

[^dangerous]:
    I say "dangerous" because the logical features of LESS/Sass always felt a little flimsy to me, and in discussions with people they were always a sticking point. That was a red flag: using them introduced a kind of brittleness in a stylesheet, and while one person may be perfectly clear on what's going on, the rest of the team may feel like mixins are voodoo pixie magic — and that's never good for maintainability.

One of the things that I like most about it is the use of plugins, rather than an overarching language construct called "PostCSS". We can choose only the features we'll actually use — and more importantly, we can leave out the features we _don't_ want used.

So in our project, we'll only be using four plugins — two for syntactic sugar, one to support new CSS features in older browsers, and one to compress and minify the resulting stylesheet:

- [`postcss-simple-vars`](https://github.com/postcss/postcss-simple-vars) — This allows the use of Sass-style variables (e.g. `$myColor: #fff;`, used as `color: $myColor;`) instead of the more verbose [CSS syntax](https://www.w3.org/TR/css-variables/) (e.g. `:root { --myColor: #fff; }`, used as `color: var(--myColor);`). This is purely preferential; I like the shorter syntax better.
- [`postcss-nested`](https://github.com/postcss/postcss-nested) — This allows rules to be nested. I actually don't use this to nest rules; I use it as a shortcut for creating [BEM-friendly selectors](http://getbem.com/naming/) and grouping my blocks, elements, and modifiers into single CSS blocks.
- [`postcss-cssnext`](http://cssnext.io/) — This is a bundle of plugins that enables the most current CSS syntax (according to the [latest CSS specs](https://www.w3.org/Style/CSS/current-work)), transpiling it to work, even in older browsers that don't support the new features.
- [`cssnano`](http://cssnano.co/) — This compresses and minifies the CSS output. This is to CSS what [UglifyJS](https://github.com/mishoo/UglifyJS2) is to JavaScript.

To install these plugins, use this command:

``` sh
npm install --save-dev postcss-simple-vars postcss-nested postcss-cssnext cssnano
```

### Step 4: Update `rollup.config.js`.

Next, let's include our PostCSS plugins in `rollup.config.js` by adding a `plugins` property to the `postcss` configuration object:

``` js
// Rollup plugins
import babel from 'rollup-plugin-babel';
import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import replace from 'rollup-plugin-replace';
import uglify from 'rollup-plugin-uglify';
import postcss from 'rollup-plugin-postcss';

// PostCSS plugins
import simplevars from 'postcss-simple-vars';
import nested from 'postcss-nested';
import cssnext from 'postcss-cssnext';
import cssnano from 'cssnano';

export default {
  entry: 'src/scripts/main.js',
  dest: 'build/js/main.min.js',
  format: 'iife',
  sourceMap: 'inline',
  plugins: [
    postcss({
      plugins: [
        simplevars(),
        nested(),
        cssnext({ warnForDuplicates: false, }),
        cssnano(),
      ],
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

{{% aside %}}
  **NOTE:** We pass `{ warnForDuplicates: false }` to `cssnext()` because both it and `cssnano()` use [Autoprefixer](https://github.com/postcss/autoprefixer), which triggers a warning. Rather than wrestling with the config, we'll just know that it's being run twice (which is harmless in this case) and silence the warning.
{{% /aside %}}

### Check the output in the `<head>`.

With the plugins installed, we can rebuild our bundle (`./node_modules/.bin/rollup -c`) and open `build/index.html` in our browser. We'll see that the page is now styled, and if we inspect the document we can see the stylesheet was injected in the head, compressed and minified and with all the vendor prefixes and other goodies we expected from PostCSS:

{{< amp-img src="/images/learn-rollup-06.jpg" >}}
  The stylesheet is processed by PostCSS and injected by Rollup.
{{< /amp-img >}}

Great! So now we have a pretty solid build process: our JavaScript is bundled, unused code is removed, and the output is compressed and minified, and our stylesheets are processed by PostCSS and injected into the head.

However, it's still kind of a pain in the ass to have to manually rebuild the bundle every time we make a change. So in the next part, we'll have Rollup watch our files for changes and reload the browser whenever a file is changed.

## Part III: How to Use Rollup.js for Your Next Project: LiveReload {#livereload}

At this point, our project is successfully bundling JavaScript and stylesheets, but it's still a manual process. And since every manual step in a process is a higher risk for failure than an automated step — and because it's a pain in the ass to have to run `./node_modules/.bin/rollup -c` every time we change a file — we want to make rebuilding the bundle automatic.

{{% aside %}}
  **NOTE:** If you don't have a copy of the project, you can clone the project as it stands at the end of Part II using this command: `git clone -b part-3-starter --single-branch https://github.com/jlengstorf/learn-rollup.git`
{{% /aside %}}

### Step 0: Add a watch plugin to Rollup.

TKTK

``` sh
npm install --save-dev rollup-watch
```

### Step 1: Create a script in `package.json` to run Rollup.

To make this all easier, 

``` json
{
  "scripts": {
    "dev": "rollup -c --watch",
  }
}
```

#### Test the watcher.

TKTK

{{< amp-img src="/images/learn-rollup-07.gif" srcset="/images/learn-rollup-07.gif" height="413" >}}
  With the watcher running, changes trigger a rebuild. The linter catches errors right away. Neat, huh?
{{< /amp-img >}}

### Step 2: Enable LiveReload to refresh the browser automatically.

TKTK

``` sh
npm install --save-dev livereload
```

``` json
{
  "scripts": {
    "dev": "rollup -c --watch",
    "reload": "livereload 'build/'",
  }
}
```

### Step 3: Run the watcher and LiveReload in parallel.

``` sh
npm install --save-dev npm-run-all
```

``` json
{
  "scripts": {
    "dev": "rollup -c --watch",
    "reload": "livereload 'build/' -d",
    "watch": "npm-run-all --parallel reload dev",
  }
}
```

Order matters here.




