import request from '@/utils/request'

export const getAllMessages = (params: any) =>
  request({
    url: '/message/all',
    method: 'get',
    params
  })

export const getUnReadMessageCount = () =>
  request({
    url: '/message/unRead/count',
    method: 'get'
  })

export const batchUpdateMessageRead = (ids: string) =>
  request({
    url: '/message/read/batch',
    method: 'patch',
    params: {
      ids
    }
  })

export const batchUpdateMessageDeleted = (ids: string) =>
  request({
    url: '/message/deleted/batch',
    method: 'patch',
    params: {
      ids
    }
  })

export const updateAllMessageRead = (ids: string) =>
  request({
    url: '/message/read/all',
    method: 'patch',
    params: {
      ids
    }
  })

export const updateAllMessageDeleted = (ids: string) =>
  request({
    url: '/message/deleted/all',
    method: 'patch',
    params: {
      ids
    }
  })

export const messagePush = (data: any) =>
  request({
    url: '/message/push',
    method: 'post',
    data
  })
