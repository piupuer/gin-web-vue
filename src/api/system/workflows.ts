import request from '@/utils/request'

export const getWorkflows = (params: any) =>
  request({
    url: '/workflow/list',
    method: 'get',
    params
  })

export const getWorkflowLines = (params: any) =>
  request({
    url: '/workflow/line/list',
    method: 'get',
    params
  })

export const getWorkflowApprovings = (params: any) =>
  request({
    url: '/workflow/approving/list',
    method: 'get',
    params
  })

export const createWorkflow = (data: any) =>
  request({
    url: '/workflow/create',
    method: 'post',
    data
  })

export const updateWorkflowLine = (data: any) =>
  request({
    url: '/workflow/line/update',
    method: 'patch',
    data
  })

export const updateWorkflow = (id: number, data: any) =>
  request({
    url: `/workflow/update/${id}`,
    method: 'patch',
    data
  })

export const updateWorkflowLogApproval = (data: any) =>
  request({
    url: '/workflow/log/approval',
    method: 'patch',
    data
  })

export const batchDeleteWorkflow = (ids: string) =>
  request({
    url: '/workflow/delete/batch',
    method: 'delete',
    params: {
      ids
    }
  })
