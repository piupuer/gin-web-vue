import request from '@/utils/request'

export const findApi = (params: any) =>
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
    url: `/api/update/${id}`,
    method: 'patch',
    data
  })

export const batchDeleteApi = (ids: string) =>
  request({
    url: '/api/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })

export const findApiGroupByCategoryByRoleId = (id: number) =>
  request({
    url: `/api/all/category/${id}`,
    method: 'get'
  })

export const updateApiByRoleId = (id: number, data: any) =>
  request({
    url: `/api/role/update/${id}`,
    method: 'patch',
    data
  })
