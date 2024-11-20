<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { useTable } from '@cool-vue/crud';
import { Button } from 'ant-design-vue';

const router = useRouter();

const Table = useTable({
  columns: [
    {
      label: "状态",
      prop: "status",
      component: {
        name: "cl-switch",
      },
    },
  ],
});

const addFlow = () => {
  router.push({
    name: 'FlowManage/FlowInfo',
    query: {
      id: 1,
    },
  });
};
</script>

<template>
  <Button type="primary" @click="addFlow">新增</Button>
  <cl-table ref="Table" />
</template>

<style lang="scss" scoped></style>
