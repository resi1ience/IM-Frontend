<template>
  <div class="login-container">
    <h1 class="welcome-text">Welcome to CookieChat !</h1>
    <el-form label-width="100px" class="login-form">
      <el-form-item label="用户名">
        <el-input type="text" v-model="username" autocomplete="off" placeholder="请输入用户名"
          style="width: 240px"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input type="password" v-model="password" autocomplete="off" placeholder="请输入密码"
          style="width: 240px"></el-input>
      </el-form-item>
      <div class="form-actions">
        <el-button type="primary" @click="encryptAndSend">登录</el-button>
        <el-button type="success" @click="register">注册</el-button>
      </div>
    </el-form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onMounted } from 'vue';
import axios from 'axios';
import { SHA256 } from 'crypto-js';

import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const username = ref('');
const password = ref('');
const router = useRouter();

onMounted(() => {
  loadJSEncryptLibrary();
});

function loadJSEncryptLibrary() {
  const script = document.createElement('script');
  script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jsencrypt/3.0.0/jsencrypt.min.js';
  script.async = true;
  // script.onload = () => {
  //   // 加载完库后调用相应函数
  //   encryptAndSend();
  // };
  document.head.appendChild(script);
}
function register() {//注册键 
  // 跳转到注册界面
  router.push('/register');
}


function encryptAndSend() {
  // 发送加密数据给后端
  const password_private=SHA256(password.value).toString();

  axios.post('https://CookieIMBackend-Cookie.app.secoder.net/into/',
    {
      encrypted_username: username.value,
      encrypted_password: password_private
    },
    {
      'withCredentials': true, // 'true' 会被转换为 'true'
      'Content-Type': 'application/json'
    }
  )
    .then(response => {
      
      sessionStorage.setItem('uid', response.data.uid);
      sessionStorage.setItem('username', username.value);
      sessionStorage.setItem('password', password_private);

      router.push('/index/')
    })
    .catch(error => {
      ElMessage.error('用户名或密码错误');
      console.error('Error:', error)
    });
  // axios.post('http://localhost:8000/into/', {
  //   encrypted_username: username.value,
  //   encrypted_password: password.value
  // }, {
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // }, { withCredentials: true })
  //   .then(response => {
  //     // 储存 uid 到 Cookie 中
  //     sessionStorage.setItem('uid', response.data.uid);
  //     console.log(response.headers['Set-Cookie']);
  //     // 重定向到指定页面
  //     router.push('/index/')
  //   })
  //   .catch(error => console.error('Error:', error));
}
</script>

<style scoped>
.login-container {
  width: 400px;
  margin: 50px auto;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  text-align: center;
}

.welcome-text {
  font-size: 24px;
  margin-bottom: 20px;
  font-weight: bold;
}

.login-form .el-form-item {
  margin-bottom: 20px;
}

.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.form-actions .el-button:first-child {
  margin-right: 10px;
}
</style>
