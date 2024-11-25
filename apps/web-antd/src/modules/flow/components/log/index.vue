<script lang="ts" name="flow-tools-log" setup>
import { nextTick, reactive, ref } from 'vue';

import { useCrud, useTable } from '@cool-vue/crud';
import { isEmpty } from 'lodash-es';

import { useCool } from '#/cool';

import LogDetail from './detail.vue';

const { service, refs, setRefs } = useCool();

const options = reactive({
  type: [
    {
      label: '失败',
      type: 'danger',
      value: 0,
    },
    {
      label: '成功',
      type: 'success',
      value: 1,
    },
    {
      label: '未知',
      type: 'info',
      value: 2,
    },
  ],
});

// 弹窗显隐
const visible = ref<boolean>(false);

// 打开
function open(row) {
  visible.value = true;

  nextTick(() => {
    refresh({
      flowId: row.id,
    });
  });
}

// 关闭
function close() {
  visible.value = false;
}

// cl-table
const Table = useTable({
  columns: [
    {
      label: '流程名称',
      prop: 'flowName',
      minWidth: 140,
    },
    {
      label: '流程label',
      prop: 'flowLabel',
      minWidth: 120,
    },
    {
      label: '传入参数',
      prop: 'inputParams',
      minWidth: 160,
      showOverflowTooltip: true,
    },
    {
      label: '结果',
      prop: 'result',
      width: 160,
      showOverflowTooltip: true,
    },
    {
      label: '创建时间',
      prop: 'createTime',
      width: 170,
      sortable: 'custom',
    },
    {
      label: '执行状态',
      prop: 'type',
      width: 140,
      fixed: 'right',
      dict: options.type,
    },
    {
      type: 'op',
      width: 120,
      buttons: [
        {
          label: '运行信息',
          onClick: ({ scope }) => {
            refs.logDetailRef.open(scope.row);
          },
        },
      ],
    },
  ],
});

// cl-crud
const Crud = useCrud(
  {
    service: service.flow?.log,
    async onRefresh(params, { render, next }) {
      const res = await service.flow?.log.page(params);

      // 格式化数据
      const list =
        res.list?.map((e) => {
          let { inputParams, result, ...arg } = e;

          // 处理数据
          inputParams = inputParams
            ? JSON.stringify(decodeUnicode(inputParams))
            : '';
          result = result ? JSON.stringify(decodeUnicode(result)) : '';

          return {
            ...arg,
            inputParams,
            result,
          };
        }) ?? [];

      // 渲染数据
      render(list, res.pagination);
    },
  },
  // (app) => {
  // 	app.refresh();
  // }
);

// 刷新
function refresh(params?: any) {
  Crud.value?.refresh(params);
}

/**
 * 处理Unicode 解码参数
 * @param data
 * @param key
 */
function decodeUnicode(data, key = 'dynamic') {
  if (data && !isEmpty(data[key])) {
    data[key] = JSON.parse(data[key]);
  }

  return data;
}

defineExpose({
  open,
});
</script>

<template>
  <cl-dialog v-model="visible" title="调用日志" width="80%">
    <cl-crud ref="Crud">
      <cl-row>
        <!-- 刷新按钮 -->
        <cl-refresh-btn />

        <cl-flex1 />

        <!-- 关键字搜索 -->
        <cl-filter label="状态">
          <cl-select
            :options="options.type"
            :width="160"
            placeholder="请选择状态"
            prop="type"
          />
        </cl-filter>
      </cl-row>

      <cl-row>
        <!-- 数据表格 -->
        <cl-table ref="Table" :auto-height="false" />
      </cl-row>

      <cl-row>
        <cl-flex1 />
        <!-- 分页控件 -->
        <cl-pagination />
      </cl-row>
    </cl-crud>
  </cl-dialog>

  <LogDetail :ref="setRefs('logDetailRef')" />
</template>
