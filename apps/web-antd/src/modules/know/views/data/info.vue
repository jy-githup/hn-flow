<script lang="ts" name="know-data-info" setup>
import { reactive } from 'vue';

import {
  setFocus,
  useCrud,
  useForm,
  useTable,
  useUpsert,
} from '@cool-vue/crud';
import { CloseBold } from '@element-plus/icons-vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { isEmpty } from 'lodash-es';

import { useCool } from '#/cool';

import SearchData from '../../components/search-data.vue';
import SearchTest from '../../components/search-test.vue';

const { service, route } = useCool();

// 选项
const options = reactive({
  from: [
    {
      label: '自定义文本',
      desc: '手动输入一段文本作为数据集',
      value: 0,
      type: 'info',
      icon: 'text',
    },
    {
      label: '本地文件',
      desc: '上传 PDF、TXT、DOCX、MD 等格式的文件',
      value: 1,
      type: 'success',
      icon: 'folder',
    },
    {
      label: '网页链接',
      desc: '读取静态网页内容作为数据集',
      value: 2,
      icon: 'search',
    },
  ],
  status: [
    { label: '准备中', value: 0 },
    { label: '已就绪', value: 1, type: 'success' },
  ],
});

// cl-table
const Table = useTable({
  columns: [
    { type: 'selection' },
    { label: '标题', prop: 'title', minWidth: 140 },
    {
      label: '内容',
      prop: 'content.data',
      minWidth: 200,
      showOverflowTooltip: true,
    },
    {
      label: '来源',
      prop: 'from',
      dict: options.from,
      minWidth: 120,
    },
    {
      label: '状态',
      prop: 'status',
      dict: options.status,
      minWidth: 120,
    },
    {
      label: '启用',
      prop: 'enable',
      minWidth: 100,
      component: { name: 'cl-switch' },
    },
    {
      label: '创建时间',
      prop: 'createTime',
      minWidth: 170,
      sortable: 'desc',
      component: { name: 'cl-date-text' },
    },
    {
      label: '更新时间',
      prop: 'updateTime',
      minWidth: 170,
      sortable: 'custom',
      component: { name: 'cl-date-text' },
    },
    { type: 'op', buttons: ['edit', 'delete'] },
  ],
});

// cl-upsert
const Upsert = useUpsert({
  items: [
    {
      prop: 'title',
      component: {
        name: 'el-input',
        props: {
          placeholder: '请输入标题',
        },
      },
      rules: {
        required: true,
        message: '标题不能为空',
      },
    },
    {
      prop: 'content.data',
      component: {
        name: 'el-input',
        props: {
          type: 'textarea',
          rows: 10,
          placeholder: '请输入内容',
        },
      },
      rules: {
        required: true,
        message: '内容不能为空',
      },
    },
  ],
});

// cl-crud
const Crud = useCrud(
  {
    service: service.know.data.info,
  },
  (app) => {
    app.refresh({
      typeId: route.query.id,
    });
  },
);

// 刷新
function refresh(params?: any) {
  Crud.value?.refresh(params);
}

// 重建
function rebuild() {
  ElMessageBox.confirm('确定要重建知识库吗？', '提示', {
    type: 'warning',
  }).then(() => {
    service.know.data.type
      .rebuild({
        typeId: route.query.id,
      })
      .then(() => {
        ElMessage.success('重建成功');
      })
      .catch((error) => {
        ElMessage.error(error.message);
      });
  });
}

// 添加内容
const AForm = useForm();
const BForm = useForm();

function preAdd() {
  AForm.value?.open({
    title: '添加内容',
    width: '500px',
    items: [
      {
        prop: 'from',
        component: {
          name: 'slot-from',
        },
        value: 0,
        required: true,
      },
    ],
    dialog: {
      controls: ['close'],
    },
    op: {
      saveButtonText: '下一步',
    },
    on: {
      submit(data, e1) {
        e1.done();

        BForm.value?.open(
          {
            title: '添加内容',
            props: {
              labelWidth: '60px',
            },
            form: {
              ...data,
            },
            on: {
              submit(data, { done, close }) {
                const fn = data.id ? 'update' : 'add';
                const typeId = route.query.id;

                let list: any[] = [];

                switch (data.from) {
                  case 0: {
                    list = [
                      {
                        ...data,
                        typeId,
                        content: {
                          data: data.content,
                        },
                      },
                    ];
                    break;
                  }

                  case 1:
                  case 2: {
                    list = data._content.map((e: string) => {
                      return {
                        ...data,
                        metadata: {
                          url: data._url,
                        },
                        typeId,
                        content: {
                          data: e,
                        },
                      };
                    });
                    break;
                  }
                }

                if (isEmpty(list)) {
                  done();
                  return ElMessage.error('内容不能为空');
                }

                service.know.data.info[fn](list)
                  .then(() => {
                    ElMessage.success('添加成功');
                    refresh();
                    close();
                    e1.close();
                  })
                  .catch((error) => {
                    done();
                    ElMessage.error(error.message);
                  });
              },
            },
            items: [
              {
                label: '启用',
                prop: 'enable',
                flex: false,
                component: { name: 'cl-switch' },
                required: true,
                value: 1,
              },
              {
                label: '标题',
                prop: 'title',
                component: {
                  name: 'el-input',
                  props: { clearable: true, maxlength: 50 },
                },
                required: true,
              },
              () => {
                return data.from == 0
                  ? {
                      label: '内容',
                      prop: 'content',
                      component: {
                        name: 'el-input',
                        props: {
                          type: 'textarea',
                          rows: 6,
                        },
                      },
                      required: true,
                    }
                  : null;
              },
              () => {
                return data.from == 1
                  ? {
                      label: '文件',
                      prop: '_files',
                      value: [],
                      component: {
                        name: 'slot-files',
                      },
                    }
                  : null;
              },
              () => {
                return data.from == 2
                  ? {
                      label: '链接',
                      prop: '_url',
                      component: { name: 'el-input' },
                      rules: {
                        required: true,
                        validator(rule, value, callback) {
                          if (!value) {
                            return callback(new Error('请输入链接'));
                          }

                          if (!/^(http|https):\/\//.test(value)) {
                            return callback(new Error('请输入正确的链接'));
                          }

                          callback();
                        },
                      },
                    }
                  : null;
              },
              {
                label: '内容',
                prop: '_content',
                value: [],
                component: {
                  vm: SearchData,
                },
                hidden({ scope }) {
                  return scope.from == 0;
                },
              },
            ],
          },
          [setFocus('title')],
        );
      },
    },
  });
}
</script>

<template>
  <cl-crud ref="Crud">
    <cl-view-head />

    <cl-row>
      <!-- 刷新按钮 -->
      <cl-refresh-btn />
      <!-- 新增按钮 -->
      <el-button type="primary" @click="preAdd">添加</el-button>
      <el-button type="success" @click="rebuild">重建</el-button>
      <!-- 删除按钮 -->
      <cl-multi-delete-btn />

      <cl-filter label="来源">
        <cl-select :options="options.from" prop="from" />
      </cl-filter>

      <cl-flex1 />

      <!-- 搜索测试 -->
      <SearchTest @edit="Crud?.rowEdit" />

      <!-- 关键字搜索 -->
      <cl-search-key placeholder="搜索标题、内容" />
    </cl-row>

    <cl-row>
      <!-- 数据表格 -->
      <cl-table ref="Table" />
    </cl-row>

    <cl-row>
      <cl-flex1 />
      <!-- 分页控件 -->
      <cl-pagination />
    </cl-row>

    <!-- 选择类型 -->
    <cl-form ref="AForm">
      <template #slot-from="{ scope }">
        <div class="slot-from">
          <div
            v-for="item in options.from"
            :key="item.value"
            :class="{
              active: scope.from == item.value,
            }"
            class="item"
            @click="
              () => {
                scope.from = item.value;
              }
            "
          >
            <cl-svg :name="item.icon" class="icon" />

            <p>{{ item.label }}</p>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </template>
    </cl-form>

    <!-- 设置数据 -->
    <cl-form ref="BForm">
      <template #slot-files="{ scope }">
        <div class="files">
          <div class="op">
            <cl-upload
              :auto-upload="false"
              :before-upload="
                (file: File) => {
                  scope._files.push(file);
                  return false;
                }
              "
              :size="[150, 300]"
              accept=".txt, .eml, .msg, .xml, .html, .md, .rst, .json, .rtf, .jpeg, .png, .doc, .docx, .ppt, .pptx, .pdf, .odt, .epub, .csv, .tsv, .xlsx, .gz"
              drag
              multiple
            />
          </div>

          <div v-if="!isEmpty(scope._files)" class="list">
            <div
              v-for="(item, index) in scope._files"
              :key="index"
              class="item"
            >
              <el-text size="small" truncated>{{ item.name }}</el-text>

              <el-icon
                class="del"
                @click="
                  () => {
                    scope._files.splice(index, 1);
                  }
                "
              >
                <CloseBold />
              </el-icon>
            </div>
          </div>
        </div>
      </template>
    </cl-form>

    <!-- 编辑 -->
    <cl-upsert ref="Upsert" />
  </cl-crud>
</template>

<style lang="scss" scoped>
.cl-crud {
  :deep(.el-popper) {
    max-width: 40%;
  }
}

.files {
  .op {
    display: flex;
  }

  .list {
    border: 1px solid var(--el-border-color);
    margin-top: 10px;
    padding: 10px;
    line-height: normal;
    border-radius: 5px;

    .item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      cursor: pointer;
      margin-bottom: 10px;

      .del {
        margin-left: 10px;
        color: var(--el-color-info);

        &:hover {
          color: red;
        }
      }

      &:last-child {
        margin-bottom: 0;
      }
    }
  }
}

.slot-from {
  .item {
    border: 1px solid var(--el-border-color);
    margin-bottom: 10px;
    padding: 10px;
    line-height: normal;
    border-radius: 6px;
    cursor: pointer;
    padding-left: 40px;
    position: relative;

    .icon {
      position: absolute;
      left: 10px;
      font-size: 20px;
    }

    p {
      &:nth-child(2) {
        font-size: 14px;
        margin-bottom: 5px;
      }

      &:last-child {
        font-size: 12px;
        color: var(--el-color-info);
      }
    }

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    &.active {
      border-color: var(--el-color-primary);
    }
  }
}
</style>
