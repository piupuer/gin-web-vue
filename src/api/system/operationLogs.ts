import request from '@/utils/request'

export const getOperationLogs = (params: any) =>
  request({
    url: '/operation/log/list',
    method: 'get',
    params
  })

export const batchDeleteOperationLog = (ids: string) =>
  request({
    url: '/operation/log/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })
