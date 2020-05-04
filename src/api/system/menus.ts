import request from '@/utils/request'

export const getMenuTree = (params: any) =>
  request({
    url: '/menu/tree',
    method: 'get',
    params
  })

export const getMenus = (params: any) =>
  request({
    url: '/menu/list',
    method: 'get',
    params
  })

export const createMenu = (data: any) =>
  request({
    url: '/menu/create',
    method: 'post',
    data
  })

export const updateMenu = (id: number, data: any) =>
  request({
    url: `/menu/${id}`,
    method: 'patch',
    data
  })

export const batchDeleteMenu = (ids: string) =>
  request({
    url: `/menu/batch`,
    method: 'delete',
    params: {
      ids
    }
  })