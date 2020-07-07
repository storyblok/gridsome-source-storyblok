# Gridsome Source Storyblok

The official [Storyblok](https://www.storyblok.com/) integration with [Gridsome](https://gridsome.org/).

To see it in action take a look at the [Storyblok Gridsome Boilerplate](https://github.com/storyblok/storyblok-gridsome-boilerplate).

![Version](https://flat.badgen.net/npm/v/gridsome-source-storyblok?icon=npm)
![Downloads](https://flat.badgen.net/npm/dm/gridsome-source-storyblok?icon=npm)
![Stars](https://flat.badgen.net/github/stars/storyblok/gridsome-source-storyblok?icon=github)
![Status](https://flat.badgen.net/github/status/storyblok/gridsome-source-storyblok?icon=github)

## Install

```sh
yarn add gridsome-source-storyblok # or npm install gridsome-source-storyblok
```

## Usage

1. In `gridsome.config.js`, declare the use of the plugin and define the options:

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
        types: {
          story: {
            typeName: 'StoryblokEntry'
          }
        }
      }
    }
  ]
}
```

2. In the `src/templates` folder create a `.vue` file with the same name you defined in the `typeName` option (default is `StoryblokEntry`). After that set a `<page-query>` tag to load the data from GraphQL. For example:

```html
<page-query>
query StoryblokEntry ($id: ID) {
  storyblokEntry (id: $id) {
    id
    slug
    content
  }
}
</page-query>
```

3. Edit the file `gridsome.server.js` to use a GraphQL query to generate the pages using Storyblok's full_slug attribute

```js
module.exports = function (api) {
  api.createPages(async ({ graphql, createPage }) => {
    const { data } = await graphql(`{
      allStoryblokEntry {
        edges {
          node {
            id
            full_slug
          }
        }
      }
    }`)

    data.allStoryblokEntry.edges.forEach(({ node }) => {
      createPage({
        path: `/${node.full_slug}`,
        component: './src/templates/StoryblokEntry.vue',
        context: {
          id: node.id
        }
      })
    })
  })
}
```

## The options object in details

When you declare the use of the Storyblok plugin you can pass following options:

```js
{
  use: 'gridsome-source-storyblok',
  options: {
    client: {
      // The Storyblok JS Client options here (https://github.com/storyblok/storyblok-js-client)
      accessToken: '<YOUR_ACCESS_TOKEN>' // required!
    },
    version: 'draft', // Optional. Can be draft or published (default draft)
    // Optional: Config story and tag types names and request calls
    types: {
      story: {
        name: 'StoryblokEntry', // The name of Story template and type (default StoryblokEntry)
        params: {} // Additional query parameters
      },
      tag: {
        name: 'StoryblokTag', // The name of Tag template and type (default StoryblokTag)
        params: {} // Additional query parameters
      }
    },
    downloadImages: true, // Optional. default false,
    imageDirectory: 'storyblok_images', // Optional. Folder to put the downloaded images
    // Optional: Get additional types like datasources, links or datasource_entries
    additionalTypes: [
      {
        type: 'datasources', // required
        name: 'StoryblokDatasource' // required
      },
      {
        type: 'datasource_entries',
        name: 'StoryblokDatasourceEntry',
        params: { ...additionalQueryParams } // optional
      },
      {
        type: 'links',
        name: 'StoryblokLink'
      }
    ]
  }
}
```

## Rendering of the Rich Text field

This plugin comes with a built in renderer to get html output from Storyblok's Rich Text field. Create and register a `Richtext.vue` component with the code below to use the renderer in your components like this: `<richtext :text="blok.richtext"></richtext>`.

~~~js
<template>
  <div>
    <div v-html="richtext"></div>
  </div>
</template>

<script>
export default {
  props: ['text'],
  computed: {
    richtext() {
      return this.text ? this.$storyapi.richTextResolver.render(this.text) : ''
    }
  }
}
</script>
~~~

## Downloading images

When `downloadImages` option is marked as true, this plugin will be searching in each story for a image and download it to `src/<imageDirectory>` folder. In your components, you can use the [g-image](https://gridsome.org/docs/images/) tag. An important thing is that image property in story will be a object with some fields, not a string. Bellow, we show you an example of this:

```html
<template>
  <div>
    <g-image :src="imageURL"></g-image>
  </div>
</template>

<script>
export default {
  props: ['blok'],
  computed: {
    imageURL () {
      // When options.downloadImages is false, the image property is a string
      if (typeof this.blok.image === 'string') {
        return this.blok.image
      }

      // When options.downloadImages is true, the image property is a object
      // Reference of this: https://github.com/gridsome/gridsome/issues/292
      const path = this.blok.image.path
      return require('!!assets-loader?width=800&quality=100&fit=inside!~/' + path)
    }
  }
}
</script>

<style scoped>
img {
  max-width: 100%;
}
</style>
```

## Working with Tags

By default, this plugin will get all tags and create a reference to stories entries (as described in `create-schema` function), so it's possible to list stories from tag, for example.

You can change the name of template file and types by setting the `options.types.tag.name` option in `gridsome.config.js` (`StoryblokTag` is default).

### Example

Create a `StoryblokTag.vue` file in `src/templates` folder with the following code:

```vue
<template>
  <Layout>
    <h1>{{ $page.storyblokTag.name }}</h1>
    <ul>
      <li v-for="edge in $page.storyblokTag.belongsTo.edges" :key="edge.node.id">
        <g-link :to="edge.node.full_slug">
          {{ edge.node.name }}
        </g-link>
      </li>
    </ul>
  </Layout>
</template>

<page-query>
query ($id: ID!) {
  storyblokTag(id: $id) {
    name
    belongsTo {
      edges {
        node {
          ... on StoryblokEntry {
            id
            full_slug
            name
          }
        }
      }
    }
  }
}
</page-query>
```

In your `gridsome.server.js` file, it will be necessary to create a pages for each tag as the following:

```js
module.exports = function (api) {
  api.createPages(async ({ graphql, createPage }) => {
    // previous code (create pages to stories)

    const { data: tagData } = await graphql(`{
      allStoryblokTag {
        edges {
          node {
            id
            name
          }
        }
      }
    }`)

    tagData.allStoryblokTag.edges.forEach(({ node }) => {
      createPage({
        path: `/tag/${node.name}`,
        component: './src/templates/StoryblokTag.vue',
        context: {
          id: node.id
        }
      })
    })
  })
})
```

That's all! In your browser you can view a list of stories by the `foo` tag in `http://localhost:8080/tag/foo`.

## Load data to different collections

To load data to multiple collections, you need to declare the configuration multiple times in `gridsome.config.js`. Like this:

```js
{
  siteName: 'Gridsome',
  plugins: [
    // default collection
    {
      use: 'gridsome-source-storyblok',
      options: {
        client: {
          accessToken: '<YOUR_ACCESS_TOKEN>'
        }
      }
    },

    // specific collection (blogging for example)
    {
      use: 'gridsome-source-storyblok',
      options: {
        client: {
          accessToken: '<YOUR_ACCESS_TOKEN>'
        },
        types: {
          story: {
            name: 'StoryblokBlogEntry',
            params: {
              starts_with: 'blog/'
            }
          },
          tag: {
            typeName: 'StoryblokBlogTag'
          }
        }
      }
    }
  ]
}
```

And, in your `gridsome.server.js`, you can generate your pages for each collection, attending to the name given to each collection.

## Contribution

Fork me on [Github](https://github.com/storyblok/gridsome-source-storyblok).

This project use [semantic-release](https://semantic-release.gitbook.io/semantic-release/) for generate new versions by using commit messages and we use the Angular Convention to naming the commits. Check [this question](https://semantic-release.gitbook.io/semantic-release/support/faq#how-can-i-change-the-type-of-commits-that-trigger-a-release) about it in semantic-release FAQ.
