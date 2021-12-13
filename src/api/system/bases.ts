import request from '@/utils/request'

export const userStatus = (params: any) =>
  request({
    url: '/base/user/status',
    method: 'get',
    params
  })

export const captcha = () =>
  request({
    url: '/base/captcha',
    method: 'get'
  })

export const login = (data: any) =>
  request({
    url: '/base/login',
    method: 'post',
    data
  })

export const logout = () =>
  request({
    url: '/base/logout',
    method: 'post'
  })

export const refreshToken = () =>
  request({
    url: '/base/refreshToken',
    method: 'post'
  })

export const idempotenceToken = () =>
  request({
    url: '/base/idempotenceToken',
    method: 'get'
  })
