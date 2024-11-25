<script lang="ts" setup>
import { useModel } from 'vue';

const props = defineProps({
  modelValue: null,
  prefix: String,
  suffix: String,
  min: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 9_999_999_999,
  },
  precision: {
    type: Number,
    default: 0,
  },
});

const value = useModel(props, 'modelValue');
</script>

<template>
  <div class="form-input-number">
    <span v-if="prefix" class="label prefix">{{ prefix }}</span>
    <div>
      <el-input-number
        v-model="value"
        :max="max"
        :min="min"
        :precision="precision"
      />
    </div>
    <span v-if="suffix" class="label suffix">{{ suffix }}</span>
  </div>
</template>

<style lang="scss" scoped>
.form-input-number {
  display: flex;
  align-items: center;

  .label {
    flex-shrink: 0;
    font-size: var(--el-form-label-font-size);
    // color: var(--el-text-color-regular);
    color: var(--el-color-info);
    &.prefix {
      margin-right: 10px;
    }
    &.suffix {
      margin-left: 10px;
    }
  }
}
</style>
