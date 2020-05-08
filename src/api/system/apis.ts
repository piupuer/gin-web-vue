import request from '@/utils/request'

export const getApis = (params: any) =>
  request({
    url: '/api/list',
    method: 'get',
    params
  })

export const createApi = (data: any) =>
  request({
    url: '/api/create',
    method: 'post',
    data
  })

export const updateApi = (id: number, data: any) =>
  request({
    url: '/api/' + id,
    method: 'patch',
    data
  })

export const batchDeleteApi = (ids: string) =>
  request({
    url: '/api/batch',
    method: 'delete',
    params: {
      ids
    }
  })

export const getAllApiGroupByCategoryByRoleId = (id: number) =>
  request({
    url: '/api/all/category/' + id,
    method: 'get'
  })
