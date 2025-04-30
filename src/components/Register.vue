<template>
  <div class="register-container">
    <el-form label-width="100px" class="register-form">
      <!-- 账号 -->
      <el-form-item label="账号">
        <el-input v-model="username" autocomplete="off" placeholder="请输入用户名" style="width: 240px"
          @input="validateUsername"></el-input>
        <div v-if="usernameTip" class="input-tip">只能由字母、数字和!?,-=/\组成</div>
      </el-form-item>
      <!-- 密码 -->
      <el-form-item label="密码">
        <el-input type="password" v-model="password" autocomplete="off" placeholder="请输入密码" style="width: 240px"
          @input="validatePassword"></el-input>
        <div v-if="passwordTip" class="input-tip">密码必须包含至少8个字符,且包括大写字母、小写字母、数字</div>
      </el-form-item>
      <!-- 电话号码 -->
      <el-form-item label="手机号">
        <el-input v-model="phone" autocomplete="off" placeholder="请输入手机号" style="width: 240px"
          @input="validatePhone"></el-input>
        <div v-if="phoneTip" class="input-tip">请输入11位的整数</div>
      </el-form-item>
      <!-- 邮箱 -->
      <el-form-item label="邮箱">
        <el-input v-model="email" autocomplete="off" placeholder="请输入邮箱" style="width: 240px"
          @input="validateEmail"></el-input>
        <div v-if="emailTip" class="input-tip">请输入有效的邮箱地址</div>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>



<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { SHA256 } from 'crypto-js';
//import { ElMessage, ElIcon } from 'element-plus';
//import { Upload } from '@element-plus/icons-vue';

const username = ref('');
const password = ref('');
const phone = ref('');
const email = ref('');
//const avatarUrl = ref('');
const router = useRouter();
let password_private="";

const usernameTip = ref(true);
const passwordTip = ref(true);
const phoneTip = ref(true);
const emailTip = ref(true);

// 验证用户名
const validateUsername = () => {
  usernameTip.value = !/^[a-zA-Z0-9!?,-=\/\\]+$/.test(username.value);
};
// 验证密码
const validatePassword = () => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!?,-=\/\\])[A-Za-z\d!?,-=\/\\]{8,}$/;
  // 检查password.value是否符合正则表达式定义的格式
  const isValidPassword = passwordPattern.test(password.value);

  // 更新提示信息，如果密码不符合格式，则提示用户，否则不显示错误提示
  passwordTip.value = !isValidPassword;
};

//验证手机号
const validatePhone = () => {
  const phoneInt = parseInt(phone.value, 10); // 使用parseInt转换为整数
  if (!Number.isInteger(phoneInt) || phone.value.length !== 11) {
    phoneTip.value = true;
  } else {
    phoneTip.value = false;
  }
};


// 验证邮箱
const validateEmail = () => {
  // 定义一个邮箱验证的正则表达式
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  // 检查email.value是否符合正则表达式定义的格式
  const isValidEmail = emailPattern.test(email.value);

  // 更新提示信息，如果邮箱不符合格式，则提示用户，否则不显示错误提示
  emailTip.value = !isValidEmail ;
};








const submitForm = () => {
  password_private=SHA256(password.value).toString();

  if (usernameTip.value || passwordTip.value || phoneTip.value || emailTip.value || username.value === '' || password.value === '' || phone.value === '' || email.value === '') {
    ElMessage.error('请检查输入信息是否正确');
    return;
  }

  axios( {
    url:'https://CookieIMBackend-Cookie.app.secoder.net/register/',
    data:{
      username: username.value,
      password: password_private,
      phone: phone.value,
      mail: email.value,
    },
    method:'post'
  })
    .then(response => {
      ElMessage.success('注册成功！');
      router.push('/into/' );
    })
    .catch(error => {
      console.error('注册失败:', error);
      ElMessage.error('注册失败，请稍后再试');
      const errorMessage = error.response && error.response.data ? error.response.data.message : '注册失败，请稍后再试';
      ElMessage.error(errorMessage);
    });
   // uploadFile(file);
};
</script>

<style scoped>
.input-tip {
  color: #ff6060;
  font-size: 12px;
  margin-top: 5px;
}

.register-container {
  width: 400px;
  margin: 50px auto;

}

.avatar-uploader {
  cursor: pointer;
  width: 100px;
  height: 100px;
  background-color: #f9f9f9;
  position: relative;
  border: 1px solid #141010;
  border-radius: 6px;
  overflow: hidden;
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #272829;
  position: absolute;
  top: 50%;
  left: 50%;
  -webkit-transform: translate(-50%, -50%);
  transform: translate(-50%, -50%);
}

.avatar {
  width: 100%;
  height: 100%;
}
</style>
