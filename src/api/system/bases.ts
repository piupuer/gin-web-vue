import request from '@/utils/request'

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

