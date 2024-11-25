import type { FlowNode } from '#/types/flow/index';

import { SvgFlowKnowIcon } from '@vben/icons';

import { isEmpty } from 'lodash-es';

import FormInputParams from '../_base/form/input-params.vue';
import FormText from '../_base/form/text.vue';
import FormSelect from './form/select.vue';
import component from './index.vue';

export default (): FlowNode => {
  return {
    group: '信息',
    label: '知识库',
    description: '从知识库中检索出相关的内容',
    icon: SvgFlowKnowIcon,
    bgColor: '#4165d7',
    color: '#4165d7',
    component,
    form: {
      items: [
        {
          label: '输入变量',
          prop: 'inputParams',
          component: {
            vm: FormInputParams,
            props: {
              editField: false,
              disabled: true,
            },
          },
        },
        {
          label: '选择知识库',
          prop: 'options.knowIds',
          component: {
            vm: FormSelect,
          },
        },
        {
          label: '结果条数',
          prop: 'options.size',
          component: {
            name: 'el-input-number',
            props: {
              min: 1,
              max: 100,
            },
          },
        },
        {
          label: '输出变量',
          component: {
            vm: FormText,
            props: {
              text: ['documents<object[]> 文档列表', 'text<string> 文档内容'],
            },
          },
        },
      ],
    },
    data: {
      inputParams: [
        {
          field: 'text',
        },
      ],
      outputParams: [
        {
          field: 'documents',
          type: 'object[]',
        },
        {
          field: 'text',
          type: 'string',
        },
      ],
      options: {
        knowIds: [],
        size: 3,
      },
    },
    validator(data) {
      const { knowIds } = data.options;

      // 验证变量是否绑定值
      const param = data.inputParams?.find((e) => !e.nodeId);
      if (param) {
        return `请绑定变量：${param.field}`;
      }

      // 验证知识库是否选择
      if (isEmpty(knowIds)) {
        return '请选择知识库';
      }
    },
  };
};
