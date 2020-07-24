import request from '@/utils/request'

export const uploadMerge = (data: any) =>
  request({
    url: '/upload/merge',
    method: 'post',
    data
  })

export const uploadUnzip = (data: any) =>
  request({
    url: '/upload/unzip',
    method: 'post',
    data
  })
