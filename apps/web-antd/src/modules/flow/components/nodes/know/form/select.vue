<script setup lang="ts" name="node-know-form-select">
import { type PropType, ref, useModel } from 'vue';

import { ElMessage } from 'element-plus';
import { isEmpty } from 'lodash-es';

import { useCool } from '#/cool';

import List from './list.vue';

const props = defineProps({
  modelValue: {
    type: Array as PropType<number[]>,
    default: () => [],
  },
});

const { service, router } = useCool();

const visible = ref(false);

// 绑定值
const ids = useModel(props, 'modelValue');

// 知识库列表
const knows = ref<{ description: string; id: number; name: string }[]>([]);

// 刷新
function refresh() {
  service.flow?.config
    .config({
      node: 'know',
    })
    .then((res) => {
      knows.value = res.knows || [];
    });
}

// 已选
const selected = ref<number[]>([]);

// 选择
function select(id: number) {
  const index = selected.value.findIndex((e) => e == id);

  if (index === -1) {
    selected.value.push(id);
  } else {
    selected.value.splice(index, 1);
  }
}

// 打开
function open() {
  visible.value = true;
  selected.value = [...ids.value];
  refresh();
}

// 关闭
function close() {
  visible.value = false;
}

// 保存
function save() {
  if (isEmpty(selected.value)) {
    return ElMessage.warning('至少选择一个知识库');
  }

  ids.value = [...selected.value];
  close();
}
</script>

<template>
  <div class="form-select">
    <cl-svg class="btn-icon is-rt" name="add" @click="open()" />

    <List v-model="ids" deletable />

    <div v-if="isEmpty(ids)" class="empty border">
      <span>未选择知识库，</span>
      <span @click="open()">点击选择</span>
    </div>

    <cl-dialog
      v-model="visible"
      :controls="['close']"
      title="选择知识库"
      width="400px"
    >
      <div class="list">
        <div
          v-for="(item, index) in knows"
          :key="index"
          :class="{
            active: selected.includes(item.id),
          }"
          class="item"
          @click="select(item.id)"
        >
          <p class="name">{{ item.name }}</p>
          <p v-if="item.description" class="desc">{{ item.description }}</p>
        </div>
      </div>

      <div v-if="isEmpty(knows)" class="empty">
        <span>暂无知识库，</span>
        <span @click="router.push('/know/data/type')">点击添加</span>
      </div>

      <div class="op">
        <el-button @click="close">取消</el-button>
        <el-button type="primary" @click="save">确定</el-button>
      </div>
    </cl-dialog>
  </div>
</template>

<style lang="scss" scoped>
.op {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.list {
  .item {
    border-radius: 6px;
    cursor: pointer;
    line-height: normal;
    padding: 10px;
    margin-bottom: 10px;
    border: 1px solid var(--el-border-color);
    box-sizing: border-box;
    user-select: none;

    .icon {
      margin: 0 5px;
      font-size: 16px;
    }

    .name {
      font-size: 14px;
    }

    .desc {
      margin-top: 2px;
      font-size: 12px;
      color: var(--el-color-info);
    }

    &.active {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &:not(.active):hover {
      background-color: var(--el-fill-color-lighter);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.empty {
  text-align: center;
  line-height: normal;
  padding: 15px 0;
  border-radius: 4px;
  font-size: 12px;

  span {
    &:first-child {
      color: var(--el-text-color-placeholder);
    }

    &:last-child {
      color: var(--el-color-success);
      cursor: pointer;
    }
  }

  &.border {
    border: 1px solid var(--el-border-color);
  }
}
</style>
