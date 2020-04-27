import { VuexModule, Module, Mutation, Action, getModule } from 'vuex-module-decorators'
import { RouteConfig } from 'vue-router'
import { constantRoutes } from '@/router'
import store from '@/store'
import { getMenuTree } from '@/api/roles'

// 动态加载组件
export const loadComponent = (component: string) => {
  if (component == '' || component === 'Layout') {
    return () => import(`@/layout/index.vue`)
  }
  return () => import(`@/views${component}`)
}

// 将后端返回的菜单转为前端路由
export const getRoutesFromMenus = (menus: any) => {
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
      component: loadComponent(''),
      children: menu.children,
      meta: {
        title: menu.name,
        icon: menu.icon,
        hidden: !menu.visible,
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
    this.routes = routes
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
