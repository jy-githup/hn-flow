<script setup lang="ts" name="flowHeader">
import { reactive } from 'vue';

import {
  SvgFlowRunIcon,
  SvgFlowExportIcon,
  SvgFlowPublishIcon,
  RiSaveLine,
  SvgFLowSetIcon,
  SvgFlowSave2Icon,
} from '@vben/icons';

import dayjs from 'dayjs';
import { ElMessage, ElMessageBox } from 'element-plus';

import NodeConfig from '#/components/tools/node-config.vue';
import { useCool } from '#/hooks/hooks/index';
import { useFlow } from '#/hooks/hooks/userFlow';

const { mitt, refs, setRefs, service } = useCool();
const flow = useFlow();

const save = async () => {
  ElMessage.success('数据保存成功');
  mitt.emit('flow.closeForm');
  await flow.save();
};
const run = () => {
  mitt.emit('flow.runOpen');
  mitt.emit('flow.closeForm');
};
const exportFlow = () => {
  ElMessageBox.confirm('是否要导出当前流程？', '提示', {
    type: 'success',
    confirmButtonText: '确认',
    cancelButtonText: '取消',
  }).then(() => {
    flow.exportFlow();
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
    refs.publishPopover?.hide();

    mitt.emit('flow.runCheck', async (status: boolean) => {
      if (status) {
        ElMessage.success('检测通过，发布中');

        publish.loading = true;

        // 保存草稿
        await flow.save();

        // 调用发布接口

        ElMessage.success('发布成功');
        await flow.get();
        publish.loading = false;
        // await service.flow.info
        //   .release({
        //     flowId: flow.info?.id,
        //   })
        //   .then(() => {
        //     ElMessage.success('发布成功');
        //     flow.get();
        //   })
        //   .catch((error) => {
        //     ElMessage.error(error.message);
        //   });

        publish.loading = false;
      }
    });
  },
});
</script>

<template>
  <div class="tools-head">
    <div class="info">
      <p class="title">{{ flow.info?.name || '测试字段' }}</p>
      <p class="desc">
        保存于 {{ dayjs(flow.info?.updateTime).format('MM-DD HH:mm:ss') }}
      </p>
    </div>
    <div class="op">
      <div class="item" @click="save()">
        <el-tooltip content="保存" placement="top">
          <SvgFlowSave2Icon class="size-5" />
        </el-tooltip>
      </div>
      <div class="item" @click="run()">
        <el-tooltip content="运行" placement="top">
          <SvgFlowRunIcon class="size-5" />
        </el-tooltip>
      </div>
      <el-popover title="Title" trigger="click">
        <template #reference>
          <div class="item">
            <el-tooltip content="发布" placement="top">
              <SvgFlowPublishIcon class="size-5" />
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
      <!--      @click="refs.nodeConfig?.open()"-->
      <div class="item">
        <el-tooltip content="配置" placement="top">
          <SvgFLowSetIcon class="size-5" @click="refs.nodeConfig?.open()" />
        </el-tooltip>
      </div>
      <div class="item" @click="exportFlow()">
        <el-tooltip content="导出" placement="top">
          <SvgFlowExportIcon class="size-5" />
        </el-tooltip>
      </div>
    </div>

    <NodeConfig :ref="setRefs('nodeConfig')" />
  </div>
</template>

<style scoped lang="scss">
.tools-head {
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

      .iconify {
        font-size: 22px;
        color: var(--el-color-info);
        outline: none;
      }

      &:hover {
        background-color: var(--el-fill-color-lighter);

        .iconify {
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
