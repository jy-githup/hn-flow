import type { FlowNode } from '#/types/flow/index';

import component from './index.vue';

export default (): FlowNode => {
  return {
    group: '信息',
    label: '百度搜索',
    description: '通过百度搜索引擎查找内容',
    component,
  };
};
