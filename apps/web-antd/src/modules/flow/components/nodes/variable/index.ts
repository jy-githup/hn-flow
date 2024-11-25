import type { FlowNode } from '#/types/flow/index';

import { isEmpty } from 'lodash-es';

import FormInputParams from '../_base/form/input-params.vue';
import FormOutputParams from '../_base/form/output-params.vue';
import CodeEditor from '../code/editor/index.vue';
import { Snippet } from '../code/shippets';
import component from './index.vue';

export default (): FlowNode => {
  return {
    group: '行为',
    label: '变量',
    description: '变量转换或赋值',
    color: '#67c23a',
    form: {
      width: '500px',
      items: [
        {
          label: '输入变量',
          prop: 'inputParams',
          component: {
            vm: FormInputParams,
            props: {
              varInputable: true,
            },
          },
        },
        {
          label: '代码编辑',
          prop: 'options.code',
          component: {
            vm: CodeEditor,
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
      options: {
        code: Snippet?.simple || Snippet?.base || 200,
      },
      inputParams: [
        {
          field: 'arg1',
        },
      ],
      outputParams: [
        {
          field: 'string',
        },
      ],
    },
    component,
    validator(data) {
      if (isEmpty(data.inputParams)) {
        return '至少要输入一个字段';
      }

      const param = data.inputParams?.find((e) => !e.value && !e.nodeId);
      if (param) {
        return `请绑定变量或填写内容：${param.field}`;
      }
    },
  };
};
