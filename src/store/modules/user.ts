import { Action, getModule, Module, Mutation, VuexModule } from 'vuex-module-decorators'
// @ts-ignore
import { JSEncrypt } from 'jsencrypt'
import { getUserInfo } from '@/api/system/users'
import { login, logout, refreshToken } from '@/api/system/bases'
import { getToken, removeToken, setToken } from '@/utils/cookies'
import router, { resetRouter } from '@/router'
import { PermissionModule } from './permission'
import { TagsViewModule } from './tags-view'
import store from '@/store'

export interface IUserState {
  token: string
  username: string
  nickname: string
  mobile: string
  avatar: string
  introduction: string
  roleSort: number
  roles: string[]
  email: string
}

@Module({ dynamic: true, store, name: 'user' })
class User extends VuexModule implements IUserState {
  public token = getToken() || ''
  public id = 0
  public username = ''
  public nickname = ''
  public mobile = ''
  public avatar = ''
  public introduction = ''
  public roleSort = 0
  public roles: string[] = []
  public email = ''
  private publicKey = '-----BEGIN GIN WEB PUBLIC KEY-----\n' +
    'MIICIjANBgkqhkiG9w0BAQEFAAOCAg8AMIICCgKCAgEAtCtCtXUpF16JnLVjCZJF\n' +
    '/30x8hfdkwn+mLYu/M64vY6SG4nJJm784tmfQetgeEl5JQXrOxVa6xWwdlU7UooJ\n' +
    'TmwJbRCahUTY9XBqMLzFBnHwGrM4yTJ09X0qRWF4ca4Zk2CfSaSUp6YI2QmNDavy\n' +
    'NnP2IsgmVBl4prMkRq8csOM+HcPPjhPTJsqmRYM6o6ZCOEsCI07w5TgjWyffB+xY\n' +
    'M0h9/tVBHJyicOEbEIJN8IMx1lWi+RNlh1WJVdZmgutF8iEiYkwfqOb2GKj2ptMn\n' +
    'BwmuTWtTzbm+Tz4/Xc3XO1nN+N0lG9W3c0iCHNdcq069CWhQlDt/vtFMPmKiT6/S\n' +
    'py8+tYke0b363jHSQG90hLK1ZT+mmcp1CdrsOIX4C1l2AMpRQmtPES11uU6a6W3d\n' +
    'JxMCj8+K8E3Swt2yaJf0DH9Ej6Kz942sMXuaXOQPot1fT1Y76STmkUa/QPnxTtsU\n' +
    'sMQAxZnIXodbaeLi40pRmHgtWrAAvEF1BqT3VJRNnarNGITtCvvSNUG8qt7+yCy7\n' +
    'zCk/h1/g4+dIvRlQsYYrnOkGvNr3SqnA8AlJtDai2tdxQo2mUxoxB6btQL8y/3Pg\n' +
    'qhkX/2CdjTtLPLSmgZQmBfQLoOELbWdmX58IdLhjI/eIUUlrBP4vQqAaLwJMCC5a\n' +
    'IeddThz+w43h2ZZdgtLR/B8CAwEAAQ==\n' +
    '-----END GIN WEB PUBLIC KEY-----\n'

  @Mutation
  private SET_TOKEN(token: string) {
    this.token = token
  }

  @Mutation
  private SET_ID(id: number) {
    this.id = id
  }

  @Mutation
  private SET_USERNAME(username: string) {
    this.username = username
  }

  @Mutation
  private SET_NICKNAME(nickname: string) {
    this.nickname = nickname
  }

  @Mutation
  private SET_MOBILE(mobile: string) {
    this.mobile = mobile
  }

  @Mutation
  private SET_AVATAR(avatar: string) {
    this.avatar = avatar
  }

  @Mutation
  private SET_INTRODUCTION(introduction: string) {
    this.introduction = introduction
  }

  @Mutation
  private SET_ROLE_SORT(roleSort: number) {
    this.roleSort = roleSort
  }

  @Mutation
  private SET_ROLES(roles: string[]) {
    this.roles = roles
  }

  @Mutation
  private SET_EMAIL(email: string) {
    this.email = email
  }

  @Action
  public async Login(userInfo: { username: string, password: string, captchaId: string, captchaAnswer: string }) {
    let { username, password, captchaId, captchaAnswer } = userInfo
    username = username.trim()
    // 密码RSA加密处理
    const encryptor = new JSEncrypt({})
    // 设置公钥
    encryptor.setPublicKey(this.publicKey)
    // 加密密码
    const res = encryptor.encrypt(password)
    if (typeof res === 'string') {
      password = res
    }
    const { data } = await login({
      username,
      password,
      captchaId,
      captchaAnswer
    })
    setToken(data.token)
    this.SET_TOKEN(data.token)
  }

  @Action
  public async RefreshToken() {
    // 刷新token
    const { data } = await refreshToken()
    setToken(data.token)
    this.SET_TOKEN(data.token)
  }

  @Action
  public ResetToken() {
    removeToken()
    this.SET_TOKEN('')
    this.SET_ROLES([])
  }

  @Action
  public async GetUserInfo() {
    if (this.token === '') {
      throw Error('GetUserInfo: token is undefined!')
    }
    const { data } = await getUserInfo({ /* Your params here */ })
    if (!data) {
      throw Error('Verification failed, please Login again.')
    }
    const { id, roles, username, nickname, mobile, avatar, introduction, roleSort, email } = data
    // roles must be a non-empty array
    if (!roles || roles.length <= 0) {
      throw Error('GetUserInfo: roles must be a non-null array!')
    }
    this.SET_ID(id)
    this.SET_ROLES(roles)
    this.SET_USERNAME(username)
    this.SET_NICKNAME(nickname)
    this.SET_MOBILE(mobile)
    this.SET_AVATAR(avatar)
    this.SET_INTRODUCTION(introduction)
    this.SET_ROLE_SORT(roleSort)
    this.SET_EMAIL(email)
  }

  @Action
  public async ChangeRoles(role: string) {
    // Dynamically modify permissions
    const token = role + '-token'
    this.SET_TOKEN(token)
    setToken(token)
    await this.GetUserInfo()
    resetRouter()
    // 这里一定要等待后端加载菜单完毕, 否则可能动态路由为空, 无法显示页面
    // Generate dynamic accessible routes based on roles
    await PermissionModule.GenerateRoutes(this.roles)
    // Add generated routes
    router.addRoutes(PermissionModule.dynamicRoutes)
    // Reset visited views and cached views
    TagsViewModule.delAllViews()
  }

  @Action
  public async LogOut() {
    if (this.token === '') {
      throw Error('LogOut: token is undefined!')
    }
    await logout()
    removeToken()
    resetRouter()

    // Reset visited views and cached views
    TagsViewModule.delAllViews()
    this.SET_TOKEN('')
    this.SET_ROLES([])
  }
}

export const UserModule = getModule(User)
