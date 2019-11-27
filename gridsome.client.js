import StoryblokVue from 'storyblok-vue'
import StoryblokClient from 'storyblok-js-client'

export default function (Vue, options, context) {
  const Client = {
    install () {
      if (!Vue.prototype.$storyapi) {
        Vue.prototype.$storyapi = new StoryblokClient(options.client)
      }
    }
  }

  Vue.use(StoryblokVue)
  Vue.use(Client)
}
