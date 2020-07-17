import request from '@/utils/request'

export const uploadMerge = (data: any) =>
  request({
    url: '/upload/merge',
    method: 'post',
    data
  })
