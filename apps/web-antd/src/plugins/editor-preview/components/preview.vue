<script lang="ts" name="cl-editor-preview" setup>
import { computed, nextTick, type PropType, ref } from 'vue';

import { useClipboard } from '@vueuse/core';
import { ElMessage } from 'element-plus';
import { isObject, isString } from 'lodash-es';

import { useCool } from '#/hooks/hooks/index';

interface TabItem {
  name: string;
  data: string;
  language: string;
}

const props = defineProps({
  modelValue: String,
  title: String,
  name: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: '点击查看',
  },
  showBtn: {
    type: Boolean,
    default: true,
  },
  height: {
    type: String,
    default: '60vh',
  },
  width: {
    type: String,
    default: '60%',
  },
  formatter: Function,

  // 多个内容展示
  tabs: Array as PropType<TabItem[]>,

  // 组件参数
  props: Object,
});

const { refs, setRefs } = useCool();
const { copy } = useClipboard();

// 是否可见
const visible = ref(false);

// 内容
const content = ref('');

// 语言
const language = ref();

// 激活的标签
const active = ref(0);

// 列表
const list = ref<TabItem[]>([]);

// 是否代码预览
const isCode = computed(() => {
  return props.name == 'monaco';
});

// 是否可以滚动
const isScroll = computed(() => !isCode.value);

// 是否可以复制
const isCopy = computed(() => isCode);

// 编辑器配置
const editConfig = computed(() => {
  return {
    language: language.value,
    ...props.props,
  };
});

// 标题
const title = computed(() => {
  return props.title || (isCode.value ? '代码预览' : '文本预览');
});

// 打开
async function open(data?: string | TabItem[]) {
  if (!data) {
    data = props.modelValue;
  }

  if (props.formatter) {
    data = props.formatter(data);
  }

  if (props.tabs) {
    list.value = props.tabs;
    onTabChange(0);
  } else {
    setContent(data);
  }

  visible.value = true;
}

// 设置内容
function setContent(val: any) {
  if (isString(val)) {
    content.value = val;
  } else if (isObject(val)) {
    content.value = JSON.stringify(val, null, 4);
  }
}

// 切换
async function onTabChange(index: any) {
  const item = list.value[index];

  // 设置语言
  language.value = item.language;

  // 设置
  setContent(item.data);

  await nextTick();

  // 格式化代码
  if (isCode.value) {
    refs.editor?.formatCode?.();
  }
}

// 关闭
function close() {
  visible.value = false;
}

// 复制
function toCopy() {
  copy(content.value);
  ElMessage.success('复制成功');
}

defineExpose({
  open,
  close,
});
</script>

<template>
  <slot>
    <el-button v-if="showBtn" @click="open()">{{ text }}</el-button>
  </slot>

  <cl-dialog
    v-model="visible"
    :height="height"
    :scrollbar="isScroll"
    :title="title"
    :width="width"
    append-to-body
    v-bind="$attrs"
  >
    <div class="cl-editor-preview">
      <el-tabs
        v-if="list.length > 1"
        v-model="active"
        type="card"
        @tab-change="onTabChange"
      >
        <el-tab-pane
          v-for="(item, index) in list"
          :key="index"
          :label="item.name"
          :lazy="index != 0"
          :name="index"
        />
      </el-tabs>

      <div class="cl-editor-preview__container">
        <slot name="prepend"></slot>

        <cl-editor
          :key="active"
          :ref="setRefs('editor')"
          :name="`cl-editor-${name}`"
          height="100%"
          preview
          v-bind="editConfig"
          v-model="content"
        />

        <slot name="append"></slot>
      </div>
    </div>

    <template #footer>
      <el-button @click="close">关闭</el-button>
      <el-button v-if="isCopy" type="success" @click="toCopy">复制</el-button>
    </template>
  </cl-dialog>
</template>

<style lang="scss" scoped>
.cl-editor-preview {
  display: flex;
  flex-direction: column;
  height: 100%;

  :deep(img) {
    max-width: 100%;
  }

  &__container {
    flex: 1;
  }
}
</style>
