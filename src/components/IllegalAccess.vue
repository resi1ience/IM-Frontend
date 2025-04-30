<template>
    <div class="illegal-access">
      <p>非法访问，即将自动跳转</p>
      <p>如果没有自动跳转，请点击<a href="#" @click="handleRedirect">这里</a></p>
    </div>
  </template>
  
  <script setup>
  import { onMounted, ref } from 'vue';
  import { useRouter } from 'vue-router';
 
  
  const router = useRouter();
  
  onMounted(() => {
    // 自动跳转逻辑，3秒后执行跳转
    setTimeout(() => {
      handleRedirect();
    }, 3000); // 3秒
  });
  
  function handleRedirect() {
    // 检查sessionStorage中是否存储了id信息
    const userId = sessionStorage.getItem('uid');
    if (userId) {
      // 如果有id，跳转到聊天室界面
      router.push( '/index/' ); 
    } else {
      // 如果没有id，跳转到登录界面
      router.push( '/into/' );
    }
  }
  </script>
  
  <style scoped>
  .illegal-access p {
    text-align: center;
    margin: 20px 0;
  }
  
  .illegal-access a {
    text-decoration: underline;
    cursor: pointer;
  }
  </style>
  