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
      <a-button type="text">{{ data.params.model }}</a-button>
    </template>

    <el-button v-else type="text" color="info" size="small">未选择模型</el-button>
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
