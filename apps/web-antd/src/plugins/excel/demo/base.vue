<script lang="tsx" setup>
import { useCrud, useTable } from '@cool-vue/crud';
import { ElMessage } from 'element-plus';

import { useCool } from '#/hooks/hooks/index';
import { useDict } from '#/dict';

const { service } = useCool();
const { dict } = useDict();

// crud
const Crud = useCrud(
  {
    service: service.test,
  },
  (app) => {
    app.refresh({ size: 10 });
  },
);

// 表格
const Table = useTable({
  columns: [
    {
      label: '姓名',
      prop: 'name',
    },
    {
      label: '手机号',
      prop: 'phone',
    },
    {
      label: '账号',
      prop: 'account',
    },
    {
      label: '存款(元)',
      prop: 'wages',
    },
    {
      label: '工作',
      prop: 'occupation',
      dict: dict.get('occupation'),
    },
  ],
});

function onImpSubmit(data: { file: File; list: any[] }, { done, close }: any) {
  close();
  ElMessage.success(`已提交${data.list.length}条数据`);
}
</script>

<template>
  <cl-crud ref="Crud">
    <cl-row>
      <!-- 刷新按钮 -->
      <cl-refresh-btn />

      <cl-flex1 />

      <!-- 导入 -->
      <cl-import-btn :on-submit="onImpSubmit" template="/用户导入模版.xlsx" />

      <!-- 导出 -->
      <cl-export-btn :columns="Table?.columns" />
    </cl-row>

    <cl-row>
      <!-- 表格 -->
      <cl-table ref="Table" :auto-height="false" />
    </cl-row>

    <cl-row>
      <cl-flex1 />

      <!-- 分页 -->
      <cl-pagination />
    </cl-row>
  </cl-crud>
</template>
