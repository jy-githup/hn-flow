<script setup lang="ts" name="node-flow-form-info">
import { onMounted, ref, watch } from 'vue';

import { useCool } from '#/cool';

const props = defineProps({
  flowId: Number,
});

const { service } = useCool();

const info = ref<Eps.FlowInfoEntity>();

async function refresh() {
  info.value = await service.flow?.info.info({
    id: props.flowId,
  });
}

onMounted(() => {
  watch(
    () => props.flowId,
    (val) => {
      if (val) {
        refresh();
      }
    },
    {
      immediate: true,
    },
  );
});
</script>

<template>
  <div v-if="info" class="form-info">
    <el-tag disable-transitions effect="dark" size="small" type="success">
      v{{ info?.version }}
    </el-tag>

    <el-text :truncated="true" size="small">
      {{ info?.name }}
    </el-text>
  </div>
</template>

<style lang="scss" scoped>
.form-info {
  display: flex;
  align-items: center;
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  padding: 0 10px;
  cursor: pointer;
  height: 32px;
  width: 100%;
  position: relative;
  transition: all 0.2s;
  box-sizing: border-box;

  .el-tag {
    margin-right: 5px;
  }

  &:hover {
    border-color: var(--el-border-color-hover);
  }
}
</style>
