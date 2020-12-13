import axios from 'axios'
import { Message, MessageBox } from 'element-ui'
import { UserModule } from '@/store/modules/user'

const service = axios.create({
  baseURL: process.env.VUE_APP_BASE_API, // url = base url + request url
  timeout: 5000
  // withCredentials: true // send cookies when cross-domain requests
})

// Request interceptors
service.interceptors.request.use(
  (config) => {
    // Add Authorization header to every request, you can add other custom headers here
    if (UserModule.token) {
      config.headers.Authorization = 'Bearer ' + UserModule.token
    }
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)
// 正在刷新的标记
let refreshing = false
// 重试队列，每一项将是一个待执行的函数形式
let requests: any = []

// Response interceptors
service.interceptors.response.use(
  (response) => {
    // Some example codes here:
    // code == 201: 请求成功
    // code == 401: 登录失效
    const res = response.data
    if (res.code !== 201) {
      let msg = '网络异常, 请稍后再试'
      if (res.code === 401) {
        const config = response.config
        // 记录本次请求内容
        if (refreshing) {
          if (config.url == '/base/refreshToken') {
            msg = '登录超时'
            return Promise.reject(new Error(msg))
          }
          // 将当前请求记录到队列
          // 正在刷新token，将返回一个未执行resolve的promise
          return new Promise((resolve) => {
            // 将resolve放进队列，用一个函数形式来保存，等token刷新后直接执行
            requests.push(() => {
              resolve(service(config))
            })
          })
        } else {
          refreshing = true
          return UserModule.RefreshToken().then(() => {
            // 已经刷新了token，将所有队列中的请求进行重试
            requests.forEach((cb: any) => cb())
            requests = []
            return service(config)
          }).catch(() => {
            // 刷新token失败, 必须重新登录
            MessageBox.confirm(
              '登录超时, 重新登录或继续停留在当前页？',
              '登录状态已失效',
              {
                confirmButtonText: '重新登录',
                cancelButtonText: '继续停留',
                type: 'warning'
              }
            ).then(() => {
              UserModule.ResetToken()
              location.reload() // To prevent bugs from vue-router
            })
          }).finally(() => {
            refreshing = false
          })
        }
      } else {
        if (res.msg) {
          msg = res.msg
        }
        Message({
          message: msg,
          type: 'error',
          duration: 5 * 1000
        })
      }
      return Promise.reject(new Error(msg))
    } else {
      return response.data
    }
  },
  (error) => {
    Message({
      message: error.message,
      type: 'error',
      duration: 5 * 1000
    })
    return Promise.reject(error)
  }
)

export default service
