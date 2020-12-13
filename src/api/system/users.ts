import request from '@/utils/request'

export const getUserInfo = (data: any) =>
  request({
    url: '/user/info',
    method: 'post',
    data
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

export const getUsers = (params: any) =>
  request({
    url: '/user/list',
    method: 'get',
    params
  })

export const createUser = (data: any) =>
  request({
    url: '/user/create',
    method: 'post',
    data
  })

export const updateUser = (id: number, data: any) =>
  request({
    url: `/user/update/${id}`,
    method: 'patch',
    data
  })

export const changePwd = (data: any) =>
  request({
    url: '/user/changePwd',
    method: 'put',
    data
  })

export const batchDeleteUser = (ids: string) =>
  request({
    url: '/user/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })
