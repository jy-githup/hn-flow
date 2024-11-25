<script lang="ts" name="cl-chat" setup>
import { nextTick, provide, ref } from 'vue';

import { ArrowLeft, Notebook } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { debounce } from 'lodash-es';

import { useBrowser } from '#/cool';
import { useBase } from '#/modules/base';
// import io from "socket.io-client";
import { Socket } from 'socket.io-client';

import { useStore } from '../store';
import { Chat } from '../types';
import ChatMessage from './message.vue';
import ChatSession from './session.vue';

// const { mitt } = useCool();
const { browser, onScreenChange } = useBrowser();

// 缓存
const { session, message } = useStore();

// 缓存
const { user } = useBase();

// 模块配置
// const { options } = module.get("chat");

// 是否可见
const visible = ref(false);

// 是否展开
const isExpand = ref(true);

// 未读消息
const unCount = ref(Number.parseInt(String(Math.random() * 100)));

// Socket
let socket: Socket;

// 连接
function connect() {
  refresh();

  // if (!socket) {
  // 	socket = io(config.host + options.path, {
  // 		auth: {
  // 			token: user.token
  // 		}
  // 	});

  // 	socket.on("connect", () => {
  // 		console.log(`connect ${user.info?.nickName}`);

  // 		// 监听消息
  // 		socket.on("message", (msg) => {
  // 			console.log(msg);
  // 			mitt("chat-message", msg);
  // 		});

  // 		refresh();
  // 	});

  // 	socket.on("disconnect", (err) => {
  // 		console.error(err);
  // 	});
  // }
}

// 打开
function open() {
  visible.value = true;
  connect();
}

// 关闭
function close() {
  visible.value = false;
}

// 收起、展开
function expand(value?: boolean) {
  isExpand.value = value === undefined ? !isExpand.value : value;
}

// 发送消息
function send(data: Chat.Message, isAppend?: boolean) {
  // socket.emit("message", {});

  if (isAppend) {
    append(data);
  }
}

// 滚动到底部
const scrollToBottom = debounce(() => {
  nextTick(() => {
    const box = document.querySelector('.cl-chat .chat-message .list');
    box?.scroll({
      top: 100_000 + Math.random(),
      behavior: 'smooth',
    });
  });
}, 300);

// 追加消息
function append(data: Chat.Message) {
  message.list.push({
    fromId: user.info?.id,
    toId: session.value?.userId,
    avatar: user.info?.headImg,
    nickName: user.info?.nickName,
    createTime: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    ...data,
  });

  scrollToBottom();
}

// 刷新
async function refresh() {
  await session.get();
  await message.get();
  scrollToBottom();
}

provide('chat', {
  get socket() {
    return socket;
  },
  send,
  append,
  expand,
  scrollToBottom,
});

// 监听屏幕变化
onScreenChange(() => {
  isExpand.value = !browser.isMini;
});

defineExpose({
  open,
  close,
});
</script>

<template>
  <div class="cl-chat__wrap">
    <el-badge :hidden="!unCount" :value="unCount">
      <div class="cl-chat__icon" @click="open">
        <cl-svg :size="16" name="icon-notice" />
      </div>
    </el-badge>

    <!-- 弹框 -->
    <cl-dialog
      v-model="visible"
      :close-on-click-modal="false"
      :controls="['slot-expand', 'cl-flex1', 'fullscreen', 'close']"
      :scrollbar="false"
      close-on-press-escape
      height="70vh"
      keep-alive
      padding="0"
      title="聊天窗口"
      width="1200px"
    >
      <div
        :class="{
          'is-mini': browser.isMini,
          'is-expand': isExpand,
        }"
        class="cl-chat"
      >
        <div class="cl-chat__session">
          <ChatSession />
        </div>

        <div class="cl-chat__right">
          <ChatMessage />
        </div>
      </div>

      <!-- 展开按钮 -->
      <template #slot-expand>
        <button class="cl-dialog__controls-icon">
          <el-icon v-if="!isExpand" @click="isExpand = true">
            <Notebook />
          </el-icon>
          <el-icon v-else @click="isExpand = false">
            <ArrowLeft />
          </el-icon>
        </button>
      </template>
    </cl-dialog>
  </div>
</template>

<style lang="scss">
.cl-chat {
  display: flex;
  justify-content: flex-end;
  background-color: #eee;
  padding: 5px;
  box-sizing: border-box;
  position: relative;
  color: #000;
  height: 100%;

  &__icon {
    padding: 0 5px;
    text-align: center;

    &:hover {
      color: var(--color-primary);
    }
  }

  &__footer {
    padding: 9px 0;
  }

  &__session {
    height: calc(100% - 10px);
    width: 345px;
    position: absolute;
    left: 5px;
    top: 5px;
  }

  &__right {
    position: relative;
    z-index: 99;
    transition: width 0.3s;
    width: 100%;
  }

  &.is-mini {
    &.is-expand {
      .cl-chat__session {
        z-index: 100;
      }
    }

    .cl-chat__session {
      width: calc(100% - 10px);
    }

    .cl-chat__right {
      width: 100% !important;
    }
  }

  &.is-expand {
    .cl-chat__right {
      width: calc(100% - 350px);
    }
  }
}
</style>
