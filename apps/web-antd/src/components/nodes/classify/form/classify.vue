<script setup lang="ts" name="node-problem-form-classify">
import { onMounted, type PropType, useModel, watch } from 'vue';

import { Input } from 'ant-design-vue';

import { useFlow } from '#/hooks/hooks/userFlow';

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

const flow = useFlow();
const list = useModel(props, 'modelValue');

// 添加
function add() {
  list.value.push('');
}

// 删除
function remove(index: number) {
  list.value.splice(index, 1);

  // handle删了，线同步删除
  const edge = flow.edges.find(
    (e) => e.source === flow.node?.id && e.sourceHandle === `source-${index}`,
  );
  if (edge) {
    flow.removeEdges(edge);
  }
}

onMounted(() => {
  watch(
    list,
    (arr) => {
      if (flow.node) {
        flow.node.handle!.next = arr.map((_, i) => {
          return {
            label: `分类 ${i + 1}`,
            value: `source-${i}`,
          };
        });
      }
    },
    {
      immediate: true,
      deep: true,
    },
  );
});
</script>

<template>
  <div class="form-classify">
    <cl-svg class="btn-icon is-rt" name="add" @click="add()" />

    <div class="list">
      <div v-for="(item, index) in list" :key="index" class="textarea-item">
        <cl-svg class="btn-icon" name="delete" @click="remove(index)" />

        <Input
          v-model="list[index]"
          :autosize="{
            minRows: 2,
            maxRows: 4,
          }"
          placeholder="输入你的主题内容"
          resize="none"
          type="textarea"
        />
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.form-classify {
  .list {
    .textarea-item {
      padding-top: 8px !important;

      .btn-icon {
        position: absolute;
        right: 8px;
        top: 8px;
        z-index: 9;
        background-color: var(--el-bg-color);
      }
    }
  }
}
</style>
