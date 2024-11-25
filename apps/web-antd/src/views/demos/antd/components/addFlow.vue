<script setup lang="ts">
import { useVbenModal } from '@vben/common-ui';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import { addFlowApi } from '#/api/flowManage/index';

const [Modal, modalApi] = useVbenModal({
  draggable: true,
  confirmText: '提交',
  footer: false,
});

const emit = defineEmits(['confirm']);

const openModol = () => {
  modalApi.open();
};

const closeModel = () => {
  modalApi.close();
};

const onSubmit = async (values: Record<string, any>) => {
  try {
    const res = await addFlowApi({
      ...values,
      pagedQueryInfo: {
        index: 1,
        pageSize: 14,
      },
    });
    if (res.data && res.data.flowId) {
      message.success('创建成功');
      emit('confirm');
      closeModel();
    }
  } catch {
    message.error('创建失败');
  }
};

const [Form] = useVbenForm({
  layout: 'horizontal',
  // 提交函数
  handleSubmit: onSubmit,
  handleReset: closeModel,
  schema: [
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入名称',
      },
      // 字段名
      fieldName: 'name',
      // 界面显示的label
      label: '名称',
      rules: 'required',
    },
    {
      // 组件需要在 #/adapter.ts内注册，并加上类型
      component: 'Input',
      // 对应组件的参数
      componentProps: {
        placeholder: '请输入标签',
      },
      // 字段名
      fieldName: 'label',
      // 界面显示的label
      label: '标签',
      rules: 'required',
    },
    {
      component: 'Switch',
      componentProps: {
        class: 'w-auto',
      },
      fieldName: 'status',
      label: '状态',
    },
    {
      component: 'Textarea',
      componentProps: {
        placeholder: '请输入描述',
      },
      fieldName: 'description',
      label: '描述',
    },
  ],
  wrapperClass: 'grid-cols-1',
  resetButtonOptions: {
    content: '取消',
  },
});

defineExpose({
  openModol,
});
</script>

<template>
  <div class="addFlowBox">
    <Modal class="w-[600px]" title="基础示例">
      <Form />
    </Modal>
  </div>
</template>

<style scoped lang="scss">
.addFlowBox {
}
</style>
