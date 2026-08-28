<template>
  <div class="app-shell">
    <Nav />
    <main class="app-content">
      <router-view></router-view>
    </main>
  </div>
</template>

<script>
import Nav from '@/components/Nav.vue'

export default {
  name: 'DefaultLayout',
  components: {
    Nav
  }
}
</script>

<style scoped>
.app-shell {
  display: flex;
  height: 100vh;
  overflow: hidden;
}

.app-content {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: var(--el-bg-color-page);
}
</style>