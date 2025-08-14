<template>
   <div>
      <router-view v-if="$route.path.includes('/equipamento/')"></router-view>
   </div>
</template>

<script>
export default {
   name: 'OutrosView'
}
</script>

<style>
</style>