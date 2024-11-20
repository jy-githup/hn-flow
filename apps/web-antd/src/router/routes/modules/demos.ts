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
      title: $t('demos.title'),
    },
    name: 'Demos',
    path: '/demos',
    children: [
      {
        meta: {
          title: $t('demos.antd'),
        },
        name: 'AntDesignDemos',
        path: '/demos/ant-design',
        component: () => import('#/views/demos/antd/index.vue'),
      },
      {
        meta: {
          title: '流程',
        },
        name: 'AntFlow',
        path: '/demos/ant-flow',
        // component: () => import('#/views/demos/antd/antFlow.vue'),
        redirect: '/demos/ant-flow/FlowManage/FlowList',
        children: [
          {
            meta: {
              title: '流程列表',
              hideInMenu: true,
            },
            name: 'FlowManage/FlowList',
            path: 'FlowManage/FlowList',
            component: () => import('#/views/demos/antd/antFlow.vue'),
          },
          {
            meta: {
              title: '流程详情',
              hideInMenu: true,
            },
            name: 'FlowManage/FlowInfo',
            path: 'FlowManage/FlowInfo',
            component: () => import('#/views/demos/antd/flowInfo.vue'),
          },
        ],
      },
    ],
  },
];

export default routes;
