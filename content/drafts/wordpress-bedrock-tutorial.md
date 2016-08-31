+++

draft = true

date = "2016-08-25"
type = "blog"

seo_title = "TKTK"
description = "TKTK"

title = "Tutorial: How to Set Up a New WordPress Site Using Bedrock"
subtitle = "TKTK"

slug = "wordpress-bedrock-tutorial"
series = "wordpress-roots"

images = [
    "/images/code-lengstorf.jpg"
]

category = "cms"
tag = [
    "wordpress",
    "php",
]
_videoid = "hJ2RVXEIgkk"
_repo_url = "https://github.com/jlengstorf/learn-rollup-js"

+++

**Elevator Pitch:**

Set up a new WordPress site using the Roots stack.

## Prerequisites

- Homebrew

``` sh
# Install Homebrew.
ruby -e "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/master/install)"
```

- Git

``` sh
# Install Git with Homebrew
brew install git
```

- Ansible

``` sh
# Install Ansible with Homebrew
brew install ansible
```

- Composer

``` sh
# Install Composer with Homebrew
brew install composer
```

- [Virtualbox](https://www.virtualbox.org/wiki/Downloads)
- [Vagrant](https://www.vagrantup.com/downloads.html)
- PHP 5.6 or higher

``` sh
# Install PHP 7
curl -s http://php-osx.liip.ch/install.sh | bash -s 7.0

# -- OR --

# Install PHP 5.6
curl -s http://php-osx.liip.ch/install.sh | bash -s 5.6
```

{{% aside %}}
  **NOTE:** After you've upgraded, make sure the right version is being used in the command line with `php -v`. If it's not the right version, check [this discussion](http://stackoverflow.com/questions/3973271/terminal-displys-wrong-php-version-snow-leopard) and update your `PATH` to point to the correct version of the `php` executable.
{{% /aside %}}

## Part I: Install Trellis

### Create a new directory for the site.

``` sh
# Move into the directory where where you keep dev projects.
cd ~/dev/code.lengstorf.com/projects/

# Create a new directory for this project
mkdir learn-roots-wordpress

# Move into the new directory.
cd learn-roots-wordpress/
```

### Get a copy of Trellis to manage environments and deployment.

``` sh
# Clone Trellis, but without all the Git history.
git clone --depth=1 git@github.com:roots/trellis.git

# Delete the `.git` file so we can have our own Git repo.
rm -rf trellis/.git
```

### Install Ansible dependencies.

``` sh
# Move into the Trellis directory
cd trellis/

# Install the Ansible dependencies for Trellis.
ansible-galaxy install -r requirements.yml
```

## Part II: Install Bedrock

### Get a copy of Bedrock to make WordPress's file structure sane.

``` sh
# Move back into the project root.
cd ..

# Clone Bedrock to the `site` directory.
git clone --depth=1 git@github.com:roots/bedrock.git site

# Remove the `.git` file so we can have our own Git repo.
rm -rf site/.git
```

## Part III: Configure a Development Site

### Add site details to `wordpress_sites.yml`.

Open `trellis/group_vars/development/wordpress_sites.yml` in your editor:

``` yaml
# Documentation: https://roots.io/trellis/docs/local-development-setup/
# `wordpress_sites` options: https://roots.io/trellis/docs/wordpress-sites
# Define accompanying passwords/secrets in group_vars/development/vault.yml

wordpress_sites:
  example.com:
    site_hosts:
      - canonical: example.dev
        redirects:
          - www.example.dev
    local_path: ../site # path targeting local Bedrock site directory (relative to Ansible root)
    admin_email: admin@example.dev
    multisite:
      enabled: false
    ssl:
      enabled: false
      provider: self-signed
    cache:
      enabled: false
```

If you're not familiar with [YAML](http://yaml.org/), it's a common way of describing data. It's indentation-based, so the default file creates a `wordpress_sites` object, and that contains an `example.com` object, which holds config properties (e.g. `site_hosts`).

{{% aside %}}
  **NOTE:** Trellis is really powerful because it allows us to define multiple WordPress sites. If we wanted to host two sites on the same box, all we'd need to do is add another site to the `wordpress_sites` object.
{{% /aside %}}

Each site is identified by a key — in the example, the key is `example.com` — which allows us to link together our development, staging, and production environments without a bunch of duplicated configuration.

As a general rule, the production domain name is a good key to use.

With that in mind, let's set up our site by making the following changes to `wordpress_sites.yml`:

``` diff
  wordpress_sites:
+   roots.code.lengstorf.com:
      site_hosts:
+       - canonical: roots.dev
-         redirects:
-           - www.example.dev
      local_path: ../site # path targeting local Bedrock site directory (relative to Ansible root)
+     admin_email: jason@lengstorf.com
      multisite:
        enabled: false
      ssl:
        enabled: false
        provider: self-signed
      cache:
        enabled: false

```

I'll be deploying the site to a production domain of `roots.code.lengstorf.com`, so that's my site key. For local development, we'll use `roots.dev` as the URL, and we don't need the `redirects` here, so we can remove them.

Finally, we updated the `admin_email`.

Save the changes and we're ready to move on.

### Add credentials to `vault.yml`.

Next, we'll open `trellis/group_vars/development/vault.yml`:

``` yaml
# Documentation: https://roots.io/trellis/docs/vault/
vault_mysql_root_password: devpw

# Variables to accompany `group_vars/development/wordpress_sites.yml`
# Note: the site name (`example.com`) must match up with the site name in the above file.
vault_wordpress_sites:
  example.com:
    admin_password: admin
    env:
      db_password: example_dbpassword
```

Here we can see that the site key is `example.com`, so we'll need to update that.

We also need to update `admin_password`, which is the password we'll use to log into WordPress's dashboard.

And finally, we'll add strong passwords for the MySQL root user and the site's DB access.

Make the following changes in `vault.yml`:

``` diff
  # Documentation: https://roots.io/trellis/docs/vault/
+ vault_mysql_root_password: "xy&G6o2kKH$#AFz247N."
  
  # Variables to accompany `group_vars/development/wordpress_sites.yml`
  # Note: the site name (`example.com`) must match up with the site name in the   above file.
  vault_wordpress_sites:
+   roots.code.lengstorf.com:
+     admin_password: "DM93zj,o29KjT/bh$8G$"
      env:
+       db_password: "qP42q2*?hjt.P+x7Bzc6"
```

{{% aside %}}
  **NOTE:** The passwords are quoted because of all the garbage characters in them. Without the quotes, the installer may choke on them.
{{% /aside %}}

Save the changes — now we're ready to fire up a local development box.

## Part IV: Start a Local Instance of the WordPress Site Using Vagrant

Here's where the power of Trellis starts to become apparent.

If we already have the required software installed, the only steps we'd need to follow to get to this point are:

1. Clone Trellis.
2. Clone Bedrock.
3. Update `trellis/group_vars/development/wordpress_sites.yaml`
4. Update `trellis/group_vars/development/vault.yaml`

When you compare that to the "normal" WordPress setup — clone WordPress, create a database, configure your local `hosts` file to give you a development URL, and so on — Trellis is _far_ simpler. And we're not even to the really good stuff yet.

### Start the development site.

To start the development site, it's one simple command:

``` sh
vagrant up
```

The first time you run this, it'll take a few minutes. This is because Vagrant needs to download and configure all the pieces required to get the box up and running properly. After the first time, most of the pieces are cached, which makes things much quicker.

### Check the development site on your local machine.

Once Vagrant is done, we can open the dev site by visiting `http://roots.dev/` in our browser.

{{< amp-img src="/images/learn-roots-wordpress-01.jpg" >}}
    The local instance of our WordPress site.
{{< /amp-img >}}

### Log into the WordPress dashboard.

To log into the WordPress dashboard, head to `http://roots.dev/wp/wp-admin/` in your browser and use the `admin_password` we set in `vault.yml` earlier.

{{< amp-img src="/images/learn-roots-wordpress-02.jpg" >}}
    The WordPress dashboard after logging in.
{{< /amp-img >}}

{{% aside %}}
  **NOTE:** Bedrock keeps WordPress in a subdirectory, `wp/`, which helps us keep all of the WordPress core files separate from the rest of our app. This is helpful for managing the WordPress version with Composer.
{{% /aside %}}

## Further Reading

- [Develop WordPress Sites Like a Goddamn Champion](http://davekiss.com/develop-wordpress-sites-like-a-goddamn-champion/)
