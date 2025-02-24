import postCssPxToRem from 'postcss-pxtorem';

export default defineNuxtConfig({
  modules: ['@vueuse/nuxt'],

  devtools: {
    enabled: false,
    telemetry: false,
  },

  css: ['~/assets/styles/main.less'],

  vite: {
    plugins: [
      // @ts-ignore
      postCssPxToRem(),
    ],
    css: {
      postcss: {
        plugins: [
          postCssPxToRem({
            propList: [
              '*',
              '!border-left',
              '!border-right',
              '!border-top',
              '!border-bottom',
              '!border',
              '!outline',
            ],
          }),
        ],
      },
    },
    build: {
      assetsInlineLimit: 0,
    },
  },

  nitro: {
    prerender: {
      autoSubfolderIndex: false,
    },
  },

  compatibilityDate: '2025-02-24',
});