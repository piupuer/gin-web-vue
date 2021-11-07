import request from '@/utils/request'

export const findLeave = (params: any) =>
  request({
    url: '/leave/list',
    method: 'get',
    params
  })

export const createLeave = (data: any) =>
  request({
    url: '/leave/create',
    method: 'post',
    data
  })

export const updateLeave = (id: number, data: any) =>
  request({
    url: `/leave/update/${id}`,
    method: 'patch',
    data
  })

export const batchDeleteLeave = (ids: string) =>
  request({
    url: '/leave/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })
