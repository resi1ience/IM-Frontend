<template>
  <div>
    <h2>好友列表</h2>
    <ul>
      <li v-for="(frd, index) in Friends" :key="index" @click="select(frd)">
        <el-button width="100px"><el-text><{{ frd.tag }}> {{ frd.username }}</el-text></el-button>
      </li>
    </ul>
  </div>
</template>

<script setup>

const props = defineProps({
  Friends: {
    type: Array,
    required: true
  },
  selectFriend: {
    type: Function,
    required: true
  }
});


let selectedFriend = 0;

function select(frd) {
  selectedFriend = frd;
  props.selectFriend(frd);
}
</script>
