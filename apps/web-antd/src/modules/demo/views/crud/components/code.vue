<script setup lang="ts" name="demo-code">
import { computed, type PropType } from 'vue';

import { isEmpty } from 'lodash-es';

import { useCool } from '#/cool';
import { basename } from '#/cool/utils';

const props = defineProps({
  files: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
});

// import { demo } from 'virtual:demo';

const demo = {};

const { refs, setRefs } = useCool();

// 是否隐藏
const isHide = computed(() => isEmpty(demo));

// 文件列表
const tabs = computed(() => {
  return props.files?.map((e) => {
    return {
      name: basename(e),
      language: e.includes('.vue') ? 'html' : 'typescript',
      data: demo[e],
    };
  });
});

// 打开
function open() {
  refs.preview.open();
}
</script>

<template>
  <cl-editor-preview
    v-if="!isHide"
    :ref="setRefs('preview')"
    :tabs="tabs"
    name="monaco"
  >
    <el-button @click="open">代码</el-button>
  </cl-editor-preview>
</template>
