import type { FlowNode } from '#/types/flow/index';

import FormInputParams from '../_base/form/input-params.vue';
import FormOutputParams from '../_base/form/output-params.vue';
import FormSelect from './form/select.vue';
import component from './index.vue';

export default (): FlowNode => {
  return {
    group: '扩展',
    label: '流程',
    description: '执行其他流程',
    color: '#fd9d2f',
    component,
    form: {
      items: [
        {
          label: '输入变量',
          prop: 'inputParams',
          component: {
            vm: FormInputParams,
            props: {
              disabled: true,
              editField: false,
              placeholder: '请先选择流程',
            },
          },
        },
        {
          label: '选择流程',
          prop: 'options.flowId',
          component: {
            vm: FormSelect,
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
      options: {},
      inputParams: [],
      outputParams: [
        {
          field: 'res1',
          type: 'string',
        },
      ],
    },
    validator(data) {
      // 验证if条件是否设置
      const param = data.options.IF?.find(
        (e: JudgeItem) => !e.nodeId || !e.condition || !e.value,
      );
      if (param) {
        return '条件判断格式异常';
      }
    },
  };
};
