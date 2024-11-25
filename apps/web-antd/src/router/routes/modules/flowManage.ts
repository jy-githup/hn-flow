import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';
import { $t } from '#/locales';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'ic:baseline-view-in-ar',
      keepAlive: true,
      order: 1000,
      title: $t('flowManage.title'),
    },
    name: 'FlowManage',
    path: '/FlowManage',
    children: [
      {
        meta: {
          title: '流程列表',
        },
        name: 'Flow',
        path: '/Flow',
        redirect: '/Flow/FlowList',
        children: [
          {
            meta: {
              title: '流程列表',
              hideInMenu: true,
            },
            name: 'Flow/FlowList',
            path: '/Flow/FlowList',
            component: () => import('#/views/flowManage/antFlow.vue'),
          },
          {
            meta: {
              title: '流程详情',
              hideInMenu: true,
            },
            name: 'Flow/FlowInfo',
            path: '/Flow/FlowInfo',
            component: () => import('#/views/flowManage/flowInfo.vue'),
          },
        ],
      },
    ],
  },
];
export default routes;
