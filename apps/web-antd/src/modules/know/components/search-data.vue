<script setup lang="ts" name="search-data">
import { PropType, ref, useModel } from 'vue';

import { Delete } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { isEmpty } from 'lodash-es';

import { useCool } from '#/cool';

const props = defineProps({
  modelValue: {
    type: Array as PropType<string[]>,
    default: () => [],
  },
  scope: {
    type: Object,
    default: () => ({}),
  },
});

const { service } = useCool();

const list = useModel(props, 'modelValue');

// 检索中
const loading = ref(false);

// 检索
async function check() {
  const fd = new FormData();

  const { _files, _url, from } = props.scope;

  if (from == 1) {
    if (isEmpty(_files)) {
      return ElMessage.error('请先上传文件');
    }

    (_files as File[]).forEach((e, i) => {
      fd.append(`files${i}`, e);
    });

    loading.value = true;

    await service.know.loader
      .request({
        url: '/file',
        data: fd,
        method: 'POST',
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })
      .then((res: any[][]) => {
        list.value = res.flatMap((e) => {
          return e.map((e) => e.pageContent);
        });
      });
  }

  if (from == 2) {
    if (!_url) {
      return ElMessage.error('请先输入链接');
    }

    loading.value = true;

    await service.know.loader
      .link({
        link: _url,
      })
      .then((res: any[]) => {
        list.value = res.map((e) => e.pageContent);
      });
  }

  loading.value = false;
}

// 清空
function clear() {
  list.value = [];
}

defineExpose({
  check,
});
</script>

<template>
  <div class="search-data">
    <div class="op">
      <el-button :loading="loading" type="success" @click="check()">
        检索
      </el-button>
      <el-button @click="clear()"> 清空 </el-button>
    </div>

    <div class="list">
      <div v-for="(item, index) in list" :key="index" class="item">
        <template v-if="scope.from == 1">
          <el-input v-model="list[index]" clearable />

          <el-icon
            @click="
              () => {
                list.splice(index, 1);
              }
            "
          >
            <Delete />
          </el-icon>
        </template>

        <el-input
          v-else
          v-model="list[index]"
          :rows="10"
          clearable
          type="textarea"
        />
      </div>
    </div>

    <div v-if="isEmpty(list)" class="empty">暂无数据</div>
  </div>
</template>

<style lang="scss" scoped>
.search-data {
  .op {
    margin-bottom: 10px;
  }

  .list {
    .item {
      display: flex;
      align-items: center;
      line-height: normal;
      margin-top: 5px;

      .el-icon {
        margin-left: 10px;
        cursor: pointer;

        &:hover {
          color: red;
        }
      }
    }
  }

  .empty {
    padding: 20px;
    text-align: center;
    color: var(--el-color-info);
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
  }
}
</style>
