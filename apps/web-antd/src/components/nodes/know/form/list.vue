<script setup lang="ts" name="node-know-form-list">
import type { PropType } from 'vue';
import { computed, onMounted, ref, useModel } from 'vue';

import { useCool } from '#/cool/hooks/index';

const props = defineProps({
  modelValue: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
  deletable: Boolean,
});

const { service } = useCool();

// 绑定值
const ids = useModel(props, 'modelValue');

// 知识库列表
const knows = ref<{ description: string; id: number; name: string }[]>([]);

// 列表
const list = computed(() => {
  return ids.value
    .map((id) => {
      return knows.value.find((e) => e.id === id)!;
    })
    .filter(Boolean);
});

// 刷新
function refresh() {
  knows.value = [];
  // service.flow.config
  // 	.config({
  // 		node: "know"
  // 	})
  // 	.then((res) => {
  // 		knows.value = res.knows || [];
  // 	});
}

onMounted(() => {
  refresh();
});
</script>

<template>
  <div class="list">
    <div v-for="(item, index) in list" :key="index" class="item">
      <cl-svg class="icon" name="know" />
      <span class="name">{{ item.name }}</span>

      <cl-svg
        v-if="deletable"
        class="btn-icon del"
        name="delete"
        @click="
          () => {
            ids.splice(index, 1);
          }
        "
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.list {
  .item {
    display: flex;
    align-items: center;
    border-radius: var(--el-border-radius-base);
    cursor: pointer;
    height: 32px;
    line-height: normal;
    padding: 0 5px;
    margin-bottom: 5px;
    border: 1px solid var(--el-border-color);
    box-sizing: border-box;

    .icon {
      margin: 0 5px;
      font-size: 16px;
      color: var(--el-text-color-regular);
    }

    .name {
      font-size: 12px;
    }

    .del {
      font-size: 14px;
      margin-left: auto;
      padding: 4px;
      outline: none;
      border-radius: 6px;

      &:hover {
        background-color: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
      }
    }

    &:hover {
      border-color: var(--el-border-color-hover);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
