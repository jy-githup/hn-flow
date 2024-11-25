<script setup lang="ts" name="tools-head">
import { reactive } from 'vue';

import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';

import { useCool } from '#/cool';
import { useFlow } from '#/hooks/hooks/userFlow';
import { formatTime } from '#/modules/flow/utils';

import NodeConfig from './node-config.vue';

const { mitt, refs, setRefs, service } = useCool();
const flow = useFlow();

function run() {
  mitt.emit('flow.runOpen');
  mitt.emit('flow.closeForm');
}

async function save() {
  mitt.emit('flow.closeForm');
  await flow.save();
  ElMessage.success('数据保存成功');
}

const publish = reactive({
  loading: false,
  tips: '-',

  onShow() {
    const { releaseTime } = flow?.info || {};

    publish.tips = releaseTime
      ? `上次发布于${formatTime(releaseTime)}`
      : '当前未发布';
  },

  next() {
    refs.publishPopover?.hide();

    mitt.emit('flow.runCheck', async (status: boolean) => {
      if (status) {
        ElMessage.success('检测通过，发布中');

        publish.loading = true;

        // 保存草稿
        await flow.save();

        // 发布
        await service.flow?.info
          .release({
            flowId: flow.info?.id,
          })
          .then(() => {
            ElMessage.success('发布成功');
            flow.get();
          })
          .catch((error) => {
            ElMessage.error(error.message);
          });

        publish.loading = false;
      }
    });
  },
});

// 导出
function exportFlow() {
  ElMessageBox.confirm('是否要导出当前流程？', '提示', {
    type: 'success',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  }).then(() => {
    flow.exportFlow();
  });
}
</script>

<template>
  <div class="tools-head">
    <div class="info">
      <p class="title">{{ flow.info?.name }}</p>
      <p class="desc">
        保存于 {{ dayjs(flow.info?.updateTime).format('MM-DD HH:mm:ss') }}
      </p>
    </div>

    <div class="op">
      <div class="item" @click="save()">
        <el-tooltip content="保存" placement="top">
          <cl-svg name="save2" />
        </el-tooltip>
      </div>

      <div class="item" @click="run()">
        <el-tooltip content="运行" placement="top">
          <cl-svg name="run2" />
        </el-tooltip>
      </div>

      <el-popover
        :ref="setRefs('publishPopover')"
        :offset="5"
        :teleported="false"
        placement="bottom"
        popper-class="cl-flow__popper"
        trigger="click"
        width="240px"
        @show="publish.onShow"
      >
        <template #reference>
          <div class="item">
            <el-tooltip content="发布" placement="top">
              <cl-svg name="publish" />
            </el-tooltip>
          </div>
        </template>

        <div class="publish">
          <el-text size="small" tag="p">{{ publish.tips }}</el-text>

          <div class="btn">
            <el-button class="a" type="primary" @click="publish.next">
              发布
            </el-button>
          </div>
        </div>
      </el-popover>

      <div class="item" @click="refs.nodeConfig?.open()">
        <el-tooltip content="配置" placement="top">
          <cl-svg name="set" />
        </el-tooltip>
      </div>

      <div class="item" @click="exportFlow()">
        <el-tooltip content="导出" placement="top">
          <cl-svg name="export" />
        </el-tooltip>
      </div>
    </div>

    <NodeConfig :ref="setRefs('nodeConfig')" />
  </div>
</template>

<style lang="scss" scoped>
.tools-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: absolute;
  left: 0;
  top: 0;
  height: 50px;
  width: 100%;
  padding: 0 10px;
  z-index: 10;
  user-select: none;
  box-sizing: border-box;
  pointer-events: none;

  .info {
    pointer-events: all;

    .title {
      font-size: 14px;
    }

    .desc {
      color: var(--el-text-color-regular);
      font-size: 10px;
    }
  }

  .op {
    display: flex;
    pointer-events: all;

    .item {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 36px;
      width: 36px;
      border-radius: 8px;
      background-color: var(--el-bg-color);
      margin-left: 10px;
      cursor: pointer;

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
