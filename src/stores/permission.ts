import { constantRoutes } from '@/router';
import LoginService from '@/api/login';
import Layout from '@/layout/index.vue';
import { defineStore } from 'pinia';

import type { RouteRecordRaw } from 'vue-router';

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../views/**/*.vue');

const usePermissionStore = defineStore('permission', {
    state: (): {
        topbarRouters: RouteRecordRaw[];
        sidebarRouters: RouteRecordRaw[];
    } => ({
        topbarRouters: [],
        sidebarRouters: [],
    }),
    actions: {
        setTopbarRoutes(routes: RouteRecordRaw[]) {
            this.topbarRouters = routes;
        },
        setSidebarRouters(routes: RouteRecordRaw[]) {
            this.sidebarRouters = routes;
        },
        generateRoutes(routes?: RouteRecordRaw[]) {
            return new Promise<any[]>(resolve => {
                 // 向后端请求路由数据
                LoginService.getRouters().then((res:any) => {
                  res.data = [
                    {
                      path: '/index',
                      component: 'index.vue',
                      name: 'index',
                      hidden: false,
                      redirect: '/index3333',
                      meta: { title: '首页1', icon: 'qq'},
                      children:[
                        {
                          path: '/index3333',
                          hidden: false,
                          component: 'index.vue',
                          name: 'index3333',
                          meta: { title: '首页3', icon: 'qq'},
                        },
                        {
                          path: '/index444',
                          hidden: false,
                          component: 'index.vue',
                          name: 'index444',
                          meta: { title: '首页4', icon: 'qq'},
                        },
                      ]
                  },
                  {
                    path: '/index222',
                    hidden: false,
                    component: 'index.vue',
                    name: 'index222',
                    meta: { title: '首页2', icon: 'qq'},
                },
                  ]
                    const sdata = JSON.parse(JSON.stringify(res.data));
                    const defaultData = JSON.parse(JSON.stringify(res.data));
                    const sidebarRoutes = filterAsyncRouter(sdata);
                    const defaultRoutes = filterAsyncRouter(defaultData);
                    constantRoutes.forEach(item => {
                      if(item.name === 'home'){
                        item.redirect = sidebarRoutes[0].path
                        item.children = item.children?.concat(sidebarRoutes)
                      }
                    })
                    this.setSidebarRouters(constantRoutes);
                    this.setTopbarRoutes(defaultRoutes);
                    resolve(constantRoutes);
                });
              
           });
        },
    }
});

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap: any[], lastRouter = false, type = false) {
    return asyncRouterMap.filter(route => {
        if (type && route.children) {
            route.children = filterChildren(route.children);
        }
        if (route.component) {
            if (route.component === 'Layout') {
                route.component = Layout;
            } else {
                route.component = loadView(route.component.slice(0,-4));
            }
        }
        if (route.children != null && route.children && route.children.length) {
            route.children = filterAsyncRouter(route.children, route, type);
        } else {
            delete route['children'];
            delete route['redirect'];
        }
        return true;
    });
}

function filterChildren(childrenMap: any[], lastRouter: any = false) {
    let children: any[] = [];
    childrenMap.forEach((el, index) => {
        if (el.children && el.children.length) {
            if (el.component === 'ParentView' && !lastRouter) {
                el.children.forEach((c: any) => {
                    c.path = el.path + '/' + c.path;
                    if (c.children && c.children.length) {
                        children = children.concat(filterChildren(c.children, c));
                        return;
                    }
                    children.push(c);
                });
                return;
            }
        }
        if (lastRouter) {
            el.path = lastRouter.path + '/' + el.path;
        }
        children = children.concat(el);
    });
    return children;
}


export const loadView = (view: any) => {
    let res;
    for (const path in modules) {
        const dir = path.split('views/')[1].split('.vue')[0];
        if (dir === view) {
            res = () => modules[path]();
        }
    }
    return res;
};

export default usePermissionStore;
