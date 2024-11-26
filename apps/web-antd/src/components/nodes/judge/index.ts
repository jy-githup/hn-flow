import type { FlowNode } from '#/types/flow/index';

import { h, resolveComponent, toRaw } from 'vue';

import { SvgFlowLlmIcon } from '@vben/icons';

import FormIf from './form/if.vue';
import component from './index.vue';

export default (): FlowNode => {
  return {
    group: '逻辑',
    label: '条件判断',
    description: '条件判断节点',
    icon: SvgFlowLlmIcon,
    bgColor: '#f56c6c',
    color: '#f56c6c',
    component,
    form: {
      items: [
        {
          label: '满足',
          prop: 'options.IF',
          component: {
            name: 'JudgeFormIf',
            vm: FormIf,
          },
        },
        {
          label: '不满足',
          component: () => {
            return h(
              toRaw(resolveComponent('el-text')),
              {
                type: 'info',
                size: 'small',
              },
              () => {
                return '用于定义当条件不满足时应执行的逻辑。';
              },
            );
          },
        },
      ],
    },
    data: {
      options: {
        IF: [{}] as JudgeItem[],
        ELSE: [] as JudgeItem[],
      },
      outputParams: [
        {
          type: 'boolean',
          field: 'result',
        },
      ],
    },
    handle: {
      source: false,
      next: [
        {
          label: '满足',
          value: 'source-if',
        },
        {
          label: '不满足',
          value: 'source-else',
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
