import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { RouteConfig } from 'vue-router'
import Layout from '@/layout/index.vue'
import store from '@/store'
import { getMenuTree } from '@/api/roles'
import { constantRoutes } from '@/router'

// 动态加载组件
export const loadComponent = (component: string) => {
  if (component == '' || component === 'Layout') {
    // 组件不存在使用默认布局
    return Layout
  }
  // 动态获取组件
  return () => import(`@/views${component}`)
}

// 将后端返回的菜单转为前端路由
export const getRoutesFromMenus = (menus: any):RouteConfig[] => {
  const res: RouteConfig[] = []
  menus.forEach((menu: any) => {
    if (menu.children.length > 0) {
      menu.children = getRoutesFromMenus(menu.children)
    } else {
      // 这里需要清理children, 否则右侧会显示下拉图标
      delete menu.children
    }
    res.push({
      path: menu.path,
      name: menu.name,
      component: loadComponent(menu.component),
      redirect: menu.redirect,
      children: menu.children,
      meta: {
        // 由于国际化, 这里用name, 如果无需兼容多语言, 则直接用title
        title: menu.name,
        icon: menu.icon,
        hidden: !menu.visible,
        breadcrumb: menu.breadcrumb,
      },
    })
  })
  return res
}

export interface IPermissionState {
  routes: RouteConfig[]
  dynamicRoutes: RouteConfig[]
}

@Module({ dynamic: true, store, name: 'permission' })
class Permission extends VuexModule implements IPermissionState {
  public routes: RouteConfig[] = []
  public dynamicRoutes: RouteConfig[] = []

  @Mutation
  private SET_ROUTES(routes: RouteConfig[]) {
    this.routes = constantRoutes.concat(routes)
    this.dynamicRoutes = routes
  }

  @Action
  public async GenerateRoutes(roles: string[]) {
    // 请求菜单树
    const { data } = await getMenuTree({})
    this.SET_ROUTES(getRoutesFromMenus(data))
  }
}

export const PermissionModule = getModule(Permission)
