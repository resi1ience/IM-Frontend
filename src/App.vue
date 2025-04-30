<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'App'
};
</script>

<style>
@import './style.css';

#app {
  width: 100%;
  margin: 0 auto;
  padding: 20px;
}
</style>