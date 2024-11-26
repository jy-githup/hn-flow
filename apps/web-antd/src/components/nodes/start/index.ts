import type { FlowNode } from '#/types/flow/index';

import { SvgFlowStartIcon } from '@vben/icons';

import { isEmpty } from 'lodash-es';

import FormFields from './form/fields.vue';
import component from './index.vue';

const config = (): FlowNode => {
  return {
    label: '开始',
    description: '开始节点',
    icon: SvgFlowStartIcon,
    bgColor: '#409eff',
    color: '#409eff',
    form: {
      items: [
        {
          label: '输入字段',
          prop: 'inputParams',
          component: {
            name: 'StartFormFields',
            vm: FormFields,
          },
        },
      ],
    },
    data: {
      inputParams: [
        {
          label: '内容',
          field: 'content',
          type: 'text',
          required: true,
        },
      ],
    },
    handle: {
      target: false,
    },
    component,
    validator(data) {
      if (isEmpty(data.inputParams)) {
        return '至少要输入一个字段';
      }
    },
  };
};

export default config;
