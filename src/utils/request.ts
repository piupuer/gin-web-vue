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
        msg = '登录超时'
        MessageBox.confirm(
          '登录超时, 重新登录或继续停留？',
          '确定登出',
          {
            confirmButtonText: '重新登录',
            cancelButtonText: '继续停留',
            type: 'warning'
          }
        ).then(() => {
          UserModule.ResetToken()
          location.reload() // To prevent bugs from vue-router
        })
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
