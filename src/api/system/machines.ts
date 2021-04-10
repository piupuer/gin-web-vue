import request from '@/utils/request'

export const getMachines = (params: any) =>
  request({
    url: '/machine/list',
    method: 'get',
    params
  })

export const createMachine = (data: any) =>
  request({
    url: '/machine/create',
    method: 'post',
    data
  })

export const updateMachine = (id: number, data: any) =>
  request({
    url: `/machine/update/${id}`,
    method: 'patch',
    data
  })

export const connectMachine = (id: number) =>
  request({
    url: `/machine/connect/${id}`,
    method: 'patch'
  })

export const batchDeleteMachine = (ids: string) =>
  request({
    url: '/machine/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })
