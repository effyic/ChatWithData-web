import router from './router';
import { ElMessage } from 'element-plus';
import cache from '@/utils/cache';
import { isHttp } from '@/utils/validate';
import { isRelogin } from '@/utils/request';
import {useUserStore} from '@/stores/user';
import useAppStore from '@/stores/app'
import usePermissionStore from '@/stores/permission';


// 接口联调之后去掉'/home/Knowledgebase'
const whiteList = ['/home','/home/Question','/HelpCenter' ];
const isLoggedIn = () => {
  return !!cache.local.get('token')
}
router.beforeEach(async (to, from, next) => {
    const hasToken = isLoggedIn()
    // if (hasToken) {
    //     if (to.path === '/home') {
    //         next();
    //     } else {
    //       if(!useAppStore().routerOpen){ //是否取静态路由
    //         next()
    //       }else{
    //         if (usePermissionStore().sidebarRouters.length === 0) {
    //             isRelogin.show = true;
    //             // 判断当前用户是否已拉取完userinfo信息
    //             useUserStore().getInfo()
    //                 .then(() => {
    //                     isRelogin.show = false;
                    
    //                       usePermissionStore()
    //                         .generateRoutes()
    //                         .then(accessRoutes => {
    //                             // 根据roles权限生成可访问的路由表
    //                             accessRoutes.forEach(route => {
    //                                 if (!isHttp(route.path)) {
    //                                     router.addRoute(route); // 动态添加可访问路由表
    //                                 }
    //                             });
    //                             next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
    //                         });
                        
    //                 })
    //                 .catch(err => {
    //                   localStorage.clear()
    //                   ElMessage.error(err);
    //                   next({ path: '/' });
    //                 });
    //         } else {
    //             next();
    //         }
    //       }
    //     }
    // } else {
    //     // 没有token
    //     if (whiteList.includes(to.path)) {
    //         // 在免登录白名单，直接进入
    //         next();
    //     } else {
    //       useUserStore().loginDialog = from.name == 'Question'
    //         return next({ path: '/' })
    //     }
    // }
    next()
});

