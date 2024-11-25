<script lang="ts" name="flow-list" setup>
import { useCrud, useTable, useUpsert } from '@cool-vue/crud';

import { useCool } from '#/cool';

import ImportBtn from '../components/tools/import.vue';
import NodeConfig from '../components/tools/node-config.vue';

import ModuleLog from '/$/flow/components/log/index.vue';

const { service, router, refs, setRefs } = useCool();

// cl-upsert
const Upsert = useUpsert({
  props: {
    labelWidth: '60px',
  },
  items: [
    {
      label: '名称',
      prop: 'name',
      component: { name: 'el-input', props: { clearable: true } },
      required: true,
      span: 12,
    },
    {
      label: '标签',
      prop: 'label',
      component: {
        name: 'el-input',
        props: { clearable: true, placeholder: '调用流程的标识' },
      },
      required: true,
      span: 12,
    },
    {
      label: '状态',
      prop: 'status',
      flex: false,
      value: 1,
      component: { name: 'cl-switch' },
    },
    {
      label: '描述',
      prop: 'description',
      component: { name: 'el-input', props: { type: 'textarea', rows: 4 } },
    },
  ],
});

// cl-table
const Table = useTable({
  columns: [
    { type: 'selection' },
    { label: '名称', prop: 'name', minWidth: 140 },
    {
      label: '标签',
      prop: 'label',
      minWidth: 140,
    },
    {
      label: '状态',
      prop: 'status',
      minWidth: 100,
      component: { name: 'cl-switch' },
    },
    { label: '版本', prop: 'version', minWidth: 100 },
    {
      label: '描述',
      prop: 'description',
      showOverflowTooltip: true,
      minWidth: 200,
    },
    {
      label: '发布时间',
      prop: 'releaseTime',
      minWidth: 170,
      sortable: 'desc',
      formatter(row) {
        return row.releaseTime || '未发布';
      },
    },
    {
      label: '创建时间',
      prop: 'createTime',
      minWidth: 170,
      sortable: 'custom',
    },
    {
      label: '更新时间',
      prop: 'updateTime',
      minWidth: 170,
      sortable: 'custom',
    },
    {
      type: 'op',
      buttons: [
        'edit',
        'delete',
        {
          label: '编排',
          hidden: !service.flow?.info._permission.update,
          onClick({ scope }) {
            router.push({
              path: '/flow/info',
              query: {
                id: scope.row.id,
              },
            });
          },
        },
        {
          label: '日志',
          type: 'warning',
          hidden: !service.flow?.info._permission.update,
          onClick({ scope }) {
            refs.logRef?.open(scope.row);
          },
        },
      ],
      width: 300,
    },
  ],
});

// cl-crud
const Crud = useCrud(
  {
    service: service.flow?.info,
  },
  (app) => {
    app.refresh();
  },
);

// 刷新
function refresh() {
  Crud.value?.refresh();
}
</script>

<template>
  <cl-crud ref="Crud">
    <cl-row>
      <!-- 刷新按钮 -->
      <cl-refresh-btn />
      <!-- 新增按钮 -->
      <cl-add-btn />
      <!-- 删除按钮 -->
      <cl-multi-delete-btn />

      <el-button @click="refs.nodeConfig?.open">配置</el-button>

      <!-- 导入 -->
      <ImportBtn @success="refresh" />

      <cl-flex1 />
      <!-- 关键字搜索 -->
      <cl-search-key placeholder="搜索名称、标签" />
    </cl-row>

    <cl-row>
      <!-- 数据表格 -->
      <cl-table ref="Table" />
    </cl-row>

    <cl-row>
      <cl-flex1 />
      <!-- 分页控件 -->
      <cl-pagination />
    </cl-row>

    <!-- 新增、编辑 -->
    <cl-upsert ref="Upsert" />

    <!-- 配置 -->
    <NodeConfig :ref="setRefs('nodeConfig')" />

    <!-- 日志 -->
    <ModuleLog :ref="setRefs('logRef')" />
  </cl-crud>
</template>
