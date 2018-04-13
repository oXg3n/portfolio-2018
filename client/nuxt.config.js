const PurgecssPlugin = require('purgecss-webpack-plugin')
const glob = require('glob-all')
const path = require('path')
const whitelister = require('purgecss-whitelister')
const TailwindExtractor = require('./utils/TailwindExtractor')

module.exports = {
  /*
    ** Mode for rendering the app (i.e universal = ssr, spa = no ssr)
  */
  mode: 'universal',
  /*
    ** Headers of the page
  */
  head: {
    title: 'client',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: "Portfolio d'Alain Perrier" }
    ],
    link: [{ rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }]
  },
  /*
    ** CSS
  */
  //css: [
  //'~/assets/sass/app.scss'
  //],
  /*
    ** Customize the progress bar color
  */
  loading: { color: '#00b8d1' },
  /*
    ** Vue plugins
  */
  plugins: [
    { src: '~/plugins/vue-ripple', ssr: false },
    { src: '~/plugins/vue-scrollto', ssr: false },
    { src: '~/plugins/vue-click-outside', ssr: false },
    { src: '~/plugins/vue-touch', ssr: false }, //not used
    { src: '~/plugins/vue-expand', ssr: false }, //not used
    { src: '~/plugins/v-validate' }
  ],
  /*
    ** Customise manifest file
  */
  meta: {
    theme_color: '#404951'
  },
  /*
    ** Add others modules
  */
  modules: ['@nuxtjs/pwa', 'nuxt-device-detect'],
  /*
    ** Build configuration
  */
  build: {
    /*
      ** Extract text plugins (merge css from every vue pages / components with allChunks:true)
    */
    extractCSS: {
      allChunks: true
    },
    /*
      ** Hot reload on dev env
    */
    devMiddleware: {
      watchOptions: {
        aggregateTimeout: 300,
        poll: 1000
      }
    },
    /*
      ** Add vendor (to better cache resources)
    */
    vendor: ['vue-ripple-directive'],
    /*
      ** PostCss Plugins
    */
    postcss: [require('tailwindcss')('./tailwind.js'), require('autoprefixer')],
    /*
      ** Extend webpack config
    */
    extend(config, { isDev, isClient }) {
      // //HARD FIX SCROLL ACTIVE LIB
      // config.resolve.alias['vue'] = 'vue/dist/vue.common'
      // //END HARDFIX

      /*
        ** Run PurgeCssPlugin (works only with build and start)
      */
      config.plugins.push(
        new PurgecssPlugin({
          whitelist: whitelister(['node_modules/css-reset-and-normalize/css/flavored-reset-and-normalize.css']),
          whitelistPatterns: [
            /-enter$/,
            /-enter-active$/,
            /-enter-to$/,
            /-leave$/,
            /-leave-active$/,
            /-leave-to$/,
            /ripple/
          ],
          paths: glob.sync([
            path.join(__dirname, 'components/**/*.vue'),
            path.join(__dirname, 'layouts/**/*.vue'),
            path.join(__dirname, 'pages/**/*.vue'),
            path.join(__dirname, 'node_modules/nuxt/**/*.vue')
          ]),
          extractors: [
            {
              extractor: TailwindExtractor,
              extensions: ['html', 'js', 'php', 'vue']
            }
          ]
        })
      )
      /*
        ** Add extra config to parse unparsed HTML elements
      */
      // const vueLoader = config.module.rules.find(r => r.loader === 'vue-loader');
      // vueLoader.options.transformToRequire = {
      // source: 'srcset',
      // img: ['srcset', 'data-src', 'data-jpg', 'data-webp']
      //}
      /*
        ** Add extra config to handle webp format
      */
      config.module.rules.push({
        enforce: 'pre',
        test: /\.(webp)$/,
        loader: 'file-loader',
        query: {
          limit: 1000, // 1KO
          name: 'img/[name].[hash:7].[ext]'
        }
      })
      /*
      ** Run ESLint on save
      */
      if (isDev && isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
