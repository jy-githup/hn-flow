<script lang="ts" setup>
import { useRouter } from 'vue-router';

import { Button } from 'ant-design-vue';

const router = useRouter();

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
  <div>
    <Button type="primary" @click="addFlow">新增</Button>
  </div>
</template>

<style lang="scss" scoped></style>
