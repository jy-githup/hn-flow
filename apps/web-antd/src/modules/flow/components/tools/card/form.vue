<script setup lang="ts" name="tools-card-form">
import type { FlowNode } from '#/types/flow/index';

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';

import { setFocus, useForm } from '@cool-vue/crud';
import { assign, cloneDeep } from 'lodash-es';

import { useCool } from '#/cool';
import { useFlow } from '#/hooks/hooks/userFlow';

import ToolsIcon from './../icon.vue';
import ToolsNodes from './../nodes.vue';

const { mitt } = useCool();
const Form = useForm();
const flow = useFlow();

// 是否可见
const visible = ref(false);

// 最小宽
const minWidth = computed(() => {
  return flow.node?.form?.width || '400px';
});

// 下一个节点
const nextNodes = computed(() => {
  const list = flow.node?.handle?.next || [{ label: '', value: '' }];

  return list.map((h) => {
    const edge = flow.edges.find(
      (e) =>
        e.source === flow.node?.id &&
        (h.value ? e.sourceHandle === h.value : true),
    );

    return {
      ...h,
      node: edge ? flow.findNode(edge.target!) : null,
    };
  });
});

// 打开表单
function open() {
  visible.value = true;

  // 禁用拖拽
  // if (flow.node?.isDisableDrag === true) {
  // 	flow.disabledDrag();
  // }

  nextTick(() => {
    const { focus, items } = flow.node?.form || {};

    Form.value?.open(
      {
        props: {
          labelPosition: 'top',
        },
        form: flow.node?.data || {},
        items: [...(items || [])],
        op: {
          hidden: true,
        },
      },
      [setFocus(focus || items?.[0]?.prop)],
    );
  });
}

// 关闭表单
function close() {
  visible.value = false;
  flow.enableDrag();
}

// 下一步
function next(node: FlowNode) {
  flow.setNode(node);
  open();
}

// 更新表单值
function update(data: any) {
  assign(Form.value?.form, data);
}

onMounted(() => {
  // 弥补没有node删除事件，监听长度判断
  watch(
    () => flow.nodes.length,
    () => {
      if (flow.node && !flow.findNode(flow.node.id!)) {
        close();
      }
    },
  );

  // 监听表单值改变
  watch(
    () => Form.value?.form,
    (val) => {
      const d = cloneDeep(val);
      Form.value?.invokeData(d);
      assign(flow.node?.data, d);
    },
    {
      deep: true,
    },
  );

  mitt.on('flow.updateForm', update);
  mitt.on('flow.run', close);
});

onUnmounted(() => {
  mitt.off('flow.updateForm', update);
  mitt.off('flow.run', close);
});

defineExpose({
  open,
  close,
});
</script>

<template>
  <div v-if="visible && flow.node" class="tools-card-form nodrag">
    <div class="form">
      <cl-form ref="Form" inner>
        <template #slot-next>
          <div class="next-step">
            <el-text size="small" type="info">
              添加此工作流程中的下一个节点
            </el-text>

            <div class="link">
              <div
                v-for="(item, index) in nextNodes"
                :key="index"
                :class="{
                  active: !!item.node,
                }"
                class="item"
              >
                <div v-if="index === 0" class="a">
                  <ToolsIcon
                    :color="flow.node?.color"
                    :name="flow.node?.icon"
                  />
                </div>

                <div v-if="item.node" class="b" @click="next(item.node)">
                  <ToolsIcon
                    :color="item.node?.color"
                    :name="item.node?.icon"
                  />
                  <el-text size="small">{{ item.node?.label }}</el-text>
                </div>

                <ToolsNodes v-else :handle="item.value" :node="flow.node">
                  <div class="b">
                    <ToolsIcon name="add" />
                    <el-text size="small">选择下一个节点</el-text>
                  </div>
                </ToolsNodes>

                <span v-if="item.label" class="name">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </template>
      </cl-form>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tools-card-form {
  width: v-bind(minWidth);
  max-width: 800px;
  border-radius: 12px;

  .head {
    display: flex;
    align-items: center;
    padding: 10px 15px;

    .label {
      flex: 1;

      :deep(.el-input__wrapper) {
        box-shadow: none;
        padding: 0 5px;

        .el-input__inner {
          font-weight: bold;
          padding: 0 5px;
          border-radius: 4px;

          &:hover {
            background-color: var(--el-fill-color-lighter);
          }
        }
      }
    }

    .btns {
      display: flex;
      align-items: center;

      .btn-icon {
        margin-left: 6px;
      }
    }
  }

  .desc {
    border-bottom: 1px solid var(--el-border-color-lighter);
    padding: 0 5px 7px 5px;

    :deep(.el-input__wrapper) {
      box-shadow: none;
      font-size: 12px;
    }
  }

  .form {
    height: calc(100% - 88px);

    .cl-form {
      :deep(.cl-form-card) {
        .cl-form-card__header {
          background-color: transparent;
          padding: 0;
          font-weight: normal;
          color: var(--el-text-color-primary);
        }
      }
    }

    .next-step {
      line-height: normal;

      .link {
        margin-top: 10px;

        .item {
          display: flex;
          align-items: center;
          position: relative;
          margin-bottom: 10px;

          .a,
          .b {
            height: 35px;
            width: 35px;
            border: 1px solid var(--el-border-color);
            border-radius: 6px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            background-color: var(--el-bg-color);
            box-sizing: border-box;
          }

          .a {
            position: absolute;
            left: 0;
            top: 0;
            z-index: 9;
            border-color: var(--el-color-primary);
          }

          .b {
            flex: 1;
            justify-content: flex-start;
            margin-left: 62px;
            padding-left: 10px;

            .el-text {
              margin-left: 10px;
            }
          }

          .name {
            display: flex;
            align-items: center;
            position: absolute;
            right: 0;
            top: 0;
            height: 35px;
            font-size: 12px;
            padding: 0 10px;
            box-sizing: border-box;
            border-left: 1px solid var(--el-border-color);
            color: var(--el-text-color-regular);
          }

          &:last-child {
            margin-bottom: 0;
          }

          &::after {
            content: '';
            display: block;
            height: 44px;
            width: 44px;
            position: absolute;
            left: 18px;
            bottom: 18px;
            border: 1px solid var(--el-border-color);
            border-top: 0;
            border-right: 0;
          }

          &:first-child::after {
            border-left: 0;
          }

          &:last-child::after {
            border-radius: 0 0 0 6px;
          }

          &.active {
            .name {
              color: var(--el-color-primary);
            }

            .name,
            &::after {
              border-color: var(--el-color-primary);
            }

            .b {
              border-color: var(--el-color-primary);

              .el-text {
                color: var(--el-color-primary);
              }
            }
          }

          &:not(.active) .b:hover {
            background-color: var(--el-fill-color-lighter);
          }
        }
      }
    }
  }

  // 新增样式
  // & > div[class^="tools-card"] {
  // 	position: relative;
  // 	background-color: var(--el-bg-color);
  // 	height: 100%;
  // 	border-radius: 10px;
  // 	box-sizing: border-box;
  // 	box-shadow: 0px 0 10px 1px rgba(16, 24, 40, 0.05);
  // 	margin-left: 10px;

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
  // }
}
</style>
