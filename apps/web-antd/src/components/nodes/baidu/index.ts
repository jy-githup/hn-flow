import type { FlowNode } from '#/types/flow/index';

import { SvgFlowBaiduIcon } from '@vben/icons';

import component from './index.vue';

export default (): FlowNode => {
  return {
    group: '信息',
    label: '百度搜索',
    description: '通过百度搜索引擎查找内容',
    icon: SvgFlowBaiduIcon,
    bgColor: '#4165d7',
    color: '#4165d7',
    component,
  };
};
