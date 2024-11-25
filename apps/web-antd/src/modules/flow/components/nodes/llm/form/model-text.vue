<script setup lang="ts" name="node-llm-form-model-text">
import { type PropType } from 'vue';

const props = defineProps({
  data: {
    type: Object as PropType<LLMData>,
    default: () => ({}),
  },
});
</script>

<template>
  <div class="form-model-text">
    <template v-if="data?.params?.model">
      <span class="supplier">{{ data.supplier }}</span>
      <el-text>{{ data.params.model }}</el-text>
    </template>

    <el-text v-else color="info" size="small">未选择模型</el-text>
  </div>
</template>

<style lang="scss" scoped>
.form-model-text {
  display: flex;

  .supplier {
    border-right: 1px solid var(--el-border-color);
    padding-right: 10px;
    margin-right: 10px;
  }
}
</style>
