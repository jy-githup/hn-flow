<script setup lang="ts"></script>

<template>
  <div class="tools-head">
    <div class="info">
      <p class="title">节点名称</p>
      <p class="desc">保存于 2022-04-01</p>
    </div>
    <div class="op">
      <!--       @click="save()" -->
      <div class="item">
        <el-tooltip content="保存" placement="top">
          <my-svg name="save2" />
        </el-tooltip>
      </div>
      <!--      @click="run()"-->
      <div class="item">
        <el-tooltip content="运行" placement="top">
          <my-svg name="run2" />
        </el-tooltip>
      </div>
    </div>
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
