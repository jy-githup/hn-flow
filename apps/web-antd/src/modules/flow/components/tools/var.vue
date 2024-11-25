<script setup lang="ts" name="tools-var">
import type { FlowField } from '../../types';
import type { PropType } from 'vue';

import { computed, reactive, ref, useModel } from 'vue';

import { Search } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { isEmpty } from 'lodash-es';

import { useCool } from '#/cool';

import { useFlow } from '../../hooks';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  nodeId: {
    type: String,
    default: '',
  },
  // 自定输入值
  value: {
    type: String,
    default: '',
  },
  // 只选择模式，不双向绑定
  onlySelect: Boolean,
  // 只能选择当前节点的入参
  useInputParams: Boolean,
  // 是否能手动输入
  inputable: Boolean,
  // 显示选择器
  showPicker: {
    type: Boolean,
    default: true,
  },
  // 显示搜索
  showSearch: {
    type: Boolean,
    default: true,
  },
  // 是否自动获取焦点
  autofocus: {
    type: Boolean,
    default: true,
  },
  // 定位方式
  position: {
    type: String as PropType<'absolute' | 'fixed' | 'relative'>,
    default: 'fixed',
  },
});

const emit = defineEmits([
  'update:modelValue',
  'update:nodeId',
  'update:nodeType',
  'update:value',
  'update:type',
  'select',
]);

const { refs, setRefs } = useCool();
const flow = useFlow();

// 绑定值
const field = useModel(props, 'modelValue');

// 绑定节点
const nodeId = useModel(props, 'nodeId');

// 绑定自定义输入值
const value = useModel(props, 'value');

// 关键字
const keyWord = ref('');

// 是否可见
const visible = ref(false);

// 事件
const es = {
  onSelect: (() => {}) as (item: FlowField) => void,
};

// 列表
const list = computed(() => {
  const arr = flow.parentAllNodes(flow.node!.id!).map((e) => {
    let params: FlowField[] = [];

    params =
      e.type == 'start'
        ? e.data?.inputParams || []
        : e.data?.outputParams || [];

    return {
      id: e.id,
      type: e.type,
      label: e.label,
      params,
    };
  });

  if (props.useInputParams && flow.node) {
    const { id, type, label, data } = flow.node;

    arr.splice(0, arr.length, {
      id,
      type,
      label,
      params: (data?.inputParams || []).filter((e) => e.nodeId),
    });
  }

  return arr.filter((e) => {
    return (
      !isEmpty(e.params) &&
      (keyWord.value ? e.label?.includes(keyWord.value) : true)
    );
  });
});

// 显示文案
const text = computed(() => {
  const node = list.value.find(
    (e) => e.id == props.nodeId && e.params.find((p) => p.field == field.value),
  );
  return value.value || (node ? `${node?.label} / ${field.value}` : '');
});

// 选择
function select(param: FlowField, node: any) {
  close();

  const d = {
    ...param,
    nodeType: node.type,
    nodeId: node.id,
    nodeLabel: node.label,
    value: '',
  };

  if (props.onlySelect) {
    es.onSelect(d);
  } else {
    field.value = d.field;
    emit('update:nodeType', d.nodeType);
    emit('update:nodeId', d.nodeId);
    emit('update:type', d.type);
    emit('update:value', d.value);
  }

  emit('select', d);
}

// 清空
function clear() {
  field.value = '';
  value.value = '';
  emit('update:nodeType', '');
  emit('update:nodeId', '');
  emit('update:type', '');
  emit('update:value', '');
}

// 打开
function open(
  options: { onSelect?: () => void; rect?: { left: number; top: number } } = {},
) {
  if (options.rect) {
    const { top, left } = options.rect || {};

    refs.btn.style.top = `${top}px`;
    refs.btn.style.left = `${left}px`;
  }

  if (options.onSelect) {
    es.onSelect = options.onSelect;
  }

  if (!visible.value) {
    refs.btn.click();
  }
}

// 关闭
function close() {
  refs.popover.hide();
}

// 聚焦
const focusKey = ref('');

function focus(e?: KeyboardEvent) {
  refs.list.focus();

  if (e) {
    onKeyDown(e);
  }
}

// 自定义值输入
const input = reactive({
  visible: false,
  value: '',

  open() {
    input.value = value.value;
    input.visible = true;
  },

  close() {
    input.visible = false;
  },

  save() {
    if (!input.value) {
      return ElMessage.warning('请输入内容');
    }

    value.value = input.value;
    input.close();
  },

  onChange() {
    field.value = '';
    emit('update:nodeType', '');
    emit('update:nodeId', '');
    emit('update:type', '');
  },
});

// 方向键控制
function onKeyDown(e: KeyboardEvent) {
  const arr = list.value.flatMap((e) => {
    return e.params.map((p) => {
      return {
        ...p,
        node: e,
      };
    });
  });

  let index = 0;

  const current = arr.findIndex(
    (e) => focusKey.value == `${e.node.id}_${e.field}`,
  );

  switch (e.key) {
    case 'ArrowDown': {
      index = current + 1;
      break;
    }
    case 'ArrowUp': {
      index = current - 1;
      break;
    }
    case 'Enter': {
      select(arr[current], arr[current].node);
      break;
    }
  }

  const d = arr[index];

  if (d) {
    focusKey.value = `${d.node.id}_${d.field}`;
  }
}

// 显示后
function onShow() {
  if (props.autofocus) {
    focus();
  }

  visible.value = true;
}

// 隐藏后
function onHide() {
  visible.value = false;
  focusKey.value = '';
}

defineExpose({
  open,
  close,
  focus,
});
</script>

<template>
  <el-popover
    :ref="setRefs('popover')"
    :offset="5"
    :popper-style="{
      padding: '0',
    }"
    placement="bottom-start"
    popper-class="cl-flow__popper"
    trigger="click"
    width="220px"
    @hide="onHide"
    @show="onShow"
  >
    <template #reference>
      <div v-if="showPicker" class="inner-item">
        <el-tooltip v-if="inputable" content="自定义输入">
          <cl-svg
            :style="{ margin: '0 5px 0 -5px' }"
            class="btn-icon is-bg"
            name="t"
            @click.stop="input.open"
          />
        </el-tooltip>

        <span v-if="text" class="text">{{ text }}</span>
        <span v-else class="placeholder">{{
          value ? '输入值' : '选择变量'
        }}</span>

        <cl-svg
          v-if="text"
          class="btn-icon close"
          name="close"
          @click.stop="clear"
        />
      </div>

      <div
        v-else
        :ref="setRefs('btn')"
        :style="{ position }"
        class="tools-var__btn"
      ></div>
    </template>

    <div class="tools-var">
      <div class="search">
        <el-input
          v-model="keyWord"
          :prefix-icon="Search"
          placeholder="搜索变量"
        />
      </div>

      <el-scrollbar max-height="500px">
        <div
          :ref="setRefs('list')"
          :tabindex="0"
          class="list"
          @keydown.stop.prevent="onKeyDown"
        >
          <div v-for="(item, index) in list" :key="index" class="group">
            <p class="label">{{ item.label }}</p>

            <div
              v-for="param in item.params"
              :key="param.field"
              :class="{
                active: `${item.id}_${param.field}` == `${nodeId}_${field}`,
                focus: focusKey == `${item.id}_${param.field}`,
              }"
              class="item"
              @click="select(param, item)"
            >
              <cl-svg class="icon" name="var" />
              <span class="value">{{ param.field }}</span>
              <span class="type">{{ param.type }}</span>
            </div>
          </div>
        </div>

        <div v-if="isEmpty(list)" class="empty">未找到匹配项</div>
      </el-scrollbar>
    </div>

    <!-- 自定义输入 -->
    <cl-dialog v-model="input.visible" title="自定义输入">
      <el-input
        v-model="input.value"
        :rows="20"
        placeholder="请输入"
        type="textarea"
        @change="input.onChange"
      />

      <template #footer>
        <el-button @click="input.close">取消</el-button>
        <el-button type="success" @click="input.save">保存</el-button>
      </template>
    </cl-dialog>
  </el-popover>
</template>

<style lang="scss" scoped>
.tools-var {
  padding-bottom: 5px;

  .list {
    outline: none;

    .group {
      padding: 0 5px;

      .label {
        display: flex;
        align-items: center;
        color: var(--el-text-color-secondary);
        font-size: 12px;
        height: 30px;
        padding: 0 10px;
      }

      .item {
        display: flex;
        align-items: center;
        height: 30px;
        padding: 0 10px;
        cursor: pointer;
        border-radius: 6px;
        font-size: 12px;

        .icon {
          height: 18px;
          width: 18px;
          flex-shrink: 0;
        }

        .value {
          flex: 1;
          margin: 0 5px;
        }

        .type {
          color: var(--el-color-info);
          max-width: 80px;
        }

        .value,
        .type {
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }

        &.active {
          color: var(--el-color-primary);
        }

        &:hover,
        &.focus {
          background-color: var(--el-fill-color-lighter);
        }
      }
    }
  }

  .empty {
    padding: 10px 0 5px 0;
    color: var(--el-text-color-placeholder);
    font-size: 12px;
    text-align: center;
  }

  .search {
    border-bottom: 1px solid var(--el-fill-color-light);
    padding: 5px;

    :deep(.el-input__wrapper) {
      box-shadow: none;
      background-color: var(--el-fill-color-light);
    }

    &:last-child {
      border-bottom: 0;
      margin-bottom: -5px;
    }
  }

  &__btn {
    height: 16px;
    width: 4px;
    // position: fixed;
  }
}
</style>
