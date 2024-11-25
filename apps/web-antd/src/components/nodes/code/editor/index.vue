<script setup lang="ts" name="node-code-editor">
import { computed, onMounted, reactive, useModel, watch } from 'vue';

import { CarbonDebug, MingcuteFullscreenLine } from '@vben/icons';

import { useCool } from '#/hooks/hooks/index';
import { useFlow } from '#/hooks/hooks/userFlow';

import { declares } from './declares';

import { addDeclare } from '#/plugins/editor-monaco';

const props = defineProps({
  modelValue: String,
});

// import { ctx } from 'virtual:ctx';
const ctx = {
  serviceLang: 'Java',
};

const { refs, setRefs, mitt } = useCool();
const flow = useFlow();

// 编辑器语言
const language = computed(() => {
  switch (ctx.serviceLang) {
    case 'Java': {
      return 'java';
    }
    case 'Python': {
      return 'python';
    }
    default: {
      return 'typescript';
    }
  }
});

// 绑定值
const value = useModel(props, 'modelValue');

// 插入代码
function insertCode(code: string) {
  refs.monaco.appendContent(code);
  refs.popover?.hide();
}

// 调试
function toDebug() {
  mitt.emit('flow.runOpen', flow.node);
}

// 更新代码描述
function updateDeclare() {
  watch(
    () => flow.node?.data,
    (data) => {
      const params = data?.inputParams
        ?.map((e) => `${e.field}: ${e.type || 'string'};`)
        .join('');

      const result = data?.outputParams
        ?.map((e) => `${e.field}: ${e.type || 'string'};`)
        .join('');

      addDeclare({
        path: 'flow.d.ts',
        content: `
			declare interface Params { ${params} }
			declare interface Result { ${result} }`,
      });
    },
    {
      immediate: true,
      deep: true,
    },
  );
}

// 初始化
function init() {
  if (ctx.serviceLang === 'Node') {
    ['axios', 'dayjs', 'lodash', 'moment', 'cool'].forEach((k) => {
      addDeclare({ path: `${k}.d.ts`, content: declares[k] });
    });

    updateDeclare();
  }
}

// 全屏
const fullscreen = reactive({
  visible: false,

  open() {
    fullscreen.visible = true;
  },
});

onMounted(() => {
  init();
});
</script>

<template>
  <div class="editor">
    <div class="opbar">
      <el-tooltip content="全屏">
        <MingcuteFullscreenLine class="btn-icon size-6" @click="fullscreen.open" />
      </el-tooltip>

      <el-tooltip content="调试">
        <CarbonDebug class="btn-icon size-6" @click="toDebug" />
      </el-tooltip>
    </div>

    <cl-editor-monaco
      :ref="setRefs('monaco')"
      v-model="value"
      :height="300"
      :language="language"
    />

    <cl-dialog
      v-model="fullscreen.visible"
      :scrollbar="false"
      fullscreen
      height="500px"
      keep-alive
      padding="5px"
      title="代码编辑"
    >
      <cl-editor-monaco
        :ref="setRefs('monaco')"
        v-model="value"
        :language="language"
        height="100%"
      />
    </cl-dialog>
  </div>
</template>

<style lang="scss" scoped>
.opbar {
  position: absolute;
  right: 0;
  top: -30px;
  display: flex;
  flex-direction: row;
  align-items: center;
}
</style>
