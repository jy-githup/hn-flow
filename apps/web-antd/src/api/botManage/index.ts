import type { RouteRecordStringComponent } from '@vben/types';

import { requestClient } from '#/api/request';

// 新增工作流
export const getDeaftBotListApi = async (data) => {
  return requestClient.post<RouteRecordStringComponent[]>(
    '/draftbot/get_draft_bot_list',
    data,
  );
};
