<script lang="ts" name="flow-tools-import" setup>
import { type PropType, reactive, ref } from 'vue';

import { ElMessage } from 'element-plus';
import { debounce } from 'lodash-es';

import { useCool } from '#/cool';

const props = defineProps({
  limit: {
    type: Number,
    default: 2,
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
  icon: String,
  disabled: Boolean,
  accept: {
    type: String,
    default: '.json',
  },
});

const emits = defineEmits(['change', 'success']);

const { service } = useCool();

// 上传信息
const upload = reactive({
  filename: '',
  file: null as File | null,
  list: [] as any[],
  reset: () => {
    upload.filename = '';
    upload.file = null;
    upload.list = [];
  },
});

// 保存中
const saving = ref<boolean>(false);

// 上传
function onUpload(raw: File, _: any, { next }: any) {
  const reader = new FileReader();

  reader.addEventListener('load', (event: any) => {
    const data = event.target.result;

    try {
      const result = JSON.parse(data);

      upload.list.push(result);
      upload.filename = raw.name;
      upload.file = raw;

      emits('change', result);
    } catch {
      ElMessage.error('导入失败，请检查文件后重新上传');
    }
  });

  reader.readAsText(raw, 'UTF-8');
  // reader.readAsBinaryString(raw);

  next();

  // 调用防抖提交
  debouncedOnSubmit();

  return false;
}

// 防抖处理 onSubmit 函数
const debouncedOnSubmit = debounce(onSubmit, 500); // 1000 毫秒防抖延迟

// 提交导入
function onSubmit() {
  if (saving.value) return false;

  if (upload.list.length > props.limit) {
    // ElMessage.warning(`最多只能上传${props.limit}个文件`);
    return false;
  }

  saving.value = true;

  service.flow?.info
    .add(upload.list)
    .finally(() => {
      saving.value = false;
      upload.reset();
    })
    .then(() => {
      ElMessage.success('导入成功');
      emits('success');
    })
    .catch((error) => {
      ElMessage.error(`导入失败：${error.message}`);
    });
}
</script>

<template>
  <cl-upload
    :accept="accept"
    :auto-upload="false"
    :before-upload="onUpload"
    :disabled="saving || disabled"
    :limit="limit"
    :limit-size="limitSize"
    :show-file-list="false"
    :size="[220, '100%']"
    multiple
    type="file"
  >
    <el-button type="success">
      <cl-svg name="import" />
      <span class="text">导入</span>
    </el-button>
  </cl-upload>
</template>

<style lang="scss" scoped>
.text {
  margin-left: 6px;
}
</style>
