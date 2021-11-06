import request from '@/utils/request'

export const findLeave = (params: any) =>
  request({
    url: '/leave/list',
    method: 'get',
    params
  })

export const findLeaveApprovingTrack = (id: number) =>
  request({
    url: `/leave/approving/track/${id}`,
    method: 'get'
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

export const confirmLeave = (id: number) =>
  request({
    url: `/leave/confirm/${id}`,
    method: 'patch'
  })

export const resubmitLeave = (id: number) =>
  request({
    url: `/leave/resubmit/${id}`,
    method: 'patch'
  })

export const cancelLeave = (id: number) =>
  request({
    url: `/leave/cancel/${id}`,
    method: 'patch'
  })

export const batchDeleteLeave = (ids: string) =>
  request({
    url: '/leave/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })
