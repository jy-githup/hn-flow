<script setup lang="ts" name="tools-card">
import type { FlowNode, FlowNodeResult } from '#/types/flow/index';

import { computed, nextTick, onMounted, onUnmounted, reactive } from 'vue';

import { Loading } from '@element-plus/icons-vue';

import { useCool } from '#/cool';
import { useFlow } from '#/hooks/hooks/userFlow';

import CardForm from './card/form.vue';
import ToolsHandle from './handle.vue';
import ToolsIcon from './icon.vue';
import ToolsMore from './more.vue';

const props = defineProps({
  nodeId: String,
});

const { mitt, refs, setRefs } = useCool();
const flow = useFlow();

// 是否可调试
const isRun = computed(() => {
  return flow.node ? !['end', 'start'].includes(flow.node.type!) : false;
});

// 最小宽
const width = computed(() => {
  return flow.node?.form?.width || '400px';
});

// 节点数据
const node = computed(() => {
  return flow.findNode(props.nodeId!);
});

// 是否开始节点
const isStart = computed(() => {
  return node.value?.type == 'start';
});

// 是否激活
const isActive = computed(() => {
  return node.value?.id == flow.node?.id;
});

// 节点组件
function component() {
  return flow.CustomNodes.find((e) => e.type == node.value?.type)?.component;
}

// 调试
function run() {
  mitt.emit('flow.runOpen', flow.node);
}

// 移除节点
function remove() {
  flow.removeNodes(node.value);
}

// 关闭表单
function close() {
  flow.enableDrag();
  flow.clearNode();
}

// 获取颜色值
function getColor(color: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(
    `--el-color-${color}`,
  );
}

// 节点运行结果
const result = reactive({
  status: 'none' as 'fail' | 'none' | 'running' | 'success' | 'waiting',
  message: '',
  clear() {
    result.status = 'none';
    result.message = '';
    result.updateEdge({ animated: false, style: {} });
  },
  check() {
    result.clear();
  },
  ready(_, node?: FlowNode) {
    function done() {
      result.status = 'waiting';
      result.message = '等待中...';
    }

    if (node) {
      if (props.nodeId == node.id) {
        done();
      }
    } else {
      const startNode = flow.findNodeByType('start');

      if (startNode) {
        const childrens = flow.childrenAllNodes(startNode.id!);

        if (
          childrens.find((e) => e.id == props.nodeId) ||
          startNode.id == props.nodeId
        ) {
          done();

          result.updateEdge({
            animated: true,
            style: {
              stroke: getColor('info'),
            },
          });
        }
      }
    }
  },
  start(nodeId: string) {
    if (nodeId == props.nodeId) {
      flow.setViewportByNode(flow.findNode(nodeId));

      result.status = 'running';
      result.message = '运行中...';

      result.updateEdge({
        style: {
          stroke: getColor('primary'),
        },
      });
    }
  },
  result(res: FlowNodeResult, node?: FlowNode) {
    const nodeId = node?.id || res.nodeId;

    if (nodeId == props.nodeId) {
      // 设置节点状态
      if (res.result.success) {
        const duration = Number.parseFloat(
          ((res.duration || 1) / 1000).toFixed(3),
        );

        result.status = 'success';
        result.message = `执行成功，耗时：${duration}s`;

        // 下一个准备
        if (!node && res.nextNodeId != nodeId) {
          mitt.emit('flow.run', { action: 'start', data: res.nextNodeId });
        }
      } else {
        result.status = 'fail';
        result.message = res.result.error.message;

        // 设置视角
        flow.setViewportByNode(flow.findNode(res.nodeId!));
      }

      // 非单节点需要控制线的样式
      if (!node) {
        // 更新线颜色、动画
        result.updateEdge({
          animated: true,
          style: {
            stroke: res.result.success
              ? getColor('success')
              : getColor('danger'),
          },
        });
      }
    }
  },
  fail({ nodeId, message }: { message: string; nodeId: string }) {
    if (props.nodeId == nodeId) {
      result.status = 'fail';
      result.message = message;
      flow.setViewportByNode(flow.findNode(nodeId));
    }
  },
  end() {
    if (['running', 'waiting'].includes(result.status)) {
      result.close();
    }
  },
  close() {
    result.clear();
  },
  updateEdge(data: any) {
    const edge = flow.edges.find((e) => e.target == props.nodeId);

    if (edge) {
      flow.updateEdge(edge.id, data);
    }
  },
  onRun({
    action,
    data,
    node,
  }: {
    action: string;
    data: any;
    node?: FlowNode;
  }) {
    result[action](data, node);
  },
});

// 打开表单
async function openForm(data: FlowNode) {
  nextTick(() => {
    if (data && data.id == props.nodeId) {
      refs.form?.open();
    }
  });
}

// 关闭表单
function closeForm(data: FlowNode) {
  nextTick(() => {
    if (data?.id == props.nodeId) {
      refs.form?.close();
    }
  });
}

onMounted(() => {
  mitt.on('flow.openForm', openForm);
  mitt.on('flow.closeForm', closeForm);
  mitt.on('flow.run', result.onRun);
  mitt.on('flow.runClose', result.close);
});

onUnmounted(() => {
  mitt.off('flow.openForm', openForm);
  mitt.off('flow.closeForm', closeForm);
  mitt.off('flow.run', result.onRun);
  mitt.off('flow.runClose', result.close);
});
</script>

<template>
  <div
    :class="[
      `is-${result.status}`,
      {
        'is-active': isActive,
        'is-moving': node.isMoving,
      },
    ]"
    class="tools-card"
  >
    <!-- 源选择点 -->
    <ToolsHandle
      v-if="node?.handle?.source ?? true"
      id="source"
      :node-id="nodeId"
      :position="{
        right: '-9px',
        top: '14px',
      }"
      type="source"
    />

    <!-- 目标选择点 -->
    <ToolsHandle
      v-if="node?.handle?.target ?? true"
      id="target"
      :node-id="nodeId"
      :position="{
        left: '-9px',
        top: '14px',
      }"
      type="target"
    />

    <div class="head">
      <ToolsIcon :color="node?.color" :name="node?.icon" />

      <el-input
        v-if="isActive && flow.node?.label"
        v-model="flow.node.label"
        class="label"
        placeholder="标题"
      />
      <span v-else>{{ node?.label }}</span>

      <div class="btns" @click.stop>
        <template v-if="!isStart">
          <!-- <tools-nodes :node="node" is-change>
						<cl-svg name="change" />
					</tools-nodes> -->

          <el-tooltip v-if="isRun && isActive" content="调试" placement="top">
            <cl-svg class="btn-icon is-bg" name="run" @click="run" />
          </el-tooltip>

          <el-tooltip content="删除" placement="top">
            <cl-svg
              :style="{
                marginLeft: 'auto',
              }"
              name="delete"
              @click="remove"
            />
          </el-tooltip>

          <!-- <el-tooltip content="关闭" placement="top">
						<cl-svg
							v-if="isActive"
							class="btn-icon is-bg"
							name="close"
							@click.stop="close"
						/>
					</el-tooltip> -->
        </template>

        <!-- <el-tooltip :content="node?.description" placement="top">
					<cl-svg name="info" />
				</el-tooltip> -->

        <ToolsMore :node="node">
          <cl-svg name="more" />
        </ToolsMore>
      </div>
    </div>

    <div class="desc">
      <el-input
        v-if="isActive"
        v-model="flow.node!.desc"
        :placeholder="node?.description"
        clearable
      />
      <span v-else class="text">{{ node?.desc || node?.description }}</span>
    </div>

    <div class="container">
      <component :is="component()" :focus="isActive" :node="node" />
      <CardForm v-if="isActive" :ref="setRefs('form')" />
    </div>

    <div v-if="result.status !== 'none'" class="tips">
      <el-icon v-if="result.status == 'running'" class="is-loading">
        <Loading />
      </el-icon>
      <span>{{ result.message }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tools-card {
  border-radius: 12px;
  background-color: var(--el-bg-color);
  width: 300px;
  position: relative;
  border: 2px solid var(--el-fill-color-light);
  box-sizing: border-box;
  transition: all 0.2s;

  .btns {
    display: none;
    align-items: center;
    justify-content: space-between;
    position: absolute;
    top: 8px;
    right: 10px;
    box-sizing: border-box;
    // border: 1px solid var(--el-fill-color-light);
    background-color: var(--el-bg-color);
    border-radius: 6px;
    font-size: 12px;
    padding: 3px;
    box-sizing: border-box;

    .cl-svg {
      color: var(--el-text-color-regular);
      cursor: pointer;
      border-radius: 4px;
      height: 15px;
      width: 15px;
      padding: 4px;

      &:hover,
      &:focus {
        background-color: var(--el-fill-color-light);
      }

      &:focus {
        outline: none;
      }
    }

    &:has(.cl-svg:focus) {
      display: flex;
    }
  }

  .head {
    display: flex;
    align-items: center;
    padding: 0 15px;
    height: 44px;

    .icon {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 20px;
      width: 20px;
      border-radius: 4px;
      background-color: var(--el-color-primary);
      color: #fff;
    }

    span {
      font-size: 14px;
      font-weight: bold;
      margin-left: 10px;
      line-height: 1;
    }

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

  .container {
    padding: 0 15px;
  }

  .desc {
    padding: 0 15px 15px 15px;
    font-size: 12px;
    color: var(--el-color-info);
    word-break: break-all;

    :deep(.el-input__wrapper) {
      box-shadow: none;
      font-size: 12px;
      background-color: var(--el-fill-color-lighter);
      border-radius: var(--el-border-radius-base);
    }
  }

  .tips {
    padding: 0 15px 15px 15px;
    font-size: 12px;

    .is-loading {
      font-size: 14px;
      position: relative;
      top: 2px;
      margin-right: 3px;
    }
  }

  &:hover {
    box-shadow:
      0px 4px 6px -2px rgba(16, 24, 40, 0.03),
      0px 12px 16px -4px rgba(16, 24, 40, 0.08);

    .btns {
      display: flex;
    }
  }

  &.is-active {
    width: calc(v-bind('width') + 30px);
    border-color: var(--el-color-primary);
  }

  &.is-waiting,
  &.is-running {
    border-color: var(--el-color-info);

    .tips {
      color: var(--el-color-info);
    }
  }

  &.is-running {
    border-color: var(--el-color-primary);

    .tips {
      color: var(--el-color-primary);
    }
  }

  &.is-fail {
    border-color: var(--el-color-danger);

    .tips {
      color: var(--el-color-danger);
    }

    :deep(.rod) {
      color: var(--el-color-danger);
    }
  }

  &.is-success {
    border-color: var(--el-color-success);

    .tips {
      color: var(--el-color-success);
    }

    :deep(.rod) {
      color: var(--el-color-success);
    }
  }
}
</style>
