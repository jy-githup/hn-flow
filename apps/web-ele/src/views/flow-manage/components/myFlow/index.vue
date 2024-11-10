<script setup lang="ts">
import { Background } from '@vue-flow/background';
import { VueFlow } from '@vue-flow/core';
import { MiniMap } from '@vue-flow/minimap';

import headerFlow from '#/views/flow-manage/components/myFlow/modules/headerFlow/index.vue';

import '@vue-flow/core/dist/style.css';
import '@vue-flow/core/dist/theme-default.css';
import '@vue-flow/controls/dist/style.css';
import '@vue-flow/minimap/dist/style.css';
import '@vue-flow/node-resizer/dist/style.css';
</script>

<template>
  <view class="myFlowBox">
    <VueFlow :default-viewport="{ zoom: 1.0 }" :max-zoom="2" :min-zoom="0.25">
      <!-- 自定义顶部栏 -->
      <headerFlow />

      <!-- 背景 -->
      <Background :gap="16" pattern-color="#aaa" />

      <!-- 小图 -->
      <MiniMap :height="100" :width="150" position="bottom-right" />
    </VueFlow>
  </view>
</template>

<style scoped lang="scss">
.myFlowBox {
  height: 100%;

  .vue-flow {
    height: 100%;
  }

  .vue-flow__minimap {
    right: 10px;
    bottom: 50px;
    height: 100px;
    margin: 0;
    overflow: hidden;
    border-radius: 6px;
    box-shadow: 0 0 6px 1px rgb(16 24 40 / 8%);
  }

  .vue-flow__node:has(.is-moving) {
    transition: transform 0.1s;
  }
}
</style>
