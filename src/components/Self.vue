<template>
  <div class="user-profile">
    <!-- 头像 -->
    <div class="avatar-container">

      <!-- 图片预览 -->
      <img id="avatarPreview" src="" alt="用户头像" style="width: 100px; height: 100px;">
      <!-- 隐藏的文件输入，用于触发本地文件选择 -->
      <input type="file" id="fileInput" style="display: none" @change="previewAndUpload" accept="image/*">

      <!-- 修改按钮 -->
      <el-button class="edit-button" @click="edit_avatar()">修改</el-button>
    </div>
    <!-- 用户信息 -->
    <div class="info-container">
      <div class="info-item">
        <span class="label">用户名：</span>
        <span>{{ userInfo.username }}</span>
        <el-button class="edit-button" @click="edit('username')">修改</el-button>
      </div>

      <div class="change-item" v-if="editType === 'username'">
        <div class="input-container">
          <el-input v-model="editValue" placeholder="请输入新用户名" @input="validateUsername" autocomplete="off"></el-input>
          <el-button type="success" @click="saveChange()">保存</el-button>
        </div>
        <div v-if="usernameTip" class="input-tip">只能由字母、数字和!?,-=/\组成</div>
      </div>


      <div class="info-item">
        <span class="label">邮箱：</span>
        <span>{{ userInfo.mail }}</span>
        <el-button class="edit-button" @click="edit('mail')">修改</el-button>
      </div>

      <div class="change-item" v-if="editType === 'mail' && verifyID == true">
        <div class="input-container">
          <el-input v-model="editValue" placeholder="请输入新邮箱" @input="validateEmail" autocomplete="off"></el-input>
          <el-button type="success" @click="saveChangePrivate('mail')">保存</el-button>
        </div>
        <div v-if="emailTip" class="input-tip">请输入有效的邮箱地址</div>
      </div>

      <!-- <div class="change-item"v-if="editType == 'mail'&&verifyID==true">
         <el-input  v-model="editValue" placeholder="请输入新邮箱"@input="validateEmail"></el-input>       
         <el-button type="success" @click="saveChangePrivate('mail')">保存</el-button>
         <div v-if="emailTip" class="input-tip">请输入有效的邮箱地址</div>
        </div> -->

      <div class="info-item">
        <span class="label">密码：</span>
        <span>{{ userInfo.password }}</span>
        <el-button class="edit-button" @click="edit('password')">修改</el-button>
      </div>

      <div class="change-item" v-if="editType === 'password' && verifyID == true">
        <div class="input-container">
          <el-input v-model="editValue" placeholder="请输入新密码" @input="validatePassword" autocomplete="off"></el-input>
          <el-button type="success" @click="saveChangePrivate('password')">保存</el-button>
        </div>
        <div v-if="passwordTip" class="input-tip">密码必须包含至少8个字符,且包括大写字母、小写字母、数字。</div>
      </div>

      <!-- <div class="change-item"v-if="editType =='password'&&verifyID==true">
         <el-input  v-model="editValue" placeholder="请输入新密码"@input="validatePassword"></el-input>       
         <el-button type="success" @click="saveChangePrivate('password')">保存</el-button>
         <div v-if="passwordTip" class="input-tip">密码必须包含至少8个字符,且包括大写字母、小写字母、数字和特殊字符(!?,-=\/\\)。</div>
        </div> -->

      <div class="info-item">
        <span class="label">手机号：</span>
        <span>{{ userInfo.phone }}</span>
        <el-button class="edit-button" @click="edit('phone')">修改</el-button>
      </div>
      <div class="change-item" v-if="editType === 'phone' && verifyID == true">
        <div class="input-container">
          <el-input v-model="editValue" placeholder="请输入新手机号" @input="validatePhone" autocomplete="off"></el-input>
          <el-button type="success" @click="saveChangePrivate('phone')">保存</el-button>
        </div>
        <div v-if="phoneTip" class="input-tip">请输入11位的整数</div>
      </div>

      <!-- <div class="change-item"v-if="editType == 'phone'&&verifyID==true">
         <el-input  v-model="editValue" placeholder="请输入新手机号"@input="validatePhone"></el-input>       
         <el-button type="success" @click="saveChangePrivate('phone')">保存</el-button>
         <div v-if="phoneTip" class="input-tip">请输入11位的整数</div>
        </div> -->



    </div>
  </div>

  <!-- 验证对话框 -->
  <el-dialog v-model="verificationDialogVisible" title="验证身份">
    <el-form ref="verifyForm">
      <el-form-item label="用户名">
        <el-input v-model="verifyUsername" placeholder="请输入用户名"></el-input>
      </el-form-item>
      <el-form-item label="密码">
        <el-input v-model="verifyPassword" placeholder="请输入密码" show-password></el-input>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="closeVerificationDialog">取消</el-button>
      <el-button type="primary" @click="verifyCredentialsAndEdit(editType.value)">验证</el-button>
    </span>
  </el-dialog>

  <div class="return">
    <el-button type="success" @click="returnToLogin">返回</el-button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

import { SHA256 } from 'crypto-js';
import { ElDialog, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus';
import { ElMessage, ElMessageBox } from 'element-plus'





// 假设的初始数据和函数定义...
const userInfo = ref({
  //这里用get来获取信息
  avatar: 'src/assets/avater_cookie.png', // 默认头像路径
  username: '加载中......',
  mail: '加载中......',
  password: '*******',
  phone: '加载中......',

});
const editType = ref(null);
const editValue = ref('');
const verificationDialogVisible = ref(false);
const verifyUsername = ref('');
const verifyPassword = ref('');
const uid = sessionStorage.getItem('uid')
let old_password = ref(0);//验证时更新
old_password = sessionStorage.getItem('password');
const avatarUrl = ref(''); // 存储图片URL用于预览

const usernameTip = ref(false);
const passwordTip = ref(false);
const phoneTip = ref(false);
const emailTip = ref(false);

const verifyID = ref(false);

onMounted(async () => {
  if (sessionStorage.getItem('uid') == null) {
    router.push('/illegal');
  }

  axios.defaults.withCredentials = true;
  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/selfinfo/',
    //params: { uid: uid }
    method: 'post'
  },/* {withCredentials: true} */)
    .then(response => {
      console.log('数据获取成功', response.data);
      // 假设后端返回的数据格式是 { username: '', phone: '', mail: '' }
      userInfo.value["username"] = response.data.username;
      userInfo.value["phone"] = response.data.phone;
      userInfo.value["mail"] = response.data.mail;
    })
    .catch(error => {
      console.error('获取用户信息失败:', error);
    });

  displayAvatar();
});



function fetchAvatar() {
  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/get_user_avatar/',
    data: { uid: uid },
    method: 'post',
    responseType: 'blob'
  })
    .then(response => {
      console.log('头像获取成功', response);
      const imageUrl = URL.createObjectURL(response.data); // 从响应对象中获取 Blob 数据
      console.log(imageUrl);
      document.getElementById('avatarPreview').src = imageUrl;
    })
    .catch(error => {
      console.error('头像获取失败:', error);
    });
}

function displayAvatar() {
  fetchAvatar();
}


// 编辑和保存函数...
function edit(field) {
  if (field == 'username') {
    editType.value = field;
    //editValue.value = userInfo.value[field];  
  }
  else {
    openVerificationDialog(field);
    editType.value = field;
  }

}
// 验证用户名
const validateUsername = () => {
  usernameTip.value = !/^[a-zA-Z0-9!?,-=\/\\]+$/.test(editValue.value);
};
// 验证密码
const validatePassword = () => {
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!?,-=\/\\])[A-Za-z\d!?,-=\/\\]{8,}$/;
  // 检查password.value是否符合正则表达式定义的格式
  const isValidPassword = passwordPattern.test(editValue.value);

  // 更新提示信息，如果密码不符合格式，则提示用户，否则不显示错误提示
  passwordTip.value = !isValidPassword;
};

//验证手机号
const validatePhone = () => {
  const phoneInt = parseInt(editValue.value, 10); // 使用parseInt转换为整数
  if (!Number.isInteger(phoneInt) || editValue.value.length !== 11) {
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
  const isValidEmail = emailPattern.test(editValue.value);

  // 更新提示信息，如果邮箱不符合格式，则提示用户，否则不显示错误提示
  emailTip.value = !isValidEmail;
};

function examine_before_save(type){
    if(type=="phone"){
      const phoneInt = parseInt(editValue.value, 10); // 使用parseInt转换为整数
      if (!Number.isInteger(phoneInt) || editValue.value.length !== 11) {
         return false;
      } else {
         return true;
      }
    }
    else if(type=="mail"){
       const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
       const isValidEmail = emailPattern.test(editValue.value);
       if(isValidEmail){
        return true;
       }
       else return false;
    }
    else return false;
}

function saveChange() {//更新用户名
  const isValidUsername = /^[a-zA-Z0-9!?,-=\/\\]+$/.test(editValue.value);
  if(!isValidUsername) {

    ElMessageBox.alert('用户名格式错误，无法保存！', 'Error', {
          confirmButtonText: 'OK',
          type: 'error'
        });

    return;
  }
  userInfo.value["username"] = editValue.value;
  //uid = sessionStorage.getItem('uid');
  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/modify_user_name/',
    data: {
      // uid:0,
      new_username: editValue.value
    },
    method: 'post'
  }/* ,{withCredentials:true} */)
    .then(() => {
      console.log('用户名更新成功');
      editType.value = null;  // 关闭编辑模式

    })
    .catch(error => {
      console.error('用户名更新失败:', error);
    });

}

function saveChangePrivate(field) {//更新密码、邮箱、电话
  // uid = sessionStorage.getItem('uid');
  console.log(field);
  console.log(editType);
  if (field == 'password') {
    console.log('editValue:', editValue.value);

    const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!?,-=\/\\])[A-Za-z\d!?,-=\/\\]{8,}$/;
     // 检查password.value是否符合正则表达式定义的格式
   const isValidPassword = passwordPattern.test(editValue.value);
   if(!isValidPassword){
        ElMessageBox.alert('密码格式错误，无法保存！', 'Error', {
          confirmButtonText: 'OK',
          type: 'error'
        });

    return;
   }

    axios({
      url: 'https://CookieIMBackend-Cookie.app.secoder.net/modify_phone_or_mail_or_password/',
      data: {
        username: userInfo.value["username"],
        password: old_password,
        new_password: SHA256(editValue.value).toString()
      },
      method: 'post'
    }/* ,{withCredentials:true} */).then(() => {
      console.log(' 密码更新成功');
      //userInfo.value[field] = SHA256(editValue.value).toString();
      editType.value = null; // 关闭编辑模式
      old_password = SHA256(editValue.value).toString();
      sessionStorage.setItem('password', old_password);
      verifyID.value = false;
    })
      .catch(error => {
        console.error(' 密码更新失败:', error);
      });
  }
  else {
    const isValid=examine_before_save(field);
    if(!isValid){
      ElMessageBox.alert(field+'格式错误，无法保存！', 'Error', {
          confirmButtonText: 'OK',
          type: 'error'
        });
      return;
    }
    axios({
      url: 'https://CookieIMBackend-Cookie.app.secoder.net/modify_phone_or_mail_or_password/',
      data: {
        username: userInfo.value["username"],
        password: sessionStorage.getItem('password'),
        [field]: editValue.value
      },
      method: 'post'
    }/* ,{withCredentials:true} */).then(() => {
      console.log(field + ' 更新成功');
      userInfo.value[field] = editValue.value;
      editType.value = null; // 关闭编辑模式
      verifyID.value = false;
    })
      .catch(error => {
        console.error(field + ' 更新失败:', error);
      });
  }

}

function edit_avatar() {
  document.getElementById('fileInput').click(); // 触发文件输入
}

function previewAndUpload(event) {
  const file = event.target.files[0];
  if (file) {
    console.log(file);  // 打印文件信息查看
    console.log("File type:", file.type);  // 显示文件类型
    console.log("File size:", file.size + " bytes");  // 显示文件大小

    if (Number(file.size) > 1024 * 1024) {
      ElMessage.error('图片大小不能超过1MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      avatarUrl.value = e.target.result; // 更新图片预览
      document.getElementById('avatarPreview').src = avatarUrl.value;
    };

    // 上传图片到服务器
    const formData = new FormData();
    formData.append('img', file);
    axios({
      url: 'https://CookieIMBackend-Cookie.app.secoder.net/postimg/',
      method: 'post',
      data: formData,
      withCredentials: true,  // 确保携带 Cookie
      headers: { 'Content-Type': 'multipart/form-data' },// 这通常不必设置，因为使用 FormData 时浏览器会自动处理
      onUploadProgress: progressEvent => {
        console.log('上传进度:', Math.round((progressEvent.loaded / progressEvent.total) * 100) + '%');
      }
    })
      .then(response => {
        console.log('头像上传成功', response);
      })
      .catch(error => {
        if (error.response) {
          console.error('错误响应状态码:', error.response.status);
          console.error('错误响应数据:', error.response.data);
        } else if (error.request) {
          console.error('请求未响应:', error.request);
        } else {
          console.error('设置请求时出错:', error.message);
        }
        console.error('配置信息:', error.config);
      });


    // 读取文件内容为DataURL
    reader.readAsDataURL(file);
  }
}

const openVerificationDialog = (field) => {

  verificationDialogVisible.value = true;
  editType.value = field;
  //alert(verificationDialogVisible.value);
};

const closeVerificationDialog = () => {
  verificationDialogVisible.value = false;
  verifyID.value = false;
};

const verifyCredentialsAndEdit = async (field) => {

  let realPassword = sessionStorage.getItem('password');
  let testPassword = SHA256(verifyPassword.value).toString();
  if (verifyUsername.value == userInfo.value["username"] && testPassword == realPassword) {
    verifyID.value = true;
    //editType.value = field;
    verificationDialogVisible.value = false; // 关闭对话框
    console.log(editType.value);
    console.log(verifyID.value);


  }
  else {
    alert('用户名或密码错误！');
    console.log(realPassword);
    console.log(testPassword);
    console.log(userInfo.value["username"]);
    console.log(verifyUsername.value);

  }

};

import { useRouter } from 'vue-router';
import { fi } from 'element-plus/es/locale/index.mjs';
const router = useRouter();
function returnToLogin() {
  router.push('/index');
}

</script>

<style scoped>
.user-profile {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 20px;
}

.avatar-container {
  flex-direction: column;
  margin-bottom: 20px;
}

.avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
}

.info-container {
  padding: 0px;
  width: 100%;
  max-width: 300px;
  /* 控制最大宽度 */
  display: flex;
  flex-direction: column;
  align-items: center;
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}

.change-item {
  display: flex;
  flex-direction: column;
  /* 使子元素垂直排列 */
  align-items: flex-start;
  /* 对齐到起始边界 */
  width: 100%;
  margin-bottom: 10px;
}

.input-container {
  display: flex;
  justify-content: space-between;
  /* 确保输入框和按钮之间有间隔 */
  align-items: center;
  /* 垂直居中 */
  width: 100%;
  /* 充满整个.change-item容器 */
}


.label {
  font-weight: bold;
  color: #333;
}

.edit-button,
.save-button {
  margin-left: 10px;
}

.return {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.input-tip {
  color: #ff6060;
  font-size: 12px;
  margin-top: 5px;
}
</style>
