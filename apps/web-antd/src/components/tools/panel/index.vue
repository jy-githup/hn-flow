<script setup lang="ts" name="tools-panel">
import { Panel } from '@vue-flow/core';

import PanelRun from './run.vue';
</script>

<template>
  <Panel class="tools-panel-right" position="top-right">
    <PanelRun />
  </Panel>
</template>

<style lang="scss" scoped>
.vue-flow__panel {
  display: flex;

  &.right {
    height: calc(100% - 50px);
    z-index: 10;
    margin: 0 10px 0 0;
    margin-top: 50px;

    & > div[class^='tools-panel'] {
      position: relative;
      background-color: var(--el-bg-color);
      height: 100%;
      border-radius: 10px;
      box-sizing: border-box;
      box-shadow: 0px 0 10px 1px rgba(16, 24, 40, 0.05);
      margin-left: 10px;

      :deep(.inner-item) {
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

        .text {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          padding-right: 20px;
        }

        .placeholder {
          color: var(--el-text-color-placeholder);
          font-size: 14px;
        }

        .close {
          position: absolute;
          right: 6px;
          display: none;
          font-size: 12px !important;
          color: var(--el-color-info);
        }

        &:hover {
          border-color: var(--el-border-color-hover);

          .close {
            display: block;
          }
        }
      }

      :deep(.textarea-item) {
        border: 1px solid var(--el-border-color);
        padding: 0 0 8px 0;
        border-radius: 8px;
        margin-bottom: 10px;

        .el-textarea__inner {
          background-color: transparent;
          box-shadow: none;
          padding: 0 10px;
        }

        .head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10px;
          height: 30px;
          line-height: normal;

          span {
            font-size: 12px;
            color: var(--el-color-info);
          }
        }

        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(.btn-icon) {
        color: var(--el-text-color-regular);
        cursor: pointer;
        border-radius: 6px;
        font-size: 14px;
        padding: 4px;
        flex-shrink: 0;
        outline: none;

        &:focus,
        &:hover {
          background-color: var(--el-fill-color-light);
          color: var(--el-text-color-primary);
        }

        &.is-rt {
          position: absolute;
          top: -30px;
          right: 0;
        }

        &.is-bg {
          background-color: var(--el-fill-color-lighter);

          &:hover {
            color: var(--el-color-primary) !important;
          }
        }
      }
    }
  }
}
</style>
