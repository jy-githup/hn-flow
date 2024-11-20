import type { FlowNode } from '/$/flow/types';

import { JamBaiduCircle } from '@vben/icons';

import component from './index.vue';

export default (): FlowNode => {
  return {
    group: '信息',
    label: '百度搜索',
    description: '通过百度搜索引擎查找内容',
    icon: JamBaiduCircle,
    color: '#409eff',
    component,
  };
};
