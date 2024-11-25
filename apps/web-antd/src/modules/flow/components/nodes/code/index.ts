import type { FlowNode } from '#/types/flow/index';

import FormInputParams from '../_base/form/input-params.vue';
import FormOutputParams from '../_base/form/output-params.vue';
import Editor from './editor/index.vue';
import component from './index.vue';
import { Snippet } from './shippets';

export default (): FlowNode => {
  return {
    group: '行为',
    label: '执行代码',
    description: '执行一段自定义代码，可以调用框架的插件、数据库、service等',
    color: '#67c23a',
    component,
    form: {
      width: '500px',
      items: [
        {
          label: '输入变量',
          prop: 'inputParams',
          component: {
            vm: FormInputParams,
          },
        },
        {
          label: '代码编辑',
          prop: 'options.code',
          component: {
            vm: Editor,
          },
        },
        {
          label: '输出变量',
          prop: 'outputParams',
          component: {
            vm: FormOutputParams,
          },
        },
      ],
    },
    data: {
      inputParams: [
        {
          field: 'arg1',
        },
      ],
      outputParams: [
        {
          field: 'result',
          type: 'string',
        },
      ],
      options: {
        code: Snippet?.base || 200,
      },
    },
    validator(data) {
      // 验证变量是否绑定值
      const param = data.inputParams?.find((e) => !e.nodeId);
      if (param) {
        return `请绑定变量：${param.field}`;
      }
    },
  };
};
