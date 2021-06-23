<template>
  <div :style="`font-size: ${count}px`">{{title}}</div>
  <div>{{desc}}</div>
  <div>
    <button @click="count+=5">点击title变大</button>
  </div>
</template>
<script >
import { ref } from 'vue'

export default ({
  setup(props, ctx) {
    return {
      count:ref(30),
      title: ref('vite-mini'),
      desc: ref('欢迎你de 到来')
    }
  }
})
</script>
