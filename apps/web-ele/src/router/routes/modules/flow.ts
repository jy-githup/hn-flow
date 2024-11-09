import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: '工作流管理',
    },
    name: 'FlowManage',
    path: '/flow-manage',
    children: [
      {
        meta: {
          title: '工作流',
        },
        name: 'workFlow',
        path: '/flow-mange/workFlow',
        component: () => import('#/views/flow-manage/workFlow/index.vue'),
      },
    ],
  },
];

export default routes;
