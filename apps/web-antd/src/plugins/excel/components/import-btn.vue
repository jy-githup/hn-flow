<script lang="ts" setup name="cl-import-btn">
import { computed, type PropType, reactive } from 'vue';

import { useForm } from '@cool-vue/crud';
import chardet from 'chardet';
import * as XLSX from 'xlsx';

import { extname } from '#/cool/utils';

// Import Ant Design Vue components
import { Button, Input, message, Pagination, Table } from 'ant-design-vue';

const props = defineProps({
  // eslint-disable-next-line vue/require-default-prop
  onConfig: Function,
  // eslint-disable-next-line vue/require-default-prop
  onSubmit: Function,
  template: {
    type: String,
    default: '',
  },
  tips: {
    type: String,
    default: '请按照模版填写信息',
  },
  limitSize: {
    type: Number,
    default: 10,
  },
  type: {
    type: String as PropType<
      'danger' | 'default' | 'info' | 'primary' | 'success' | 'text' | 'warning'
    >,
    default: 'success',
  },
  // eslint-disable-next-line vue/require-default-prop
  icon: String,
  disabled: Boolean,
  accept: {
    type: String,
    default:
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel,text/csv',
  },
});

const emit = defineEmits(['change']);

const Form = useForm();

// 上传信息
const upload = reactive({
  filename: '',
  file: null as File | null,
  list: [] as any[],
});

// 分页信息
const pagination = reactive({
  size: 20,
  page: 1,
  onCurrentChange(page: number) {
    pagination.page = page;
  },
});

// 数据表格
const table = reactive({
  // 表头
  header: [] as string[],

  // 选中列表
  selection: [] as any[],

  // 删除行
  del(index?: number) {
    if (index === undefined) {
      upload.list = upload.list.filter((a) => {
        return !table.selection.includes(a._index);
      });
    } else {
      upload.list.splice(index, 1);
    }
  },

  // 序号
  onIndex(index: number) {
    return index + 1 + (pagination.page - 1) * pagination.size;
  },

  // 选中
  onSelectionChange(arr: any[]) {
    table.selection = arr.map((e) => e._index);
  },
});

// 数据列表
const list = computed(() => {
  return upload.list.filter((_, i) => {
    return (
      i >= (pagination.page - 1) * pagination.size &&
      i < pagination.page * pagination.size
    );
  });
});

// 清空
function clear() {
  upload.filename = '';
  upload.file = null;
  upload.list = [];
  table.header = [];
  table.selection = [];
}

// 打开
function open() {
  clear();

  Form.value?.open({
    title: '导入',
    width: computed(() => (upload.filename ? '80%' : '800px')),
    dialog: {
      'close-on-press-escape': false,
    },
    items: [
      ...(props.onConfig ? props.onConfig(Form) : []),
      {
        prop: 'file',
        component: {
          name: 'slot-upload',
        },
      },
      {
        component: {
          name: 'slot-list',
        },
      },
    ],
    op: {
      saveButtonText: '提交',
    },
    on: {
      submit(_, { done, close }) {
        if (!upload.filename) {
          done();
          return message.error('请选择文件');
        }

        if (props.onSubmit) {
          props.onSubmit(upload, { done, close });
        } else {
          message.error('<cl-import-btn /> 未配置 onSubmit 参数');
          done();
        }
      },
    },
  });
}

// 上传
function onUpload(raw: File, _: any, { next }: any) {
  const reader = new FileReader();
  const ext = extname(raw.name);

  reader.addEventListener('load', (event: any) => {
    let data = '';

    if (ext === 'csv') {
      const detected: any = chardet.detect(new Uint8Array(event.target.result));
      const decoder = new TextDecoder(detected);
      data = decoder.decode(event.target.result);
    } else {
      data = event.target.result;
    }

    const workbook = XLSX.read(data, { type: 'binary', raw: ext === 'csv' });

    let json: any[] = [];
    for (const sheet in workbook.Sheets) {
      if (Object.prototype.hasOwnProperty.call(workbook.Sheets, sheet)) {
        json = [...json, ...XLSX.utils.sheet_to_json(workbook.Sheets[sheet])];
      }
    }

    upload.list = json.map((e, i) => {
      return {
        ...e,
        _index: i,
      };
    });
    upload.filename = raw.name;
    upload.file = raw;

    const sheet = workbook.Sheets[Object.keys(workbook.Sheets)[0]];

    for (const i in sheet) {
      if (i[0] === '!') continue;

      const row = i.match(/\d+/)?.[0];

      if (row === '1') {
        table.header.push(sheet[i].v);
      }
    }

    emit('change', json);
  });

  if (ext === 'csv') {
    // eslint-disable-next-line unicorn/prefer-blob-reading-methods
    reader.readAsArrayBuffer(raw);
  } else {
    reader.readAsBinaryString(raw);
  }

  next();

  return false;
}

// 下载模版
function download() {
  const link = document.createElement('a');
  link.setAttribute('href', props.template);
  link.setAttribute('download', '');
  link.click();
}

defineExpose({
  open,
  clear,
  Form,
});
</script>

<template>
  <Button :disabled="disabled" :icon="icon" :type="type" @click="open">
    导入
  </Button>

  <cl-form ref="Form">
    <template #slot-upload>
      <div v-if="!upload.filename" class="upload">
        <div class="tips">
          <span>{{ tips }}</span>
          <Button bg text type="primary" @click="download"> 下载模版 </Button>
        </div>

        <div class="inner">
          <cl-upload
            :accept="accept"
            :auto-upload="false"
            :before-upload="onUpload"
            :disabled="disabled"
            :limit-size="limitSize"
            :size="[220, '100%']"
            drag
          />
        </div>
      </div>
    </template>

    <template #slot-list>
      <div v-if="list.length > 0" class="data-table">
        <div class="head">
          <Button type="success" @click="clear">重新上传</Button>
          <Button
            :disabled="table.selection.length === 0"
            type="danger"
            @click="table.del()"
          >
            批量删除
          </Button>
        </div>

        <div class="cl-table">
          <Table
            :data-source="list"
            :pagination="false"
            row-key="_index"
            @row-click="
              (record) => {
                record._edit = true;
              }
            "
            @selection-change="table.onSelectionChange"
          >
            <Table.Column type="selection" width="60px" />
            <Table.Column :index="table.onIndex" title="序号" width="80px" />
            <Table.Column
              v-for="item in table.header"
              :key="item"
              :data-index="item"
              :title="item"
              align="center"
              min-width="160px"
            >
              <template #default="text, record">
                <span v-if="!record._edit">{{ text }}</span>
                <Input
                  v-else
                  v-model="record[item]"
                  :placeholder="item"
                  clearable
                  type="textarea"
                />
              </template>
            </Table.Column>
            <Table.Column title="操作" width="100px">
              <template #default="text, record, index">
                <Button type="link" @click.stop="table.del(index)">删除</Button>
              </template>
            </Table.Column>
          </Table>
        </div>

        <div class="pagination">
          <Pagination
            v-model:current="pagination.page"
            :page-size="pagination.size"
            :total="upload.list.length"
            show-quick-jumper
            show-total
            @change="pagination.onCurrentChange"
          />
        </div>
      </div>
    </template>
  </cl-form>
</template>

<style lang="scss" scoped>
.upload {
  display: flex;
  flex-direction: column;

  .inner {
    width: 100%;

    :deep(.cl-upload) {
      .cl-upload__footer,
      .cl-upload__list,
      .el-upload,
      .is-drag {
        width: 100% !important;
      }
    }
  }
}

.tips {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  & > span {
    color: var(--el-color-warning);
  }
}

.data-table {
  .head {
    margin-bottom: 10px;
  }

  .pagination {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }
}
</style>
