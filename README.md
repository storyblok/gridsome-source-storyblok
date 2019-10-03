# Gridsome Source Storyblok

The official Storyblok integration with Gridsome

## Install

```sh
yarn add gridsome-source-storyblok # or npm install gridsome-source-storyblok
```

## Usage

1. In `gridsome.config.js`, declare the use of this plugin and pass the options to it:

```js
// in gridsome.config.js
{
  siteName: 'Gridsome',
  plugins: [
    {
      use: 'gridsome-source-storyblok',
      options: {
        client: {
          accessToken: '<YOUR_ACCESS_TOKEN>'
        },
        version: 'draft',
        typeName: 'StoryblokEntry'
      }
    }
  ],
  templates: {
    StoryblokEntry: '/:slug'
  }
}
```

2. In `src/templates` folder, create a `.vue` file with the same name in `typeName` option (default is `StoryblokEntry`). In this file, set a `<page-query>` tag to load page data from GraphQL to page. For example:

```html
<page-query>
query StoryblokEntry ($id: ID) {
  storyblokEntry (id: $id) {
    id
    slug
    content {
      component
      body {
        headline
        component
        columns {
          component
          name
        }
      }
    }
  }
}
</page-query>
```

## The options object in details

When you declare of use a plugin in Gridsome config, you can pass a some optios to this plugin. For the Storyblok plugin, the options structure is:

```js
{
  use: 'gridsome-source-storyblok',
  options: {
    client: {
      // the Storyblok JS Client options here (https://github.com/storyblok/storyblok-js-client)
      accessToken: '<YOUR_ACCESS_TOKEN>' // required!
    },
    version: 'draft' // can be draft or published (default draft)
    typeName: 'StoryblokEntry' // the template name (default StoryblokEntry)
  }
}
```

## Contribution

Fork me on [Github](https://github.com/storyblok/gridsome-source-storyblok)