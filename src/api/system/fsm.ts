import request from '@/utils/request'

export const findFsm = (params: any) =>
  request({
    url: '/fsm/list',
    method: 'get',
    params
  })

export const findFsmApproving = (params: any) =>
  request({
    url: '/fsm/approving/list',
    method: 'get',
    params
  })

export const getFsmLogDetail = (params: any) =>
  request({
    url: '/fsm/submitter/detail',
    method: 'get',
    params
  })

export const updateFsmLogDetail = (data: any) =>
  request({
    url: '/fsm/submitter/detail',
    method: 'patch',
    data
  })

export const approveFsm = (data: any) =>
  request({
    url: '/fsm/approve',
    method: 'patch',
    data
  })

export const createFsm = (data: any) =>
  request({
    url: '/fsm/create',
    method: 'post',
    data
  })

export const updateFsm = (id: number, data: any) =>
  request({
    url: `/fsm/update/${id}`,
    method: 'patch',
    data
  })

export const batchDeleteFsm = (ids: string) =>
  request({
    url: '/fsm/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })
