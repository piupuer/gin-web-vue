import request from '@/utils/request'

export const findDict = (params: any) =>
  request({
    url: '/dict/list',
    method: 'get',
    params
  })

export const createDict = (data: any) =>
  request({
    url: '/dict/create',
    method: 'post',
    data
  })

export const updateDict = (id: number, data: any) =>
  request({
    url: `/dict/update/${id}`,
    method: 'patch',
    data
  })

export const batchDeleteDict = (ids: string) =>
  request({
    url: '/dict/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })

export const findDictData = (params: any) =>
  request({
    url: '/dict/data/list',
    method: 'get',
    params
  })

export const createDictData = (data: any) =>
  request({
    url: '/dict/data/create',
    method: 'post',
    data
  })

export const updateDictData = (id: number, data: any) =>
  request({
    url: `/dict/data/update/${id}`,
    method: 'patch',
    data
  })

export const batchDeleteDictData = (ids: string) =>
  request({
    url: '/dict/data/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })
