<script setup lang="ts" name="flowHeader">
import { reactive } from 'vue';

import { Button, message, Modal, Popover, Tag, Tooltip } from 'ant-design-vue';
import dayjs from 'dayjs';

// import { useCool } from '#/hooks/hooks/index.ts';

const flow: any = {};

const save = () => {
  message.success('数据保存成功');
};
const run = () => {};
const exportFlow = () => {
  Modal.confirm({
    title: '提示',
    content: '是否要导出当前流程？',
    okText: '确认',
    cancelText: '取消',
    onOk() {
      // flow.exportFlow();
    },
  });
};

// const { refs } = useCool();

const publish = reactive({
  loading: false,
  tips: '-',

  onShow() {
    const { releaseTime } = flow?.info || {};

    // publish.tips = releaseTime
    //   ? `上次发布于${formatTime(releaseTime)}`
    //   : '当前未发布';
    publish.tips = releaseTime ? `上次发布于2024-01-01` : '当前未发布';
  },

  next() {
    // refs?.publishPopover?.hide();
  },
});
</script>

<template>
  <div class="flowHeaderBox">
    <div class="info">
      <p class="title">{{ flow.info?.name || '测试字段' }}</p>
      <p class="desc">
        保存于 {{ dayjs(flow.info?.updateTime).format('MM-DD HH:mm:ss') }}
      </p>
    </div>
    <div class="op">
      <div class="item" @click="save()">
        <Tooltip placement="top" title="保存"> save </Tooltip>
      </div>
      <div class="item" @click="run()">
        <Tooltip content="运行" placement="top"> 运行 </Tooltip>
      </div>
      <Popover title="Title" trigger="click">
        <template #content>
          <div class="publish">
            <Tag size="small" tag="p">{{ publish.tips }}</Tag>

            <div class="btn">
              <Button class="a" type="primary" @click="publish.next">
                发布
              </Button>
            </div>
          </div>
        </template>
        <div class="item">
          <Tooltip content="发布" placement="top">
            <!--              <cl-svg name="publish" />-->
            发布
          </Tooltip>
        </div>
      </Popover>
      <!--      @click="refs.nodeConfig?.open()"-->
      <div class="item">
        <Tooltip placement="top" title="配置">
          <!--          <cl-svg name="set" />-->
          配置
        </Tooltip>
      </div>
      <div class="item" @click="exportFlow()">
        <Tooltip placement="top" title="导出">
          <!--          <cl-svg name="export" />-->
          导出
        </Tooltip>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.flowHeaderBox {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 50px;
  padding: 0 10px;
  pointer-events: none;
  user-select: none;

  .info {
    pointer-events: all;

    .title {
      font-size: 14px;
    }

    .desc {
      font-size: 10px;
      color: var(--el-text-color-regular);
    }
  }

  .op {
    display: flex;
    pointer-events: all;

    .item {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      margin-left: 10px;
      cursor: pointer;
      background-color: var(--el-bg-color);
      border-radius: 8px;

      .cl-svg {
        font-size: 22px;
        color: var(--el-color-info);
        outline: none;
      }

      &:hover {
        background-color: var(--el-fill-color-lighter);

        .cl-svg {
          color: var(--el-text-color-primary);
        }
      }
    }
  }

  .publish {
    padding: 5px;

    .btn {
      display: flex;
      margin-top: 10px;

      .a {
        flex: 1;
      }
    }
  }
}
</style>
