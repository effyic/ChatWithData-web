import 'virtual:svg-icons-register'
import 'element-plus/dist/index.css'
import '@/assets/styles/index.scss'; 

import type { Component } from 'vue'
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import locale from 'element-plus/dist/locale/zh-cn.mjs'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import router from './router'
import 'virtual:svg-icons-register';
import './permission'

import App from '@/App.vue'

const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue))
  app.component(key, <Component>component)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(router)
app.use(pinia)
app.use(ElementPlus, { locale })


app.mount('#app')
