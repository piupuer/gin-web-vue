import router from './router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { Message } from 'element-ui'
import { Route } from 'vue-router'
import { UserModule } from '@/store/modules/user'
import { PermissionModule } from '@/store/modules/permission'
import i18n from '@/lang' // Internationalization
import settings from './settings'

NProgress.configure({ showSpinner: false })

const whiteList = ['/login', '/auth-redirect']

const getPageTitle = (key: string) => {
  const hasKey = i18n.te(`route.${key}`)
  if (hasKey) {
    const pageName = i18n.t(`route.${key}`)
    return `${pageName} - ${settings.title}`
  }
  if (key) {
    return `${key} - ${settings.title}`
  }
  return `${settings.title}`
}

router.beforeEach(async(to: Route, _: Route, next: any) => {
  // Start progress bar
  NProgress.start()

  // Determine whether the user has logged in
  if (UserModule.token) {
    if (to.path === '/login') {
      // If is logged in, redirect to the home page
      next({ path: '/' })
      NProgress.done()
    } else {
      // Check whether the user has obtained his permission roles
      if (UserModule.roles.length === 0) {
        try {
          // Note: roles must be a object array! such as: ['admin'] or ['developer', 'editor']
          await UserModule.GetUserInfo()
          const roles = UserModule.roles
          // Generate accessible routes map based on role
          await PermissionModule.GenerateRoutes(roles)
          // 动态加载404页面, 如果加到constantRoutes会导致菜单刷新未加载完菜单, 先跳转到404
          PermissionModule.dynamicRoutes.push({
            path: '*',
            redirect: '/404',
            meta: { hidden: true }
          })
          // Dynamically add accessible routes
          router.addRoutes(PermissionModule.dynamicRoutes)
          // fix bug: Redirected when going from "xx" to "xx" via a navigation guard.
          // https://github.com/Armour/vue-typescript-admin-template/issues/150#issuecomment-736574743
          router.replace(to.fullPath)
          // next({ ...to, replace: true })
        } catch (err) {
        }
      } else {
        next()
      }
    }
  } else {
    // Has no token
    if (whiteList.indexOf(to.path) !== -1) {
      // In the free login whitelist, go directly
      next()
    } else {
      // Other pages that do not have permission to access are redirected to the login page.
      next(`/login?redirect=${to.path}`)
      NProgress.done()
    }
  }
})

router.afterEach((to: Route) => {
  // Finish progress bar
  NProgress.done()

  // set page title
  document.title = getPageTitle(to.meta.title)
})
