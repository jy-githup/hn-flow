<script setup lang="ts" name="node-base-form-text">
import { computed } from 'vue';

import { isArray } from 'lodash-es';

const props = defineProps({
  text: {
    type: [String, Array],
    default: '',
  },
});

const list = computed(() => {
  return isArray(props.text) ? props.text : [props.text];
});
</script>

<template>
  <div class="form-text">
    <el-text v-for="(item, index) in list" :key="index" size="small" tag="p">
      {{ item }}
    </el-text>
  </div>
</template>

<style lang="scss" scoped>
.form-text {
  line-height: normal;

  .el-text {
    margin-bottom: 10px;

    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
