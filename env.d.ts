/// <reference types="vite/client" />
declare module 'element-plus/dist/locale/zh-cn.mjs'
declare module '@element-plus/icons-vue'
declare module 'bettersearch/dist/index'
declare module 'event-source-polyfill'
declare module 'markdown-it'
declare module 'file-saver'
declare module 'nprogress'
declare module 'markdown-it'
declare module '*.vue' {
    import type {DefineComponent} from "vue";
    const component: DefineComponent<any, any, {}>
    export default component
}
