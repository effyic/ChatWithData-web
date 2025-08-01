import {
  type RouteRecordRaw,
  createRouter,
  createWebHistory,
} from 'vue-router'

import Layout from "@/layout/index.vue";

/**
 * Note: 路由配置项
 *
 * hidden: true                     // 当设置 true 的时候该路由不会再侧边栏出现 如401，login等页面，或者如一些编辑页面/edit/1
 * redirect: noRedirect             // 当设置 noRedirect 的时候该路由在面包屑导航中不可被点击
 * name:'router-name'               // 设定路由的名字，一定要填写不然使用<keep-alive>时会出现各种问题
 * query: '{"id": 1, "name": "ry"}' // 访问路由的默认传递参数
 * roles: ['admin', 'common']       // 访问路由的角色权限
 * meta : {
    noCache: true                   // 如果设置为true，则不会被 <keep-alive> 缓存(默认 false)
    title: 'title'                  // 设置该路由在侧边栏和面包屑中展示的名字
    icon: 'svg-name'                // 设置该路由的图标，对应路径src/assets/icons/svg
    breadcrumb: false               // 如果设置为false，则不会在breadcrumb面包屑中显示
    activeMenu: '/system/user'      // 当路由设置了该属性，则会高亮相对应的侧边栏。
  }
 */
declare module 'vue-router' {
  interface RouteMeta {
    hidden?: boolean
    title?: string
    icon?: string
    elSvgIcon?: string
    permissions?: string[]
  }
  interface _RouteRecordBase {
    hidden?: boolean
    parentPath?: string
    permissions?: string[]
  }
  interface _RouteLocationBase {
    title?: string
  }
}

// 公共路由
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/home',
    hidden: true,
  },
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/views/404.vue'),
    hidden: true,
  },

  {
    path: '/home',
    name: 'home',
    component: Layout,
    hidden: false,
    redirect: { name: 'Question' },
    children: [
      {
        path: 'Question',
        name: 'Question',
        hidden: true,
        component: () => import('@/views/Question/index.vue'),
        meta: { title: '', icon: 'Question' },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: constantRoutes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition)
      return savedPosition
    else return { top: 0 }
  },
})

// 导航守卫
// router.beforeEach((to, from) => {
 
// })

export default router
