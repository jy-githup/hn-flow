<script setup lang="ts" name="tools-connection-line">
defineProps({
  sourceX: {
    type: Number,
    required: true,
  },
  sourceY: {
    type: Number,
    required: true,
  },
  targetX: {
    type: Number,
    required: true,
  },
  targetY: {
    type: Number,
    required: true,
  },
});
</script>

<template>
  <g>
    <path
      :d="`M${sourceX},${sourceY} C ${sourceX} ${targetY} ${sourceX} ${targetY} ${targetX},${targetY}`"
      :stroke-width="1.5"
      class="vue-flow__connection animated"
      fill="none"
      stroke="#6F3381"
    />

    <circle
      :cx="targetX"
      :cy="targetY"
      :r="4"
      :stroke-width="1.5"
      fill="#fff"
      stroke="#6F3381"
    />
  </g>
</template>
