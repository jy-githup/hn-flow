<script setup lang="ts" name="node-flow-form-select">
import type { FlowNode } from '#/types/flow/index';

import { nextTick, ref } from 'vue';

import { useCrud, useTable } from '@cool-vue/crud';

import Info from './info.vue';

import { useFlow } from '#/hooks/hooks/userFlow';
import { useCool } from '#/cool';

const props = defineProps({
  modelValue: Number,
});

const emit = defineEmits(['update:modelValue']);

const { service, route, mitt } = useCool();
const flow = useFlow();

// 流程ID
const flowId = ref();

// 是否可见
const visible = ref(false);

// cl-crud
const Crud = useCrud({
  service: service.flow?.info,
});

// cl-table
const Table = useTable({
  columns: [
    {
      label: '操作',
      prop: 'op',
    },
    { label: '名称', prop: 'name', minWidth: 140 },
    {
      label: '标签',
      prop: 'label',
      minWidth: 140,
    },
    { label: '版本', prop: 'version', minWidth: 100 },
    {
      label: '描述',
      prop: 'description',
      showOverflowTooltip: true,
      minWidth: 200,
    },
    {
      label: '发布时间',
      prop: 'releaseTime',
      minWidth: 170,
      sortable: 'desc',
      formatter(row) {
        return row.releaseTime || '未发布';
      },
    },
  ],
});

// 刷新
async function refresh(params?: any) {
  return Crud.value?.refresh(params);
}

// 单击选择
function onRowClick(row: Eps.FlowInfoEntity) {
  flowId.value = row.id;
}

// 选择
function select(row: Eps.FlowInfoEntity) {
  const { nodes } = row.data || row.draft;

  // 开始节点
  const start = (nodes as FlowNode[]).find((e) => e.type == 'start');

  // 替换参数
  if (flow.node?.data && start) {
    const params = start.data?.inputParams?.map((e) => {
      return {
        field: e.field,
        label: e.label,
        name: e.name,
        required: e.required,
        type: e.type,
      };
    });

    mitt.emit('flow.updateForm', {
      inputParams: params,
    });
  }

  flowId.value = row.id;
  emit('update:modelValue', flowId.value);

  close();
}

// 打开
function open() {
  visible.value = true;

  nextTick(async () => {
    await refresh({
      status: 1,
      isRelease: true,
      flowId: route.query.id,
    });

    // 选中
    flowId.value = props.modelValue;

    if (flowId.value) {
      Table.value?.setCurrentRow(
        Table.value.data.find((e) => e.id == flowId.value),
      );
    }
  });
}

// 关闭
function close() {
  visible.value = false;
}
</script>

<template>
  <div class="form-select">
    <div v-if="!modelValue" class="empty">
      <span>未选择流程，</span>
      <span @click="open()">点击选择</span>
    </div>

    <Info v-else :flow-id="modelValue" @click="open()" />

    <cl-dialog
      v-model="visible"
      :controls="['close']"
      title="选择流程"
      width="1000px"
    >
      <cl-crud ref="Crud" padding="0">
        <cl-row>
          <cl-table
            ref="Table"
            :auto-height="false"
            @row-click="onRowClick"
            @row-dblclick="select"
          >
            <template #column-op="{ scope }">
              <el-button
                bg
                round
                size="small"
                type="success"
                @click="select(scope.row)"
              >
                选择
              </el-button>
            </template>
          </cl-table>
        </cl-row>

        <cl-row>
          <cl-flex1 />
          <cl-pagination />
        </cl-row>
      </cl-crud>
    </cl-dialog>
  </div>
</template>

<style lang="scss" scoped>
.op {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.list {
  .item {
    display: flex;
    align-items: center;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    height: 35px;
    line-height: normal;
    padding: 0 5px;
    margin-bottom: 5px;
    border: 1px solid var(--el-border-color);
    box-sizing: border-box;

    .icon {
      margin: 0 5px;
      font-size: 16px;
    }

    .name,
    .desc {
      font-size: 12px;
    }

    .desc {
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }

    &:hover {
      background-color: var(--el-fill-color-lighter);
    }

    &.active {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &:last-child {
      margin-bottom: 0;
    }
  }
}

.empty {
  text-align: center;
  line-height: normal;
  padding: 15px 0;
  border-radius: 4px;
  font-size: 12px;
  border: 1px solid var(--el-border-color);

  span {
    &:first-child {
      color: var(--el-text-color-placeholder);
    }

    &:last-child {
      color: var(--el-color-success);
      cursor: pointer;
    }
  }
}
</style>
