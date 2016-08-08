+++
date = "2016-05-07T19:47:19+09:00"
draft = true
title = "Building a Hosting a Static Site on Amazon AWS"
subtitle = "How to use Amazon S3 and CloudFront with Hugo to deploy an ultra-fast, ultra-cheap static blog."
slug = "build-a-static-site-pt1"
category = "cms"
tag = [
    "staticsites",
    "hugo",
    "aws",
    "s3",
    "cloudfront"
]
_videoid = "ADD THIS"
repo_url = "https://github.com/jlengstorf/tutorial-static-site"
+++
## What's In This Series

This is going to be fairly in-depth, so it'll be broken up across several posts.

Here's what we want to accomplish:

1. A super-fast, cheap-to-host static website.
2. Easier theme authoring using Pug instead of HTML.
3. Better CSS using PostCSS.
4. Future-facing JavaScript using Babel + webpack.
5. A simple asset pipeline using Gulp.
6. Live reloading during development with BrowserSync.
7. Amazon S3 deployment.
8. A CDN using Amazon CloudFront.

- Part I: Getting Started
    + The Dev Environment
        * Installing Hugo
    + The Asset Pipeline
        * Installing Gulp
        * Watching 
        * Using Pug instead of HTML for Hugo layouts
    + 
