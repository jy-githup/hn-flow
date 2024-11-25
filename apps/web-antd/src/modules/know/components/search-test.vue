<script setup lang="ts" name="search-test">
import { reactive, ref } from 'vue';

import {
  ChatLineSquare,
  Clock,
  Edit,
  QuestionFilled,
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import { ElMessage } from 'element-plus';

import { storage, useCool } from '#/cool';
import { useViewGroup } from '#/plugins/view';

import { formatTime } from '/$/know/utils';

const emit = defineEmits(['edit']);

const { service, route } = useCool();
const { ViewGroup } = useViewGroup({
  leftWidth: '400px',
  custom: true,
});

const visible = ref(false);
const loading = ref(false);

// 检索后的数据
const list = ref<{ content: string; title: string }[]>([]);

// 测试文本
const content = ref('');

// 打开
function open() {
  visible.value = true;
  list.value = [];
}

// 关闭
function close() {
  visible.value = false;
}

// 编辑
function toEdit(item: Eps.AiDataInfoEntity) {
  emit('edit', item.data);
}

// 测试
async function toTest() {
  if (!content.value) {
    return ElMessage.info('请输入需要测试的文本');
  }

  loading.value = true;

  await service.know.retriever
    .invoke({
      knowId: route.query.id,
      text: content.value,
      options: {
        size: 10,
      },
    })
    .then((res) => {
      history.add();
      content.value = '';

      list.value = res.map((e) => {
        const { metadata, pageContent } = e[0];

        return {
          title: metadata.title,
          content: pageContent,
          data: metadata,
          score: e[1].toFixed(6),
        };
      });
    })
    .catch((error) => {
      ElMessage.error(error.message);
    });

  loading.value = false;
}

// 历史记录
const history = reactive({
  list: storage.get(`know.searchTestHistory${route.query.id}`) || [],

  limit: 20,

  add() {
    history.list.unshift({
      content: content.value,
      date: dayjs().format('YYYY-MM-DD HH:mm:ss'),
    });
    if (history.list.length > this.limit) {
      history.list.pop();
    }
    history.update();
  },

  remove(index: number) {
    history.list.splice(index, 1);
    history.update();
  },

  update() {
    storage.set(`know.searchTestHistory${route.query.id}`, history.list);
  },

  check(val: string) {
    content.value = val;
  },
});
</script>

<template>
  <el-button type="warning" @click="open">搜索测试</el-button>

  <cl-dialog
    v-model="visible"
    :scrollbar="false"
    height="70vh"
    padding="0"
    title="搜索测试"
    width="1200px"
  >
    <div class="test-panel">
      <cl-view-group ref="ViewGroup">
        <template #left>
          <div class="left">
            <div class="content">
              <el-input
                v-model="content"
                :rows="8"
                placeholder="输入需要测试的文本"
                type="textarea"
              />
              <el-button :loading="loading" type="primary" @click="toTest">
                测试
              </el-button>
            </div>

            <div class="history">
              <p class="title">
                <el-icon>
                  <Clock />
                </el-icon>
                <span>测试历史</span>
              </p>

              <div class="list">
                <el-scrollbar>
                  <div
                    v-for="item in history.list"
                    :key="item"
                    class="item"
                    @click="history.check(item.content)"
                  >
                    <span>{{ item.content }}</span>
                    <span>{{ formatTime(item.date) }}</span>
                  </div>

                  <el-empty v-if="history.list.length === 0" :image-size="80" />
                </el-scrollbar>
              </div>
            </div>
          </div>
        </template>

        <template #title>
          <div class="title">
            <span>测试结果</span>

            <el-tooltip>
              <el-icon>
                <QuestionFilled />
              </el-icon>

              <template #content>
                <div :style="{ width: '250px' }">
                  根据知识库内容与测试文本的相似度进行排序，你可以根据测试结果调整对应的文本注意:测试记录中的数据可能已经被修改过，点击某条测试数据后将展示最新的数据。
                </div>
              </template>
            </el-tooltip>
          </div>
        </template>

        <template #right>
          <el-scrollbar>
            <div class="right">
              <div v-for="(item, index) in list" :key="index" class="card">
                <div class="head">
                  <el-tag disable-transitions>
                    <span>#{{ index + 1 }} | </span>
                    <span>语义检索 </span>
                    <span> | {{ item.score || 0 }}</span>
                  </el-tag>

                  <span>{{ item?.title }}</span>
                </div>

                <div class="content" v-html="item.content! || '-'"></div>

                <el-icon class="edit" @click="toEdit(item)">
                  <Edit />
                </el-icon>

                <div class="bottom">
                  <div class="len">
                    <el-icon>
                      <ChatLineSquare />
                    </el-icon>

                    <span>{{ item.content?.length }}</span>
                  </div>
                </div>
              </div>

              <el-empty v-if="list.length === 0" :image-size="80" />
            </div>
          </el-scrollbar>
        </template>
      </cl-view-group>
    </div>
  </cl-dialog>
</template>

<style lang="scss" scoped>
.test-panel {
  display: flex;
  height: 100%;

  .title {
    display: flex;
    align-items: center;
    height: 40px;
    font-size: 14px;

    span {
      line-height: 1;
      margin: 0 5px;
    }
  }

  .left {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 10px;
    box-sizing: border-box;

    .content {
      position: relative;

      .el-button {
        position: absolute;
        right: 10px;
        bottom: 10px;
      }
    }

    .history {
      flex: 1;
      overflow: hidden;

      .list {
        height: calc(100% - 40px);
        .item {
          display: flex;
          align-items: center;
          background-color: var(--el-fill-color-lighter);
          height: 40px;
          padding: 0 10px;
          border-radius: 4px;
          margin-bottom: 10px;
          cursor: pointer;

          span {
            font-size: 12px;

            &:first-child {
              margin-right: 10px;
              flex: 1;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }

          &:hover {
            background-color: var(--el-fill-color-light);
          }
        }
      }
    }
  }

  .right {
    flex: 1;
    padding: 0 15px;

    .card {
      background-color: var(--el-fill-color-lighter);
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 10px;
      font-size: 12px;
      cursor: pointer;
      position: relative;

      &:hover {
        background-color: var(--el-fill-color-light);
      }

      .head {
        display: flex;
        align-items: center;

        .el-tag {
          margin-right: 10px;
        }
      }

      .content {
        padding: 10px 0;
        font-size: 14px;
        background-color: var(--el-bg-color);
        padding: 10px;
        margin: 10px 0;
        border-radius: 6px;
      }

      .edit {
        position: absolute;
        right: 10px;
        top: 10px;
        font-size: 14px;

        &:hover {
          color: var(--el-color-primary);
        }
      }

      .bottom {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        padding: 0 5px;

        .len {
          display: flex;
          align-items: center;

          .el-icon {
            margin-right: 5px;
            font-size: 14px;
          }
        }
      }
    }
  }
}
</style>
