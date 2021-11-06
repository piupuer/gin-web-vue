import request from '@/utils/request'

export const findRole = (params: any) =>
  request({
    url: '/role/list',
    method: 'get',
    params
  })

export const findRoleByIds = (ids: string) =>
  request({
    url: `/role/list/${ids}`,
    method: 'get'
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

export const batchDeleteRole = (ids: string) =>
  request({
    url: '/role/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })
