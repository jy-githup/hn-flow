<script lang="ts" setup>
import type { VbenFormProps } from '#/adapter/form';
import type { VxeGridProps } from '#/adapter/vxe-table';

import { ref } from 'vue';
import { useRouter } from 'vue-router';

import { Button, message } from 'ant-design-vue';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { deleteFlowApi, getFlowListApi } from '#/api/flowManage/index';
import addFlow from '#/views/demos/antd/components/addFlow.vue';

const router = useRouter();

interface RowType {
  category: string;
  color: string;
  id: string;
  price: string;
  productName: string;
  releaseDate: string;
}

const formOptions: VbenFormProps = {
  // 默认展开
  collapsed: false,
  schema: [
    {
      component: 'Input',
      componentProps: {
        placeholder: '请输入名称/标签',
      },
      // defaultValue: '1',
      fieldName: 'name',
      label: '名称',
    },
  ],
  // 控制表单是否显示折叠按钮
  showCollapseButton: true,
  submitButtonOptions: {
    content: '查询',
  },
  // 按下回车时是否提交表单
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<RowType> = {
  checkboxConfig: {
    highlight: true,
    labelField: 'name',
  },
  columns: [
    { type: 'checkbox', width: 50 },
    { align: 'left', title: '名称', field: 'name', width: 120 },
    { field: 'label', title: '标签', width: 100 },
    { field: 'status', title: '状态', width: 100 },
    { field: 'version', title: '版本', width: 80 },
    {
      field: 'releaseTime',
      formatter: ({ row }) => {
        if (row.releaseTime) return row.releaseTime;

        return '未发布';
      },
      title: '发布时间',
      width: 180,
    },
    {
      field: 'createTime',
      formatter: 'formatDateTime',
      title: '创建时间',
      width: 180,
    },
    {
      field: 'updateTime',
      formatter: 'formatDateTime',
      title: '更新时间',
      width: 180,
    },
    { field: 'description', title: '描述', width: 200 },
    { slots: { default: 'action' }, title: '操作', width: 300, fixed: 'right' },
  ],
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        // message.success(`Query params: ${JSON.stringify(formValues)}`);
        return await getFlowListApi({
          ...formValues,
          pagedQueryInfo: {
            index: page.currentPage,
            pageSize: page.pageSize,
          },
        });
      },
    },
    response: {
      result: 'data',
      total: 'total',
    },
  },
  toolbarConfig: {
    custom: true,
    refresh: true,
    zoom: true,
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ formOptions, gridOptions });

const addFlowRef = ref<InstanceType<typeof addFlow>>();

const arrangeFlow = (row) => {
  router.push({
    name: 'FlowManage/FlowInfo',
    query: {
      id: row.flowId,
      label: row.label,
    },
  });
};

const deleteFlow = async (row) => {
  try {
    await deleteFlowApi(row.id);
    await gridApi.reload();
    message.success('删除成功');
  } catch {
    message.error('删除失败');
  }
};

const exportFlie = () => {};
</script>

<template>
  <div class="vp-raw h-full w-full overflow-hidden overflow-y-auto p-3.5">
    <Grid>
      <template #toolbar-tools>
        <Button class="mr-2" type="primary" @click="addFlowRef.openModol()">
          创建
        </Button>
        <!--        <Button class="mr-2" danger type="primary">-->
        <!--          删除-->
        <!--        </Button>-->
        <Button class="mr-2"> 配置 </Button>
        <Button class="mr-2" type="dashed" @click="exportFlie"> 导入 </Button>
      </template>
      <template #action="{ row }">
        <Button color="red" type="link">编辑</Button>
        <Button danger type="link" @click="deleteFlow(row)">删除</Button>
        <Button type="link" @click="arrangeFlow(row)">编排</Button>
        <Button type="link">日志</Button>
      </template>
    </Grid>

    <addFlow ref="addFlowRef" @confirm="gridApi.reload()" />
  </div>
</template>
