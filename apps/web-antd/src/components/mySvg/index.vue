<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

import { isNumber } from 'lodash-es';

export default defineComponent({
  name: 'MySvg',

  props: {
    name: {
      type: String,
      default: '',
    },
    className: {
      type: String,
      default: '',
    },
    size: {
      type: [String, Number],
      default: '',
    },
  },

  setup(props) {
    const style = ref({
      fontSize: isNumber(props.size) ? `${props.size}px` : props.size,
    });

    const iconName = computed(() => `#icon-${props.name}`);
    const svgClass = computed(() => {
      return ['my-svg', `my-svg__${props.name}`, String(props.className || '')];
    });

    return {
      style,
      iconName,
      svgClass,
    };
  },
});
</script>

<template>
  <svg :class="svgClass" :style="style" aria-hidden="true">
    <use :xlink:href="iconName" />
  </svg>
</template>

<style lang="scss" scoped>
.my-svg {
  width: 1em;
  height: 1em;
  overflow: hidden;
  vertical-align: -0.15em;
  fill: currentcolor;
}
</style>
