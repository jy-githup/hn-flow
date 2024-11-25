import type { RouteRecordRaw } from 'vue-router';

import { BasicLayout } from '#/layouts';

const routes: RouteRecordRaw[] = [
  {
    component: BasicLayout,
    meta: {
      icon: 'octicon:dependabot-16',
      keepAlive: true,
      order: 1000,
      title: '机器人管理',
    },
    name: 'botManage',
    path: '/botManage',
    children: [
      {
        meta: {
          title: '机器人列表',
        },
        name: 'botList',
        path: '/botList',
        component: () => import('#/views/botManage/botList.vue'),
      },
    ],
  },
];

export default routes;
