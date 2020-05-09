import request from '@/utils/request'

export const getRoles = (params: any) =>
  request({
    url: '/role/list',
    method: 'get',
    params
  })

export const createRole = (data: any) =>
  request({
    url: '/role/create',
    method: 'post',
    data
  })

export const updateRole = (id: number, data: any) =>
  request({
    url: `/role/update/${id}`,
    method: 'patch',
    data
  })

export const updateRoleMenus = (id: number, data: any) =>
  request({
    url: `/role/menus/update/${id}`,
    method: 'patch',
    data
  })

export const updateRoleApis = (id: number, data: any) =>
  request({
    url: `/role/apis/update/${id}`,
    method: 'patch',
    data
  })

export const batchDeleteRole = (ids: string) =>
  request({
    url: `/role/delete/batch`,
    method: 'delete',
    params: {
      ids
    }
  })

export const getRoutes = (params: any) =>
  request({
    url: '/routes',
    method: 'get',
    params
  })
