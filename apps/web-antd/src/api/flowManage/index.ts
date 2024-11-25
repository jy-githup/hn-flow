import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

// 新增工作流 /api/flow-info
export const addFlowApi = async (data) => {
  return requestClient.post<RouteRecordStringComponent[]>('/flow-info', data);
};

// 工作流列表 /api/flow-info/paged-query
export const getFlowListApi = async (data = {}) => {
  return requestClient.post<RouteRecordStringComponent[]>(
    '/flow-info/paged-query',
    data,
  );
};

// 更新工作流 /api/flow-info/update
export const updateFlowApi = async (data) => {
  return requestClient.post<RouteRecordStringComponent[]>(
    '/flow-info/update',
    data,
  );
};

// 删除工作流
export const deleteFlowApi = async (id) => {
  return requestClient.get<RouteRecordStringComponent[]>(
    `/flow-info/delete/${id}`,
  );
};

// 查询工作流详情
export const getFlowInfoApi = async (flowId, flowLabel = '') => {
  return requestClient.post<RouteRecordStringComponent[]>('/flow-info/info', {
    label: flowLabel || 'hn_product',
    flowId,
    pagedQueryInfo: {
      index: 1,
      pageSize: 14,
    },
  });
};

// 查询节点详情 /admin/flow/config/getByNode
export const getNodeInfoApi = async (nodeId) => {
  return requestClient.get<RouteRecordStringComponent[]>(
    `/flow/config/getByNode?node=${nodeId}`,
    {
      baseURL: '/admin',
    },
  );
};

// 工作流保存 /api/flow-info/update POST
export const saveFlowApi = async (data) => {
  return requestClient.post<RouteRecordStringComponent[]>(
    '/flow-info/update',
    data,
  );
};

// 开始运行 /api/flow/debug
export const startFlowApi = async (data) => {
  return requestClient.post<RouteRecordStringComponent[]>('/flow/debug', data);
};
