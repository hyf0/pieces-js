<script setup lang="ts">
import { css } from '@pieces-js/tag'
const className = css`
  color: red;
  font-size: 24px;
  &:hover {
    color: blue;
  }
`

const className2 = css`
  color: red;
  font-size: 48px;
`
</script>

<template>
  <div>
    <div :class="className">hello</div>
    <div :class="className2">world</div>
  </div>
</template>