import type { FlowNode } from '#/types/flow/index';

import FormInputParams from '../_base/form/input-params.vue';
import component from './index.vue';

export default (): FlowNode => {
  return {
    group: '逻辑',
    label: '结束',
    description: '结束节点',
    color: '#f56c6c',
    component,
    form: {
      items: [
        {
          label: '输出变量',
          prop: 'outputParams',
          component: {
            vm: FormInputParams,
            props: {
              field: 'res',
            },
          },
        },
      ],
    },
    data: {
      outputParams: [
        {
          field: 'res',
        },
      ],
    },
    handle: {
      source: false,
    },
    validator(data) {
      // 验证变量是否绑定值
      const param = data.outputParams?.find((e) => !e.nodeId);
      if (param) {
        return `请绑定变量到${param.field}`;
      }
    },
  };
};
