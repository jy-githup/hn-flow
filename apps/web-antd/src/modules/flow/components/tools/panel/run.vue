<script setup lang="ts" name="tools-panel-run">
import type { FlowNode, FlowNodeResult } from '#/types/flow/index';

import { computed, nextTick, onMounted, onUnmounted, reactive, ref } from 'vue';

import { Loading } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { isEmpty, isString, last } from 'lodash-es';

import { config } from '#/config';
import { useCool } from '#/cool';
import { useFlow } from '#/hooks/hooks/userFlow';
import { useBase } from '#/modules/base';

import ToolsIcon from '../icon.vue';

const { mitt, refs, setRefs } = useCool();
const flow = useFlow();
const { user } = useBase();

// 是否可见
const visible = ref(false);

// 打开
function open(node?: FlowNode) {
  visible.value = true;
  test.tab = 'input';
  test.node = node || null;
}

// 关闭
function close() {
  visible.value = false;
  test.clear();
  trace.clear();
  mitt.emit('flow.runClose');
}

// 表单
const form = reactive({});

// 入参
const inputParams = computed(() => {
  const node = test.node || flow.findNodeByType('start');

  return (node?.data?.inputParams || []).map((e) => {
    return {
      ...e,
      label: e.label || e.field,
      type: e.type || 'text',
    };
  });
});

// 调试
const test = reactive({
  tab: 'input',
  node: null as FlowNode | null, // 单个节点调试
  running: false,
  res: [] as FlowNodeResult[],
  info: {
    status: 'none' as 'fail' | 'none' | 'running' | 'success',
    input: '',
    output: '',
    duration: 0,
    tokenUsage: 0,
  },
  cacheText: '',

  emit(action: string, data?: any) {
    mitt.emit('flow.run', { action, data, node: test.node });
  },

  streamReader: null as null | ReadableStreamDefaultReader,

  // 清空
  clear() {
    test.running = false;

    // 清空记录
    test.res = [];

    // 清空多余的输入值
    for (const i in form) {
      const d = inputParams.value.find((e) => e.field == i);

      if (!d) {
        delete form[i];
      }
    }

    // 执行状态
    test.info.status = 'running';

    // 输入值
    test.info.input = JSON.stringify(form, null, 4);

    // 消耗数
    test.info.tokenUsage = 0;

    // 输出值
    test.info.output = '';

    // 时长
    test.info.duration = 0;

    // 清空过程的数据
    trace.clear();

    // 关闭流
    if (test.streamReader) {
      test.streamReader.cancel();
    }

    // 清空选中节点
    flow.clearNode();
  },

  // 检测节点是否配置正确
  checkNode(cb?: (status: boolean) => void) {
    // 开始检测
    test.emit('check');

    if (test.node) {
      return true;
    }

    let status = true;

    // 开始节点
    const start = flow.findNodeByType('start');

    // 当前运行的所有节点
    const nodes = [start, ...flow.childrenAllNodes(start.id!)];

    // 检测节点，如果叶子节点不是结束，则整条线报错
    nodes.find((node) => {
      if (node.handle?.source === false && !node.handle?.next) {
        return false;
      }

      const next = node.handle?.next || [
        { label: node.label, value: 'source' },
      ];

      next.find((e) => {
        const d = flow.edges.find(
          (edge) => edge.source == node.id && edge.sourceHandle == e.value,
        );

        if (!d) {
          status = false;

          test.emit('fail', {
            nodeId: node.id,
            message: `检测失败：“${e.label}”需要添加一个结束节点`,
          });

          return true;
        }
      });
    });

    // 检查每个节点的自定义验证
    if (status) {
      status = !nodes.find((e) => {
        if (e.validator) {
          const msg = e.validator(e.data!);

          if (isString(msg)) {
            test.emit('fail', {
              nodeId: e.id,
              message: `检测异常：${msg}`,
            });

            flow.setNode(e);

            // 打开节点表单
            // setTimeout(() => {
            // 	mitt.emit("flow.openForm");
            // }, 100);

            return true;
          }
        }
      });
    }

    // 回调
    if (cb) {
      cb(status);
    }

    return status;
  },

  // 检测输入参数是否未填写
  checkInput(action?: string) {
    // 对话框可以不检查内容参数
    const isChat = action == 'chat' || test.tab == 'chat';

    const param = inputParams.value.find((e) => {
      if (e.required) {
        if (isChat && chat.contentId == e.field) {
          return false;
        }

        let val = form[e.field];

        if (e.type == 'text' && !val) {
          return true;
        }

        if (e.type == 'number') {
          val = Number(val);

          if (isNaN(val)) {
            return true;
          }
        }
      }
    });

    if (param) {
      ElMessage.error(`请填写${param.label}`);
      return false;
    }

    return true;
  },

  // 运行
  async run() {
    if (!test.checkInput()) {
      return false;
    }

    if (!test.checkNode()) {
      return false;
    }

    // 准备事件
    test.emit('ready');

    // 清空
    test.clear();

    // 关闭节点聚焦
    mitt.emit('flow.closeForm');

    // 运行中
    test.running = true;

    // 详情面板
    if (test.tab == 'input') {
      test.tab = 'detail';
    }

    // 保存草稿
    await flow.save();

    // 调试运行
    fetch(`${config.baseUrl}/admin/flow/run/debug`, {
      method: 'POST',
      headers: {
        Authorization: user.token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        label: flow.info?.label,
        params: form,
        nodeId: test.node?.id,
        stream: test.tab == 'chat',
      }),
    })
      .then((res) => {
        if (res.body) {
          test.streamReader = res.body.getReader();
          const decoder = new TextDecoder('utf-8');
          const stream = new ReadableStream({
            start(controller) {
              function push() {
                test.streamReader?.read().then(({ done, value }) => {
                  if (done) {
                    test.done();
                    controller.close();
                    return;
                  }
                  const text = decoder.decode(value, { stream: true });

                  test.handleResult(text);
                  controller.enqueue(text);
                  push();
                });
              }
              push();
            },
          });

          return new Response(stream);
        }
      })
      .catch((error) => {
        test.done();
        console.error(error);
      });

    // 节点开始运行
    if (test.node) {
      test.emit('start', test.node.id);
    } else {
      test.emit('start', flow.findNodeByType('start').id);
    }
  },

  // 运行完成
  done() {
    const end = last(test.res);

    if (end) {
      // 执行状态
      test.info.status = end.isEnd ? 'success' : 'fail';

      // 输出值
      test.info.output = JSON.stringify(end.result.result, null, 4);

      // 消费
      test.info.tokenUsage = end.count?.tokenUsage || 0;

      // 总时长
      test.info.duration = Number.parseFloat(
        (
          (test.res.reduce((a, b) => a + (b.duration || 0), 0) || 1) / 1000
        ).toFixed(3),
      );
    }

    // 运行完成
    test.running = false;

    // 更新过程
    trace.update();

    // 结束事件
    test.emit('end');
  },

  // 处理结果
  handleResult(text: string) {
    // 解决输出字符过长问题
    if (test.cacheText) {
      text = test.cacheText + text;
    }

    // 对齐格式
    if (text.indexOf('data:') == 0) {
      text = `\n\n${text}`;
    }

    try {
      // 解析内容
      const res: FlowNodeResult[] = text
        .split(/\n\ndata:/g)
        .filter(Boolean)
        .map((e) => JSON.parse(e));

      // 是否异常
      const err = res.find((e) => !e.nodeId && !e.node && !e.llmStream);

      if (err) {
        ElMessage.error(err.result.error.message);
      } else {
        // 分发事件
        res.forEach((e) => {
          test.emit('result', e);

          if (e.llmStream) {
            // 对话框输出
            chat.onData(e);
          } else {
            // 保存结果
            test.res.push(e);
          }
        });
      }

      test.cacheText = '';
    } catch {
      test.cacheText = text;
    }
  },
});

// 对话
const chat = reactive({
  contentId: '0',
  content: '',
  loading: false,

  list: [] as {
    content: string;
    isMy: boolean;
  }[],

  check() {
    if (chat.contentId == '0') {
      ElMessage.warning('请先设置对话内容标识，再运行');
      return false;
    }

    if (!test.checkInput('chat')) {
      return false;
    }

    return true;
  },

  open() {
    if (!chat.check()) {
      return false;
    }

    test.tab = 'chat';

    setTimeout(() => {
      refs['chat.input'].focus();
    }, 300);
  },

  send() {
    const item = reactive({
      content: '',
      isMy: false,
    });

    chat.list.push(item);

    test.run();
  },

  toSend() {
    if (!chat.check()) {
      test.tab = 'input';
      return false;
    }

    const val = chat.content;

    if (chat.content) {
      chat.content = '';
    } else {
      return false;
    }

    chat.list.push({
      content: val,
      isMy: true,
    });

    // 加载中
    chat.loading = true;

    // 设置内容参数
    form[chat.contentId] = val;

    chat.send();
    chat.scrollToBottom();
  },

  onData(data: FlowNodeResult) {
    const item = last(chat.list);

    if (data.llmStream) {
      chat.loading = false;
    }

    if (item && data.content !== undefined) {
      item.content += data.content;
    }

    chat.scrollToBottom(false);
  },

  scrollToBottom(smooth = true) {
    nextTick(() => {
      refs['chat.scrollbar'].scrollTo({
        top: 99_999,
        behavior: smooth ? 'smooth' : 'auto',
      });
    });
  },
});

// 过程
const trace = reactive({
  list: [] as FlowNodeResult[],

  clear() {
    trace.list = [];
  },

  update() {
    trace.list = test.res.map((e) => {
      return {
        ...e,
        duration: Number.parseFloat(((e.duration || 1) / 1000).toFixed(3)),
        node: flow.findNode(e.nodeId!),
        input: JSON.stringify(e.inputParams, null, 4),
        output: JSON.stringify(e.result.result, null, 4),
      };
    });
  },

  expand(item: any) {
    item._expand = !item._expand;
    flow.setViewportByNode(item.node);
  },
});

onMounted(() => {
  mitt.on('flow.runOpen', open);
  mitt.on('flow.runCheck', test.checkNode);
});

onUnmounted(() => {
  mitt.off('flow.runOpen', open);
  mitt.off('flow.runCheck', test.checkNode);
});

defineExpose({
  open,
  close,
});
</script>

<template>
  <div v-if="visible" class="tools-panel-run">
    <!-- 标题 -->
    <div class="head">
      <span class="label">
        流程运行
        <span v-if="test.node">（{{ test.node?.label }}）</span>
      </span>

      <div class="btns">
        <cl-svg class="btn-icon is-bg" name="close" @click="close" />
      </div>
    </div>

    <!-- 内容 -->
    <div class="content">
      <el-tabs v-model="test.tab">
        <el-tab-pane :disabled="test.running" label="输入" name="input">
          <el-scrollbar>
            <div class="content-item is-input">
              <div
                v-for="(item, index) in inputParams"
                :key="index"
                class="row"
              >
                <el-radio
                  v-model="chat.contentId"
                  :label="item.field"
                  class="chat-id"
                  size="small"
                >
                  对话
                </el-radio>

                <el-text
                  :style="{
                    marginBottom: '10px',
                  }"
                  tag="p"
                >
                  {{ item.label }}
                  <span v-if="item.required" class="required">*</span>
                </el-text>

                <el-input
                  v-if="item.type == 'text' || item.type == 'string'"
                  v-model="form[item.field]"
                  clearable
                  placeholder="请输入"
                />

                <el-input-number
                  v-else-if="item.type == 'number'"
                  v-model="form[item.field]"
                  placeholder="请输入"
                />

                <cl-upload
                  v-else-if="item.type == 'image'"
                  v-model="form[item.field]"
                  clearable
                />
              </div>

              <div class="run">
                <el-button
                  :loading="test.running"
                  type="primary"
                  @click="test.run"
                >
                  开始运行
                </el-button>

                <el-button type="success" @click="chat.open">
                  对话框运行
                </el-button>
              </div>
            </div>
          </el-scrollbar>
        </el-tab-pane>

        <el-tab-pane label="对话" name="chat">
          <div class="content-item is-chat">
            <div class="container">
              <el-scrollbar :ref="setRefs('chat.scrollbar')">
                <div class="list">
                  <div
                    v-for="(item, index) in chat.list"
                    :key="index"
                    :class="[item.isMy ? 'is-right' : 'is-left']"
                    class="item"
                  >
                    <div class="inner">
                      <span v-if="item.content">
                        {{ item.content }}
                      </span>

                      <el-icon v-else class="is-loading">
                        <Loading />
                      </el-icon>
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </div>

            <div class="footer">
              <el-input
                :ref="setRefs('chat.input')"
                v-model="chat.content"
                placeholder="请输入要咨询的内容"
                @keydown.enter="chat.toSend()"
              >
                <template #suffix>
                  <el-button
                    :loading="chat.loading"
                    type="success"
                    @click="chat.toSend()"
                  >
                    发送
                  </el-button>
                </template>
              </el-input>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="日志" name="detail">
          <el-scrollbar>
            <div class="content-item is-detail">
              <div :class="[`is-${test.info.status}`]" class="info">
                <div class="top">
                  <div class="item">
                    <p>状态</p>
                    <p class="status">
                      {{ test.info.status }}
                    </p>
                  </div>

                  <div class="item">
                    <p>运行时间</p>
                    <p>{{ test.info.duration }}s</p>
                  </div>

                  <div class="item">
                    <p>消耗 token 数</p>
                    <p>{{ test.info.tokenUsage || 0 }} Tokens</p>
                  </div>
                </div>
              </div>

              <el-text
                :style="{
                  margin: '10px 0',
                }"
                tag="p"
              >
                参数
              </el-text>

              <div class="code">
                <p>输入</p>
                <p>{{ test.info.input || '-' }}</p>
              </div>

              <div class="code">
                <p>输出</p>
                <p>{{ test.info.output || '-' }}</p>
              </div>

              <div v-if="!isEmpty(trace.list)" class="list">
                <el-text
                  :style="{
                    margin: '10px 0',
                  }"
                  tag="p"
                >
                  节点
                </el-text>

                <div
                  v-for="(item, index) in trace.list"
                  :key="index"
                  :class="[item.result.success ? 'is-success' : 'is-fail']"
                  class="item"
                >
                  <div class="inner" @click="trace.expand(item)">
                    <ToolsIcon
                      :color="item.node?.color"
                      :name="item.node?.type"
                    />

                    <span class="label">{{ item.node?.label }}</span>

                    <span class="duration">耗时：{{ item.duration }}s</span>
                  </div>

                  <p v-if="!item.result.success" class="error">
                    {{ item.result.error.message }}
                  </p>

                  <div v-show="item._expand" class="desc">
                    <div class="code">
                      <p>输入</p>
                      <p>{{ item.input || '-' }}</p>
                    </div>

                    <div class="code">
                      <p>输出</p>
                      <p>{{ item.output || '-' }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </el-tab-pane>
      </el-tabs>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tools-panel-run {
  width: 400px;

  .head {
    display: flex;
    align-items: center;
    padding: 0 15px;
    height: 50px;

    .label {
      flex: 1;
      font-size: 14px;
      font-weight: bold;
      color: var(--el-text-color-regular);
    }

    .btns {
      display: flex;
      align-items: center;

      .btn-icon {
        margin-left: 6px;
      }
    }
  }

  .content {
    height: calc(100% - 50px);

    :deep(.el-tabs) {
      height: 100%;

      .el-tabs__header {
        margin-bottom: 0;
      }

      .el-tabs__content {
        height: calc(100% - 40px);
      }

      .el-tab-pane {
        height: 100%;
      }

      .el-tabs__item {
        padding: 0 15px;
      }

      .el-tabs__nav-wrap:after,
      .el-tabs__active-bar {
        height: 1px;
      }
    }

    &-item {
      padding: 15px;
      box-sizing: border-box;

      &.is-input {
        .run {
          display: flex;

          .el-button {
            flex: 1;
            height: 36px;
            border-radius: 6px;
          }
        }

        .row {
          margin-bottom: 15px;
          position: relative;

          .el-input-number {
            width: 100%;
          }

          .required {
            color: red;
          }

          .chat-id {
            display: flex;
            align-items: center;
            position: absolute;
            right: 0px;
            margin-right: 0;

            :deep(.el-radio__label) {
              position: relative;
              top: -1px;
            }
          }
        }
      }

      &.is-chat {
        height: 100%;
        padding: 0;

        .container {
          height: calc(100% - 70px);

          .list {
            padding: 20px;

            .item {
              display: flex;

              .inner {
                background-color: #f4f4f4;
                border-radius: 12px;
                padding: 15px;
                margin-bottom: 10px;
                font-size: 14px;
              }

              .t1 {
                margin: 0 0 10px 0;
              }

              &.is-left {
                .inner {
                  border-bottom-left-radius: 0;
                }
              }

              &.is-right {
                flex-direction: row-reverse;

                .inner {
                  border-bottom-right-radius: 0;
                  background-color: var(--el-color-primary);
                  color: #fff;
                }
              }
            }
          }
        }

        .footer {
          display: flex;
          align-items: center;
          height: 70px;
          padding: 0 20px;

          :deep(.el-input) {
            .el-input__wrapper {
              border-radius: 8px;
              height: 40px;
              padding: 0 6px 0 15px;
            }
          }

          :deep(.el-button) {
            border-radius: 6px;
          }
        }
      }

      &.is-detail {
        .info {
          border-radius: 10px;

          .top {
            display: flex;
            padding: 15px;

            .item {
              flex: 1;

              .status {
                text-transform: uppercase;

                &::before {
                  content: '';
                  display: inline-block;
                  height: 10px;
                  width: 10px;
                  border-radius: 10px;
                  margin-right: 5px;
                  background-color: currentColor;
                }
              }

              p {
                font-size: 12px;

                &:first-child {
                  color: var(--el-color-info);
                }

                &:last-child {
                  font-weight: bold;
                  margin-top: 8px;
                }
              }
            }
          }

          &.is-success {
            background-color: var(--el-color-success-light-9);

            .status {
              color: var(--el-color-success);
            }
          }

          &.is-fail {
            background-color: var(--el-color-danger-light-9);

            .status {
              color: var(--el-color-danger);
            }
          }

          &.is-running {
            background-color: var(--el-color-primary-light-9);

            .status {
              color: var(--el-color-primary);
            }
          }

          &.is-none {
            background-color: var(--el-color-info-light-9);

            .status {
              color: var(--el-color-info);
            }
          }
        }

        .list {
          .title {
            margin: 10px 0 10px 0;
            font-size: 14px;
          }

          .item {
            margin-bottom: 10px;
            border: 1px solid var(--el-border-color-lighter);
            border-radius: 10px;
            cursor: pointer;

            .inner {
              display: flex;
              align-items: center;
              line-height: 1;
              padding: 10px;

              .label {
                margin-left: 10px;
                flex: 1;
                font-size: 14px;
              }

              .duration {
                font-size: 12px;
                color: var(--el-color-info);
              }
            }

            .error {
              font-size: 12px;
              color: var(--el-color-danger);
              padding: 5px 10px 10px 10px;
            }

            .code {
              margin: 0 10px 10px 10px;
            }

            &.is-success {
              border-color: var(--el-color-success);
            }

            &.is-fail {
              border-color: var(--el-color-danger);
            }
          }
        }
      }

      .code {
        background-color: var(--el-fill-color-lighter);
        margin-top: 10px;
        border-radius: 10px;
        padding: 15px;
        font-size: 12px;

        p {
          &:first-child {
            margin-bottom: 10px;
            color: var(--el-color-info);
            line-height: 1;
          }

          &:nth-child(2) {
            white-space: pre-wrap;
            word-break: break-all;
          }
        }
      }
    }
  }
}
</style>
