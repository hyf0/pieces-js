<script lang="ts">
import { css } from '@pieces-js/tag'
import { defineComponent } from 'vue'

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

export default defineComponent({
  setup() {

    return {
      className,
      className2,
    }
  }
})
</script>

<template>
  <div>
    <div :class="className">hello</div>
    <div :class="className2">world</div>
  </div>
</template>