<script lang="ts" name="flow-tools-log-detail" setup>
import { ref } from 'vue';

const nodeInfo = ref<any>(null);

// 弹窗显隐
const visible = ref<boolean>(false);

// 打开
function open(row) {
  if (row.nodeInfo) {
    nodeInfo.value = row.nodeInfo;
  }

  visible.value = true;
}

// 关闭
function close() {
  visible.value = false;
}

defineExpose({ open });
</script>

<template>
  <cl-dialog v-model="visible" title="节点运行信息" width="70%">
    <cl-editor-monaco v-model="nodeInfo" height="800px" />
  </cl-dialog>
</template>
