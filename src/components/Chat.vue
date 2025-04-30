<template>
  <el-scrollbar wrap-class="scrollbar-wrapper"ref="messagesWrapper">
<!--     <div class="messages-wrapper" ref="messagesWrapper">
 -->      <div class="message" 
               v-for="message in props.messages" 
               :class="[message.senderClass]" 
               :key="message.message_id" 
               :ref="el => setMessageRef(el, message.message_id)">
        <div class="message-content" :class="[message.senderClass === 'sender' ? 'message-sender' : 'message-receiver']">
            <el-popover placement="bottom" ref="popover"@hide="hidePopover">
            <!-- 触发元素 -->
            <template #reference>
              <div class="AvatarAndText">
                  <img class="user-avatar" :src="message.avatar" alt="Avatar" style="width: 37px; height: 37px;">  
                  <el-text class="message-text" :style="{ backgroundColor: message.senderClass === 'sender' ? '#90EE90' : '#ffffff' }">{{ message.text }}</el-text>
               </div>   
           </template>
           <!-- 悬浮窗内容 -->
           <div>
             <button @click="check_read(message.message_id,message.senderClass)">查看已读</button>
             <div v-if="showReadList">{{ ReadList }}</div> 
              <button @click="reply(message.message_id)">回复</button>
              <button @click="check_reply_chat(message.message_id)">查看被回复了几次</button>
              <div v-if="showReplyList">回复数：{{ ReplyList }}</div> 
              <button @click="jump(message.message_id,props.Reply_Message_ID)" >跳转</button>

           </div>
         </el-popover>

         <div class="message-else">
             <text class="message-time">{{ message.time }}</text>
         </div>

        </div>
      </div>
    <!-- </div> -->
    
  </el-scrollbar>
</template>



<script setup>
import { ref, onMounted, nextTick, watch } from 'vue';
import axios from 'axios';
//message_id
import Chatroom from './ChatRoom.vue';
import { getCurrentInstance } from 'vue';
//import {useContext}from 'vue';


const popover = ref(null);
//const messagesWrapper = ref(null);
//const messageElements=ref(null);
const uid = sessionStorage.getItem('uid');
const showReplyList = ref(false); // 控制回复列表的显示与隐藏
let ReplyList = 0; // 回复数
const showReadList = ref(false); // 控制已读列表的显示与隐藏
let ReadList = ''; // 已读用户

const messagesWrapper = ref(null);
const messageRefs = new Map();

const setMessageRef = (el, messageId) => {
      if (el) {
        messageRefs.set(messageId, el);
      } else {
        messageRefs.delete(messageId);
      }
    };

    const scrollToMessage = (messageId) => {
      nextTick(() => {
        const messageElement = messageRefs.get(messageId);
        console.log('in scrollToMessage,messageElement:', messageElement);
        if (messageElement && messagesWrapper.value) {
          console.log('in scrollToMessage:找到对应元素');
          const scrollContainer = messagesWrapper.value.wrapRef;
          console.log('in scrollToMessage,scrollContainer:',scrollContainer);
          if (scrollContainer) {
            scrollContainer.scrollTop = messageElement.offsetTop;
          } else {
            console.error('scrollContainer is undefined');
          }
        }
      });
    };

const props = defineProps({
  messages: {
    type: Array,
    required: true
  },
  sendMessage_reply: {
    type: Function,
    required: true
  },
  getReadList:{
     type:Function,
     required:true
  },
  check_reply:{
    type:Function,
    required:true
  },
  messageToChat:{
    type:Object,
    requied:true
  }
});



watch(() => props.messageToChat, (newMessages, oldMessages) => {
  // 在 messages 变化时执行的逻辑
  console.log('在chat中观察到三个参数变化', newMessages);

});

onMounted(() => {
  axios.defaults.withCredentials = true;
  console.log('开始加载');
  scrollToBottom();
  

  });


  const scrollToBottom = () => {
     /*  nextTick(() => {
        if (messagesWrapper.value) {
          messagesWrapper.value.wrapRef.scrollTop = messagesWrapper.value.wrapRef.scrollHeight;
        }
      }); */
      if (props.messages.length === 0) {}
      else{
        let bottomID=Math.max(...props.messages.map(message => message.message_id));
        scrollToMessage(bottomID);
      } 
    
    };
/* function scrollToBottom() {
  nextTick(() => {
    messagesWrapper.value.scrollTop = messagesWrapper.value.scrollHeight;
  });
} */

// 点击消息的跳转按钮
function jump(source_id, direct_id) {
  props.check_reply(source_id);

  setTimeout(() => {
    direct_id=props.messageToChat.Reply_Message_ID;
     
     if (!isNaN(direct_id)&&direct_id != -1) {
       const targetMessage = props.messages.find(message => message.message_id === direct_id);
       if (targetMessage) {
         console.log('observe:目标信息存在',targetMessage);
         scrollToMessage(targetMessage.message_id);
       }
     }
     else{
       alert('该消息没有回复其他消息');
     }

  }, 500);//等待
  
    

  //测试滚动正确
        /* const targetMessage = props.messages.find(message => message.message_id === 9);
        if (targetMessage) {
          console.log('observe:目标信息存在');
          scrollToMessage(targetMessage);
        } */
      


}

// 滚动到指定消息的位置
/*     function scrollToMessage(message_id) {
      if (message_id) {
        console.log('看下messagewrapper',messagesWrapper.value);
        console.log('messageElements',messageElements.value);
        const messageElement = messageElements.find(message => message.message_id === message_id);

        //const messageElement = messagesWrapper.value.querySelector(`[data-id="${message_id}"]`);
        console.log('找到了messageElement:',messageElement);
        if (messageElement) {
          const offsetTop = messageElement.offsetTop - messagesWrapper.value.offsetTop;
          console.log('offsetTop',offsetTop);
          messagesWrapper.value.scrollTop = offsetTop;
        }
      }
    } */


function reply(id) {//参数id是被回复的消息标号
  props.sendMessage_reply(id);
}

function check_reply_chat(id){
  props.check_reply(id);
  // 这里可能要等待一会儿
  setTimeout(() => {
    
    ReplyList = props.messageToChat.replyNumber;
  showReplyList.value = true;

  }, 500);

  

}
function check_read(messageID,sender_class){
  props.getReadList(messageID);
  // 这里可能要等待一会儿

  setTimeout(() => {
    let ReadIDs = props.messageToChat.readList; // 从 props 中获取字符串形式的用户 id
    
    if(props.messageToChat.is_friend===1){//私聊
      if(sender_class==='sender'){
        let readCount = (ReadIDs.match(/,/g) || []).length; // 计算逗号的个数
          if(readCount<1){
           ReadList='对方未读';
          }
          else ReadList='对方已读';
      }
      else{
        ReadList='对方已读(这是对方发送的消息)';
      }
      
    }

    else {//群聊
    // 使用 split() 方法将字符串分割成子字符串数组，并使用 map() 方法将每个子字符串转换为数字
    ReadList='已读用户:';
    let ReadIDsArray = ReadIDs.split(',').map(id => Number(id.trim()));
    console.log('转化后的已读用户id数组',ReadIDsArray); // 输出转换后的数字数组
    
    ReadIDsArray.forEach(e => {
      axios({
        url: 'https://CookieIMBackend-Cookie.app.secoder.net/searchfriends/',
        params: {
          id: e
        },
      method: 'get'
    })
    .then((response) => {
      console.log(response.data);
      if (response.data['status'] === 'no such user') {
        ElMessage.error('不存在该用户');
        return;
      }
      
    
      ReadList += response.data['candidate'][0].username;
      console.log(response.data['candidate'][0].username);
      ReadList+=' ';
      console.log(ReadList);
    })
    .catch((error) => {
      console.error(error);
    });
    
    }); 
  }
  





    setTimeout(() => {
    
      showReadList.value=true;

  }, 100);
    

  }, 500);
 
}
function hidePopover() {
  // 悬浮窗隐藏时，重置回复列表并隐藏
  ReplyList = 0;
  showReplyList.value = false;
  ReadList = '';
  showReadList.value = false;
}



</script>

<style scoped>
.scrollbar-wrapper {
  height: 100%;
}

.messages-wrapper {
  height: 100%;
  overflow-y: auto;
}

.message {
  margin-bottom: 10px;
  display:flex;
  flex-direction: column;
 /*  align-items: center; */
}
.AvatarAndText{
  margin-bottom: 10px;
  display: flex;
  flex-direction: row;
  /* align-items: center; */
}
.message-content {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  /* align-items: center; */
  margin-bottom: 10px;
}

.message-sender {
  justify-content: flex-end;
}

.message-receiver {
  justify-content: flex-start;
}

.message-else {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}
.Avatar {
  margin-right: 5px;
  width: 37px;
  height: 37px;
  border-radius: 50%;
}

.message-time {
 /*  margin-left: 5px; */
  color:gray;
  font-size:10px;
}


.message-text {
  font-size:15px;
  border-radius: 10px;
  padding: 8px 12px;
  display: inline-block;
  max-width: 70%;
}
</style>
