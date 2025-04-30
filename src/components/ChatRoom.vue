<template>
  <div class="chat-container">
    <el-container>
      <el-aside>
        <el-row style="height: 100%;" class="tac">
          <el-col style="height: 100%;" :span="7">
            <el-menu style="height: 100%; background-color: rgb(46,46,46); width: 100%;">
              <el-menu-item style="width: 100%;" @click="selectchatinfo"><el-icon style="color: rgb(107,107,107);">
                  <ChatRound />
                </el-icon></el-menu-item>
              <el-menu-item style="width: 100%;" @click="selectfriendinfo"><el-icon style="color: rgb(107,107,107);">
                  <User />
                </el-icon></el-menu-item>
              
              <el-menu-item style="width: 100%; bottom: 0;" @click="settingdialogvisible = true"><el-icon
                  style="color: rgb(107,107,107);">
                  <MoreFilled />
                </el-icon></el-menu-item>
              
                <el-dialog v-model="settingdialogvisible">
                <el-button @click="logout">登出</el-button>
                <el-button @click="self">个人信息</el-button>
                <el-button @click="farewell">注销</el-button>
              </el-dialog>
              <!-- pop out self info dialog -->
            </el-menu>
          </el-col>
          <!-- side info buttons -->
          
          <el-col style="height: 100%;" :span="17">
            <el-container style="width: 100%; height: 5%; background-color: rgb(247,247,247)">
              <el-input v-model="searchchatInput" style="width: 75%; height: 100%;" v-if="selectedInfo === 0"></el-input>

              <el-input v-model="tagfilterInput" style="width: 75%; height: 100%;" v-if="selectedInfo === 1"></el-input>


              <el-button style="width: 20%; right: 0; height: 100%; background-color: rgb(226,226,226);"
                @click="creategroupdialogvisible = true" v-if="selectedInfo === 0"><el-icon
                  style="color: rgb(113,113,113);">
                  <Plus />
                </el-icon></el-button>
              <el-dialog v-model="creategroupdialogvisible">
                <el-checkbox-group v-model="potentialgroup_uid_list">
                  <el-checkbox v-for="frd in friend" :label="frd.uid" :key="frd.username">
                    {{ frd.username }}
                  </el-checkbox>
                </el-checkbox-group>
                <el-button @click="createGroup">创建群聊</el-button>
              </el-dialog>
              <!-- create group + -->

              <el-button style="width: 10%; right: 0; height: 100%; background-color: rgb(226,226,226);"
                @click="use_tag_filter=true; filter_friend()" v-if="selectedInfo === 1"><el-icon><Filter /></el-icon></el-button>

              <el-button style="width: 10%; right: 0; height: 100%; background-color: rgb(226,226,226);"
                @click="searchdialogvisible = true" v-if="selectedInfo === 1"><el-icon style="color: rgb(113,113,113);">
                <Plus />
                </el-icon></el-button>
              <el-dialog v-model="searchdialogvisible">
                <el-input v-model="searchfriendInput" placeholder="搜索好友" style="width: 70%;"></el-input><el-button
                  @click="searchfriend" style="width: 20%; background-color: rgb(226,226,226);"><el-icon
                    style="color: rgb(113,113,113);">
                    <Search />
                  </el-icon></el-button>
                <el-card style="width: 100%; height: 90%; " v-if="searchcandidate.length > 0">
                  <el-descriptions>
                    <el-descriptions-item label="用户名"> {{ searchcandidate[0].username }}
                    </el-descriptions-item>
                    <el-descriptions-item label="用户ID"> {{ searchcandidate[0].id }} </el-descriptions-item>
                    <el-descriptions-item label="手机号"> {{ searchcandidate[0].phone }} </el-descriptions-item>
                    <el-descriptions-item label="邮箱"> {{ searchcandidate[0].mail }} </el-descriptions-item>
                    <el-descriptions-item label="头像"> <img :src="avatarSearch" alt="Avatar" style="width: 100px; height: 100px;"> </el-descriptions-item>
                  </el-descriptions>
                </el-card>
                <el-button style="width: 10%;" @click="sendfriendrequest(searchcandidate[0])">+</el-button>
              </el-dialog>
              <!-- search friend + -->
            </el-container>

            <ChatList :unreadmessages_number="unreadmessages_number":Group="chat" :select-chat="selectChat" :uid="uid" v-if="selectedInfo === 0" />

            <el-button v-if="selectedInfo === 1" style="width: 100%; height: 7%;" @click="selectedFriendInfo = 1">新的好友</el-button>

            <FriendList :Friends="friend" :select-friend="selectFriend" v-if="selectedInfo === 1 && use_tag_filter == false" />
            <FriendList :Friends="filtered_friend" :select-friend="selectFriend" v-if="selectedInfo === 1 && use_tag_filter == true" />
          

          </el-col>
        </el-row>
      </el-aside>
      <!-- aside box -->

      <el-container width="500px">
        <el-header v-if="selectedInfo === 0">
          <el-text v-if="selectedChatIndex === -1">选择会话以开始聊天</el-text>
          <el-text v-else-if="selectedChat[0].is_friend === 0" style="width: 70%;">{{ selectedChat[0].group_name }}</el-text>
          <el-text v-else-if="selectedChat[0].uid_list[0] === uid">与 {{ selectedChat[0].username_list[1] }} 的聊天</el-text>
          <el-text v-else>与 {{ selectedChat[0].username_list[0] }} 的聊天</el-text>


          <el-button v-if="selectedChatisGroup === true" style="width: 5%; right: 0%;" @click="groupinfovisible = true; getgroupinfo();"><el-icon
              style="color: rgb(107,107,107);">
              <MoreFilled />
            </el-icon></el-button>
          <el-dialog v-model="groupinfovisible">
            <el-text>群聊名: {{ selectedChat[0].group_name }}</el-text><br>
            <el-button @click="changegroupnamevisible=true">修改群名</el-button><br>
            <el-dialog v-model="changegroupnamevisible">
              <el-input v-model="potential_groupname"></el-input>
              <el-button @click="changegroupnamevisible=false; changegroupname()">确认</el-button>
            </el-dialog>

            <el-text>历史群公告:</el-text><br>
            <ul>
              <li v-for="(post, index) in selectedChat[0].posts" :key="index">
                <el-text>{{ post.content }}, 时间: {{ post.time }}</el-text>
              </li>
            </ul>
            
            <el-button @click="changepostvisible=true">修改群公告</el-button> <br>
            <el-dialog v-model="changepostvisible">
              <el-input v-model="potential_post"></el-input>
              <el-button @click="changepostvisible=false; changepost()">确认</el-button>
            </el-dialog>

            <el-text>群成员:</el-text><br>
            <ul>
              <li v-for="(frd_id, index) in selectedChat[0].uid_list" :key="index">
                <img :src="avatarGroup[index]" alt="" style="width: 30px; height: 30px;">
                <el-text>用户ID: {{ frd_id }} 用户名: {{ selectedChat[0].username_list[index] }}</el-text>
                <el-button @click="sendfriendrequest({id: frd_id})"><el-icon>
                    <Plus />
                  </el-icon></el-button>
                <el-button @click="delete_member(frd_id)"><el-icon style="color: rgb(107,107,107);"><DeleteFilled /></el-icon></el-button>
                <el-button v-if="selectedChatisMyGroup === true" @click="transfer_root(frd_id)">转让群主给他</el-button>
              </li>
            </ul>

            <el-button @click="invitememberdialogvisible = true">邀请成员入群</el-button> <br>
            <el-dialog v-model="invitememberdialogvisible">
              <el-checkbox-group v-model="potentialgroup_invite_list">
                  <el-checkbox v-for="frd in friend" :label="frd.uid" :key="frd.username">
                    {{ frd.username }}
                  </el-checkbox>
                </el-checkbox-group>
                <el-button @click="invite_member">确认邀请好友</el-button>
              </el-dialog>
            <!-- invite member -->

            <el-button v-if="selectedChatisMyAdminGroup === true || selectedChatisMyGroup === true" @click="pendinglistdialogvisible=true">查看等待列表</el-button> <br>
            <el-dialog v-model="pendinglistdialogvisible">
              <ul>
                <li v-for="(pending_id, index) in selectedChat[0].pending_list" :key="index">
                  <el-text>用户ID: {{ pending_id }} 用户名: {{ selectedChat[0].pending_name[index] }}</el-text>
                  <el-button @click="accept_invite(pending_id)"><el-icon>
                      <Check />
                    </el-icon></el-button>
                </li>
              </ul>
            </el-dialog>
            <!-- pending list -->

            <el-text>管理员:</el-text><br>
            <ul>
              <li v-for="(admin_id, index) in selectedChat[0].admin_list" :key="index">
                <el-text>用户ID: {{ admin_id }} 用户名: {{ selectedChat[0].admin_name[index] }}</el-text>
              </li>
            </ul>

            <el-button @click="setadmindialogvisible = true" v-if="selectedChatisMyGroup === true">设置管理员</el-button> <br>
              <el-dialog v-model="setadmindialogvisible">
                <el-checkbox-group v-model="potentialgroup_admin_list">
                  <el-checkbox v-for="(frd_id, index) in selectedChat[0].uid_list" :key="selectedChat[0].uid_list[index]" :label="frd_id">
                    {{ selectedChat[0].username_list[index] }}
                  </el-checkbox>
                </el-checkbox-group>
                <el-button @click="setadmin">确认设置管理员</el-button>
              </el-dialog>
              <!-- admins -->

            <el-button v-if="selectedChatisMyGroup === false" @click="leave_group">退出群聊</el-button> <br>
            <el-button v-if="selectedChatisMyGroup === true" @click="break_group">解散群聊</el-button>
  
          </el-dialog>
          <!-- groupinfo -->

          <el-button v-if="Number(selectedChatIndex) !== -1" style="width: 5%; right: 0%;" @click="historyvisible = true; use_history_filter=false"><el-icon style="color: rgb(107,107,107);">
            <ChatLineRound />
            </el-icon></el-button>
          <el-dialog v-model="historyvisible" >
            <el-text>历史消息</el-text><br>
            
            <el-date-picker v-model="history_filter_date" type="date" placeholder="选择日期" :size="small"></el-date-picker>
            

            <el-input v-if="selectedChatisGroup === true" v-model="history_filter_sender" placeholder="输入消息发送者"></el-input>
            <el-button @click="use_history_filter=true; filter_history();">筛选</el-button><br>
            
            <ul v-if="use_history_filter === false">
              <li v-for="(message, index) in history_messages[selectedChatIndex]" :key="index">
                <el-text>{{ message.sender_username }} : {{ message.text }}, 时间: {{ message.time }}</el-text> <button @click="deleteMessage(message.message_id,message.group_id)">删除</button>             </li>
            </ul>
            <!-- <ul v-if="use_history_filter === false">
              <li v-for="(message, index) in history_messages[selectedChatIndex]" :key="index">
                <el-text>{{ message.text }}, 时间: {{ message.time }}</el-text>              </li>
            </ul> -->

            <ul v-else>
              <li v-for="(message, index) in filtered_messages" :key="index">
                <el-text>{{ message.sender_username }} : {{ message.text }}, 时间: {{ message.time }}</el-text>
              </li>
            </ul>
            <!-- <ul v-else>
              <li v-for="(message, index) in filtered_messages" :key="index">
                <el-text>{{ message.text }}, 时间: {{ message.time }}</el-text>
              </li>
            </ul> -->
          </el-dialog>
          <!-- history_message -->

        </el-header>
        <!-- header -->

        
        
        <el-main class="chat-messages" v-if="selectedInfo === 0">
          <Chat :messageToChat="messageToChat":getReadList="getReadList":messages="messages":sendMessage_reply="sendMessage_reply":check_reply="check_reply"/>

      </el-main>
        <!-- chat info -->

        <div style="width: 100%; height: 100%; " v-else-if="selectedInfo === 1 && selectedFriendInfo === 0">
          <h2>好友信息</h2>
          <el-card style="width: 100%; height: 84%; ">
            <el-descriptions>
              <el-descriptions-item label="好友名"> {{ selectedFriend.username }} </el-descriptions-item><br>
              <el-descriptions-item label="好友ID"> {{ selectedFriend.uid }} </el-descriptions-item>
              <el-descriptions-item label="好友标签"> {{ selectedFriend.tag }}</el-descriptions-item>
            </el-descriptions>

            <el-button @click="changetagdialogvisible = true">修改标签</el-button> <br>
            <el-dialog v-model="changetagdialogvisible">
              <el-input v-model="potential_tag"></el-input>
              <el-button @click="changetagdialogvisible=false; changetag(selectedFriend.uid)">确认</el-button>
            </el-dialog>

            <el-button @click="deletefriend">删除好友</el-button>

          </el-card>
        </div>
        <!-- friend info -->

        <div v-else-if="selectedInfo === 1 && selectedFriendInfo === 1">
          <h2>新的好友</h2>
          <ul style="width: 100%;">
            <li style="width: 100%;" v-for="(frd, index) in potentialFriend" :key="index">
              <el-text style="width: 10%;">发送者：{{ frd.sender_username }}，接收者：{{ frd.receiver_username }}   </el-text>
              <el-button style="width: 10%;" v-if="Number(frd.status) === 0" @click="acceptFriend(frd)"><el-icon>
                  <Check />
                </el-icon></el-button>
              <el-button style="width: 10%;" v-if="Number(frd.status) === 0" @click="rejectFriend(frd)"><el-icon>
                  <Close />
                </el-icon></el-button>
              <el-text v-else-if="Number(frd.status) === 1">已接受</el-text>
              <el-text v-else-if="Number(frd.status) === 2">已拒绝</el-text>
            </li>
          </ul>
        </div>
        <!-- potential friend info -->

        <el-footer class="input-container" v-if="selectedInfo === 0">
          <div style="position: relative;">
            <el-input type="textarea" v-model="messageInput" placeholder="开始聊天吧~"
              style="width: 100%; height: 100%;" :rows="6" />
            <el-button style="position: absolute; bottom: 0; right: 0;" @click="sendMessage">
              <el-text class="mx-1" type="success">发送</el-text>
            </el-button>
          </div>
        </el-footer>
        <!-- message input box -->
      </el-container>
    </el-container>
  </div>
</template>

<script setup>

import { ref, onMounted, nextTick, onBeforeUnmount} from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus'

import axios from 'axios';
import ChatList from './ChatList.vue';
import Chat from './Chat.vue';


const messageInput = ref('');
const searchchatInput = ref('');
const searchfriendInput = ref('');
const websocket = ref(null);
const uid = ref(0);
const messages = ref([]);
const selectedChatIndex = ref(-1);
const selectedFriend = ref({});

const groupofmessages = ref([]);
const history_messages = ref([]);
const unreadmessages_number=ref([]);//每个group下的未读消息数

const selectedInfo = ref(0);
const selectedFriendInfo = ref(0);

const searchdialogvisible = ref(false);
const settingdialogvisible = ref(false);
const creategroupdialogvisible = ref(false);
const groupinfovisible = ref(false);
const historyvisible = ref(false);
const changepostvisible = ref(false);
const changegroupnamevisible = ref(false);
const setadmindialogvisible = ref(false);
const invitememberdialogvisible = ref(false);
const pendinglistdialogvisible = ref(false);
const changetagdialogvisible = ref(false);

const tagfilterInput = ref('');
const use_tag_filter = ref(false);
const filtered_friend = ref([]);
const history_filter_date = ref('');
const history_filter_sender = ref('');
const use_history_filter = ref(false);
const filtered_messages = ref([]);
const potential_post = ref('');
const potential_groupname = ref('');
const potential_tag = ref('');

const avatarSearch = ref(null);
const avatarGroup = ref([]);
const avatar_messageid=ref(null);

const router = useRouter();

const friend = ref([]);
const potentialFriend = ref([]);
const potentialgroup_uid_list = ref([]);
const potentialgroup_admin_list = ref([]);
const potentialgroup_invite_list = ref([]);
const friend_tag_list = ref([]);

const chat = ref([]);

const selectedChat = ref([]);
const selectedChatisGroup = ref(false);
const selectedChatisMyGroup = ref(false); // I am the root of this group
const selectedChatisMyAdminGroup = ref(false); // I am the admin of this group


const searchcandidate = ref([]);
let NewestMessageID=-1;//我发送的最新一条消息


let messageToChat = {
    Reply_Message_ID: -1,//查询的消息是回复谁的
    replyNumber: 0,//消息被多少人回复
    readList: '',//消息阅读列表
    is_friend:-1
    //selectedChat.value[0].is_friend
    
};

onMounted(() => {
  if (sessionStorage.getItem('uid') === null) {
    router.push('/illegal');
  }

  axios.defaults.withCredentials = true;
  uid.value = Number(sessionStorage.getItem('uid'));
  console.log('my uid:', uid.value);

  groupofmessages.value = [];
  history_messages.value = [];
  unreadmessages_number.value=[];
  let i=0;
  for(i=0;i<300;i++){
    unreadmessages_number.value[i]=0;//先默认设置300个群的未读数为0
  }

  connectWebSocket();
});



onBeforeUnmount(() => {
  websocket.value.close();
  localStorage.setItem('groupofmessages', JSON.stringify(groupofmessages.value));
});

// functions about self

// to self page
function self() {
  router.push('/self');
}

function logout() {
  axios.get('https://CookieIMBackend-Cookie.app.secoder.net/out/')
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
  sessionStorage.removeItem('uid');
  router.push('/into/');
}

// functions about group and chat

// create group
function createGroup() {
  console.log('Create group input changed:', potentialgroup_uid_list.value);

  // find friend name by id in friend list
  const target_friend = friend.value.filter(friend => friend.uid === potentialgroup_uid_list.value[0]);
  const target_friend_name = target_friend[0].username;

  //const group_name = sessionStorage.getItem('username') + ' and ' + target_friend_name + ' and ...';
  const group_name = sessionStorage.getItem('username') + '和' + target_friend_name + '和...的群';

  setTimeout(() => {
    console.log('group_name:', group_name);
  }, 200);

  const new_peoplelist = ref([Number(sessionStorage.getItem('uid'))]);

  if (potentialgroup_uid_list.value.length < 2) {
    console.log('No friends selected.');
    ElMessage.error('请至少选择两个好友');
    return;
  }

  for (let i = 0; i < potentialgroup_uid_list.value.length; i++) {
    new_peoplelist.value.push(Number(potentialgroup_uid_list.value[i]));
  }

  console.log('new_peoplelist:', new_peoplelist.value);

  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/creategroup/',
    data: {
      is_friend:0,
      group_name: group_name,
      peoplelist: new_peoplelist.value
    },
    method: 'post'
  })
    .then((response) => {
      console.log(response.data);

      const new_data = {
        text: 'anything',
        type: 'group',
        group_id: response.data.group_id,
        uid_list: new_peoplelist.value,
        is_friend: 0

      };
      console.log('create group message:', new_data);
      websocket.value.send(JSON.stringify(new_data));
    })
    .catch((error) => {
      console.error(error);
    });
}

// set admin
function setadmin() {
  console.log('Set admin input changed:', potentialgroup_admin_list.value);

  for (let i=0; i<potentialgroup_admin_list.value.length; i++)
  {
    if (Number(potentialgroup_admin_list.value[i]) === Number(sessionStorage.getItem('uid')))
    {
      ElMessage.error('不能设置自己为管理员');
      return;
    }
    if (selectedChat.value[0].admin_list.includes(Number(potentialgroup_admin_list.value[i])) === true)
    {
      ElMessage.error('有用户已经是管理员');
      return;
    }
  }
  for (let i=0; i<potentialgroup_admin_list.value.length; i++)
  {
    const set_admin_message = {
      type: 'set_admin',
      group_id: Number(selectedChat.value[0].group_id),
      uid: Number(potentialgroup_admin_list.value[i]),
      text: 'anything'
    };
    console.log('send set admin message:', set_admin_message);
    websocket.value.send(JSON.stringify(set_admin_message));
  }
}



// invite member
function invite_member()
{
  if (potentialgroup_invite_list.value.length === 0)
  {
    ElMessage.error('请至少邀请一个好友');
    return;
  }
  if (selectedChatIndex.value === -1)
  {
    ElMessage.error('请先选择一个群聊');
    return;
  }

  for (let i=0; i<potentialgroup_invite_list.value.length; i++)
  {
    if (selectedChat.value[0].uid_list.includes(Number(potentialgroup_invite_list.value[i])) === true)
    {
      ElMessage.error('有用户已经在群聊中');
      return;
    }
  }

  for (let i=0; i<potentialgroup_invite_list.value.length; i++)
  {
    const invite_member_message = {
      type: 'invite_member',
      group_id: selectedChat.value[0].group_id,
      new_uid: Number(potentialgroup_invite_list.value[i]),
      text: 'anything'
    };
    console.log('invite_member_message:', invite_member_message);
    websocket.value.send(JSON.stringify(invite_member_message));

    // update pending list
    const new_username = friend.value.filter(friend => friend.uid === potentialgroup_invite_list.value[i])[0].username;
    selectedChat.value[0].pending_list.push(Number(potentialgroup_invite_list.value[i]));
    selectedChat.value[0].pending_name.push(new_username);
  }

  
}


// get group info
function getgroupinfo() {
  // get avatars
  console.log('selectedChatIndex:', selectedChatIndex.value);
  selectedChat.value = chat.value.filter(chat => chat.group_id === selectedChatIndex.value);

    // check group info, get certain group info
    const group_info = {
    type: 'get_group_info',
    group_id: selectedChat.value[0].group_id,
    text: 'anything'
  };
  console.log('sending get group_info:', group_info);
  websocket.value.send(JSON.stringify(group_info));


  for (let i = 0; i < selectedChat.value[0].uid_list.length; i++) {
    axios({
      url: 'https://CookieIMBackend-Cookie.app.secoder.net/get_user_avatar/',
      data: { uid: Number(selectedChat.value[0].uid_list[i]) },
      method: 'post',
      responseType: 'blob'
    })
      .then(response => {
        console.log('头像获取成功', response);
        const imageUrl = URL.createObjectURL(response.data);
        avatarGroup.value[i] = imageUrl;
      })
      .catch(error => {
        console.error('头像获取失败:', error);
      });
  }

  // others
}


// filter history messages
function filter_history() {
  console.log('filter_history:', history_filter_date.value, history_filter_sender.value);
  filtered_messages.value = history_messages.value[selectedChatIndex.value];//全部历史记录

  if (history_filter_date.value ===null||history_filter_date.value ==='') {
    console.log('日期为空,history_filter_date.value:',history_filter_date.value);
    filtered_messages.value = history_messages.value[selectedChatIndex.value];
  }
  else{
    console.log('日期不为空',history_filter_date.value);
    const filter_date = new Date(history_filter_date.value);
    filtered_messages.value = filtered_messages.value.filter(message => {
      const message_date = new Date(message.time);
      console.log('message_date:', message_date);
      console.log('filter_date:', filter_date);
      return (message_date.getFullYear() === filter_date.getFullYear() && message_date.getMonth() === filter_date.getMonth() && message_date.getDate() === filter_date.getDate());
    }); // filter by date
  }
 
  console.log('filtered_messages after date:', filtered_messages.value);

  if (history_filter_sender.value === '')
    return;

  filtered_messages.value = filtered_messages.value.filter(message => {
    return message.sender_username === history_filter_sender.value;
  }); // filter by sender
  console.log('filtered_messages after sender:', filtered_messages.value);
}


// change group post
function changepost()
{
  if (potential_post.value === '')
  {
    ElMessage.error('不能创建空群公告');
    return;
  }
  if (selectedChatIndex.value === -1)
  {
    ElMessage.error('请先选择一个群聊');
    return;
  }
  if (Number(selectedChat.value[0].root) !== Number(sessionStorage.getItem('uid')) && selectedChat.value[0].admin_list.includes(Number(sessionStorage.getItem('uid'))) === false)
  {
    ElMessage.error('你不是群聊的管理员或群主');
    return;
  }

  const post_message = {
    type: 'set_post',
    group_id: selectedChat.value[0].group_id,
    post: potential_post.value,
    text: 'anything',
    uid: Number(sessionStorage.getItem('uid'))
  };
  console.log('post_message:', post_message);
  websocket.value.send(JSON.stringify(post_message));
}

// change group name
function changegroupname() {
  if (potential_groupname.value === '')
  {
    ElMessage.error('群名不能为空');
    return;
  }
  if (selectedChatIndex.value === -1)
  {
    ElMessage.error('请先选择一个群聊');
    return;
  }
  const group_name_message = {
    type: 'set_group_name',
    group_id: selectedChat.value[0].group_id,
    groupname: potential_groupname.value,
    text: 'anything'
  };

  console.log('group_name_message:', group_name_message);
  websocket.value.send(JSON.stringify(group_name_message));
}


// transfer root
function transfer_root(frd_id) {
  if (Number(frd_id) === Number(sessionStorage.getItem('uid')))
  {
    ElMessage.error('不能转让给自己');
    return;
  }
  if (selectedChatIndex.value === -1)
  {
    ElMessage.error('请先选择一个群聊');
    return;
  }
  if (Number(selectedChat.value[0].root) !== Number(sessionStorage.getItem('uid')))
  {
    ElMessage.error('你不是群主');
    return;
  }
  if (selectedChat.value[0].uid_list.includes(Number(frd_id)) === false)
  {
    ElMessage.error('该用户不在群聊中');
    return;
  }

  const transfer_root_message = {
    type: 'transfer_root',
    group_id: selectedChat.value[0].group_id,
    root: Number(frd_id),
    text: 'anything'
  };
  console.log('transfer_root_message:', transfer_root_message);
  websocket.value.send(JSON.stringify(transfer_root_message));

  selectedChatisMyGroup.value = false; // change group info
}

// accept invite
function accept_invite(frd_id)
{
  if (selectedChatIndex.value === -1)
  {
    ElMessage.error('请先选择一个群聊');
    return;
  }

  if (selectedChat.value[0].root !== Number(sessionStorage.getItem('uid')) && selectedChat.value[0].admin_list.includes(Number(sessionStorage.getItem('uid'))) === false)
  {
    ElMessage.error('你不是群主或管理员，无法接受进群邀请');
    return;
  }

  const accept_invite_message = {
    type: 'accept_invite',
    group_id: selectedChat.value[0].group_id,
    new_uid: Number(frd_id),
    text: 'anything'
  };
  console.log('accept_invite_message:', accept_invite_message);
  websocket.value.send(JSON.stringify(accept_invite_message));
}


// delete member
function delete_member(frd_id) {
  if (Number(frd_id) === Number(sessionStorage.getItem('uid')))
  {
    ElMessage.error('不能移出自己');
    return;
  }
  if (selectedChatIndex.value === -1)
  {
    ElMessage.error('请先选择一个群聊');
    return;
  }
  if (Number(selectedChat.value[0].root) !== Number(sessionStorage.getItem('uid')) && selectedChat.value[0].admin_list.includes(Number(sessionStorage.getItem('uid'))) === false)
  {
    ElMessage.error('你不是群聊的管理员或群主');
    return;
  }
  if (selectedChat.value[0].admin_list.includes(Number(sessionStorage.getItem('uid'))) === true && (Number(frd_id) === Number(selectedChat.value[0].root) || selectedChat.value[0].admin_list.includes(Number(frd_id)) === true) && Number(selectedChat.value[0].root) !== Number(sessionStorage.getItem('uid'))) // admin(not root) can only delete normal member
  {
    ElMessage.error('你只能移出普通成员');
    return;
  }
  // if (selectedChat.value[0].uid_list.length === 3)
  // {
  //   ElMessage.error('群聊只剩三人，请选择解散群聊');
  //   return;
  // }
  const delete_member_message = {
    type: 'delete_member',
    group_id: selectedChat.value[0].group_id,
    member_id: Number(frd_id),
    text: 'anything'
  };
  console.log('delete_member_message:', delete_member_message);
  websocket.value.send(JSON.stringify(delete_member_message));

  // change selectedChat
  // find index first
  const new_uid_list = selectedChat.value[0].uid_list.filter(uid => uid !== Number(frd_id));
  const new_username_list = selectedChat.value[0].username_list.filter((username, index) => selectedChat.value[0].uid_list[index] !== Number(frd_id));
  selectedChat.value[0].uid_list = new_uid_list;
  selectedChat.value[0].username_list = new_username_list;
  const new_admin_list = selectedChat.value[0].admin_list.filter(admin => admin !== Number(frd_id));
  const new_admin_name = selectedChat.value[0].admin_name.filter((admin_name, index) => selectedChat.value[0].admin_list[index] !== Number(frd_id));
  selectedChat.value[0].admin_list = new_admin_list;
  selectedChat.value[0].admin_name = new_admin_name;
}

// leave group
function leave_group()
{
  if (selectedChatIndex.value === -1)
  {
    ElMessage.error('请先选择一个群聊');
    return;
  }
  const leave_group_message = {
    type: 'leave',
    group_id: Number(selectedChat.value[0].group_id),
    text: 'anything'
  };
  console.log('leave_group_message:', leave_group_message);
  websocket.value.send(JSON.stringify(leave_group_message));

  // change selectedChat
}

// break group
function break_group()
{
  if (selectedChatIndex.value === -1)
  {
    ElMessage.error('请先选择一个群聊');
    return;
  }
  if (Number(selectedChat.value[0].root) !== Number(sessionStorage.getItem('uid')))
  {
    ElMessage.error('你不是群主');
    return;
  }
  const break_group_message = {
    type: 'break_group',
    group_id: Number(selectedChat.value[0].group_id),
    uid_list: selectedChat.value[0].uid_list,
    text: 'anything'
  };

  console.log('break_group_message:', break_group_message);
  websocket.value.send(JSON.stringify(break_group_message));
}


// functions about friend

function filter_friend() {
  console.log('Tag friend input changed:', tagfilterInput.value);
  if (tagfilterInput.value === '') {
    ElMessage.error('请输入筛选内容');
    use_tag_filter.value = false;
    return;
  }
  filtered_friend.value = friend.value.filter(friend => friend.tag === tagfilterInput.value);
}

// delete friend
function deletefriend() {
  console.log('Delete friend input changed:', selectedFriend.value);

  // traverse chat list to find group id
  const target_chat_id = ref(0);

  chat.value.forEach((chat) => {
    if (chat.uid_list.includes(Number(selectedFriend.value.uid)) && chat.uid_list.includes(Number(sessionStorage.getItem('uid'))) && chat.uid_list.length === 2) {
      target_chat_id.value = chat.group_id;
    }
  });

  if (target_chat_id.value === selectedChatIndex.value) {
    messages.value = [];
    selectedChatIndex.value = -1;
  }

  /* axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/breakfriends/',
    data: {
      friend_id: selectedFriend.value.uid,
      group_id: target_chat_id.value
    },
    method: 'post',
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then((response) => {
      console.log(response.data);

      setTimeout(() => {
        getfriend();
        getgroup();

        const new_data = {
          text: 'anything',
          type: 'break_group',
          group_id: target_chat_id.value,
          uid_list: [Number(sessionStorage.getItem('uid')), Number(selectedFriend.value.uid)]
          };
        console.log('break group message:', new_data);
        websocket.value.send(JSON.stringify(new_data));
      }, 200);

    })
    .catch((error) => {
      console.error(error);
    }); */

    const delete_data = {
    type: 'break_friend',
    text: 'anything',
    friend_id: Number(selectedFriend.value.uid)
  }

  console.log('delete friend message:', delete_data);
  websocket.value.send(JSON.stringify(delete_data));

  const new_data = {
    text: 'anything',
    type: 'break_group',
    group_id: target_chat_id.value,
    uid_list: [Number(sessionStorage.getItem('uid')), Number(selectedFriend.value.uid)]
  };
  console.log('break group message:', new_data);
  websocket.value.send(JSON.stringify(new_data));

  setTimeout(() => {
    getfriend();
    getgroup();
  }, 200);


  selectedFriend.value = {};
}

// search friend
function searchfriend() {
  console.log('Search friend input changed:', searchfriendInput.value);
  if (searchfriendInput.value === '') {
    ElMessage.error('请输入搜索内容');
    return;
  }

  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/searchfriends/',
    params: {
      username: searchfriendInput.value
    },
    method: 'get'
  })
    .then((response) => {
      console.log(response.data);
      if (response.data['status'] === 'no such user') {
        ElMessage.error('不存在该用户');
        return;
      }
      searchcandidate.value = response.data['candidate'];
      fetchAvatar(searchcandidate.value[0].id);
    })
    .catch((error) => {
      console.error(error);
    });
};


// send friend request
function sendfriendrequest(frd) {
  const frd_data = {
    friend_id: frd.id
  }

  console.log('frd_data: ', frd_data);

  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/makefriends/',
    data: frd_data,
    method: 'post'
  })
    .then((response) => {
      console.log(response.data);
      if (response.data.status == 'success') {
        ElMessageBox.alert('好友申请发送成功', 'Success', {
          confirmButtonText: 'OK',
          type: 'success'
        });
        getfriend();
      }
      else {
        ElMessageBox.alert('好友申请发送失败', 'Error', {
          confirmButtonText: 'OK',
          type: 'error'
        });
      }
    })
    .catch((error) => {
      ElMessageBox.alert('好友申请发送失败', 'Error', {
        confirmButtonText: 'OK',
        type: 'error'
      });
      console.error(error);
    });
}

// accept friend request
function acceptFriend(frd) {
  console.log('frd.receiver_id', frd.receiver_id);

  if (Number(frd.receiver_id) !== Number(uid.value)) {
    console.log('This friend request is not for me.');
    ElMessage.error('该好友请求不是发给您的');
    return;
  }

  potentialFriend.value = potentialFriend.value.filter(friend => friend.sender_id !== frd.sender_id);
  const newFriend = {
    sender_id: frd.sender_id,
    receiver_id: frd.receiver_id,
    status: 1,
    sender_username: frd.sender_username,
    receiver_username: frd.receiver_username
  };
  potentialFriend.value.push(newFriend);

  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/handlefriends/',
    data: {
      friend_id: frd.sender_id,
      accept: true
    },
    method: 'post'
  })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });

  //const groupname = frd.sender_username + ' and ' + frd.receiver_username;
  const groupname = frd.sender_username + '和' + frd.receiver_username + '的私聊';

  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/creategroup/',
    data: {
      group_name: groupname,
      peoplelist: [Number(sessionStorage.getItem('uid')), Number(frd.sender_id)],
      is_friend: 1

    },
    method: 'post'
  })
    .then((response) => {
      console.log(response.data);

      const new_data = {
        text: 'anything',
        type: 'group',
        group_id: response.data.group_id,
        uid_list: [Number(sessionStorage.getItem('uid')), Number(frd.sender_id)],
        is_friend: 1
      };
      console.log('accept friend message:', new_data);
      websocket.value.send(JSON.stringify(new_data));
    })
    .catch((error) => {
      console.error(error);
    });
}

// reject friend request
function rejectFriend(frd) {
  console.log('frd.receiver_id', frd.receiver_id);

  if (Number(frd.receiver_id) !== Number(uid.value)) {
    console.log('This friend request is not for me.');
    return;
  }

  potentialFriend.value = potentialFriend.value.filter(friend => friend.sender_id !== frd.sender_id);
  const newFriend = {
    sender_id: frd.sender_id,
    receiver_id: frd.receiver_id,
    status: 2,
    sender_username: frd.sender_username,
    receiver_username: frd.receiver_username
  };
  potentialFriend.value.push(newFriend);

  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/handlefriends/',
    data: {
      friend_id: frd.sender_id,
      accept: false
    },
    method: 'post'
  })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error(error);
    });
}

// fetch avatar by uid
function fetchAvatar(frd_id) {
  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/get_user_avatar/',
    data: { uid: frd_id },
    method: 'post',
    responseType: 'blob'
  })
    .then(response => {
      console.log('头像获取成功', response);
      const imageUrl = URL.createObjectURL(response.data); // 从响应对象中获取 Blob 数据
      avatarSearch.value = imageUrl;
    })
    .catch(error => {
      console.error('头像获取失败:', error);
    });
}

function fetchAvatar_message_syn(sender_id) {
  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/get_user_avatar/',
    data: { uid: sender_id },
    method: 'post',
    responseType: 'blob'
  })
    .then(response => {
      console.log('头像获取成功', response);
      const imageUrl = URL.createObjectURL(response.data); // 从响应对象中获取 Blob 数据
      return imageUrl;
    })
    .catch(error => {
      console.error('头像获取失败:', error);
    });
}

async function fetchAvatar_message(sender_id) {
  console.log('in fetchAvatar_message');
  try {
    const response = await new Promise((resolve, reject) => {
      axios({
        url: 'https://CookieIMBackend-Cookie.app.secoder.net/get_user_avatar/',
        data: { uid: sender_id },
        method: 'post',
        responseType: 'blob'
      })
      .then(response => resolve(response))
      .catch(error => reject(error));
    });
    
    console.log('头像获取成功', response);
    const imageUrl = URL.createObjectURL(response.data); // 从响应对象中获取 Blob 数据
    return imageUrl;
  } catch (error) {
    console.error('头像获取失败:', error);
    return '';
    //throw error;
    
  }
}


// functions about info select

function selectchatinfo() {
  selectedInfo.value = 0;
  getgroup();
}

function selectfriendinfo() {
  selectedInfo.value = 1;
  selectedFriendInfo.value = 0;
  getfriend();
}

function selectChat(index) {
  // get certain group info
  console.log('selectChat type, get certain group info');
  const get_group_message = {
    type: 'get_group_info',
    group_id: index,
    text: 'anything'
  };
  console.log('Sending get group message:', get_group_message);
  websocket.value.send(JSON.stringify(get_group_message));

  selectedChatIndex.value = index;
  selectedChat.value = chat.value.filter(chat => chat.group_id === index);
  if (selectedChat.value[0].is_friend === 1)
  {
    selectedChatisGroup.value = false;
    selectedChatisMyGroup.value = false;
    selectedChatisMyAdminGroup.value = false;
  }
  else
  {
    selectedChatisGroup.value = true;
    if (Number(selectedChat.value[0].root) === Number(sessionStorage.getItem('uid')) )
    {
      selectedChatisMyGroup.value = true;
      selectedChatisMyAdminGroup.value = false;
    }
    else if (selectedChat.value[0].admin_list.includes(Number(sessionStorage.getItem('uid'))) === true)
    {
      selectedChatisMyGroup.value = false;
      selectedChatisMyAdminGroup.value = true;
    }
    else
    {
      selectedChatisMyGroup.value = false;
      selectedChatisMyAdminGroup.value = false;
    
    }
  }
  messages.value = groupofmessages.value[index] || [];
  unreadmessages_number.value[index]=0;
  /* if (Array.isArray(groupofmessages.value[index]) && groupofmessages.value[index].length > 0&&unreadmessages_number[index]>0) {
    console.log('选中的群聊有未读消息')
    groupofmessages.value[index].forEach(e => {
    read_message(e.message_id);
    });
  } */
  if (Array.isArray(groupofmessages.value[index]) && groupofmessages.value[index].length > 0 && unreadmessages_number[index] > 0) {
    console.log('选中的群聊有未读消息');
    let startIndex = groupofmessages.value[index].length - unreadmessages_number[index];
    let endIndex = groupofmessages.value[index].length;
    var ids=[];
    for (let i = startIndex; i < endIndex; i++) {
      ids.push_back(groupofmessages.value[index][i].message_id);
      pip_read_message(ids);
    }
  }



  

}





function selectFriend(frd) {
  selectedFriendInfo.value = 0;
  selectedFriend.value = frd;
}

// functions about get data

function getfriend() {
  axios.get('https://CookieIMBackend-Cookie.app.secoder.net/inspectgroupfriend/')
  .then((response) => {
    console.log(response.data);
    friend_tag_list.value = response.data.groupfriend;
    if (typeof friend_tag_list.value === 'string')
      friend_tag_list.value = JSON.parse(friend_tag_list.value);

    if (friend_tag_list.value === undefined)
      friend_tag_list.value = [];
  }).catch((error) => {
    console.error(error);
  });

  axios.get('https://CookieIMBackend-Cookie.app.secoder.net/inspectfriends/')
    .then((response) => {
      console.log(response.data);
      friend.value = [];
      potentialFriend.value = [];
      const friendData = response.data.friend_info;

      for (let i = 0; i < friendData.length; i++) {
        const new_potential_frd_data = {
          sender_id: friendData[i].sender_id,
          receiver_id: friendData[i].receiver_id,
          status: friendData[i].status,
          sender_username: friendData[i].sender_name,
          receiver_username: friendData[i].receiver_name,
          tag: ''
        }

        const frd_username = ref('');

        if (Number(friendData[i].receiver_id) === Number(uid.value) && friendData[i].status === 1)
          frd_username.value = friendData[i].sender_name;
        if (Number(friendData[i].sender_id) === Number(uid.value) && friendData[i].status === 1)
          frd_username.value = friendData[i].receiver_name;

        const friend_id = ref(0);

        if (Number(friendData[i].receiver_id) === Number(uid.value))
          friend_id.value = Number(friendData[i].sender_id);
        else
          friend_id.value = Number(friendData[i].receiver_id);

        // found tag in friend_tag_list, if not found key tag is ''
        
        let found = false;
        for (let j = 0; j < friend_tag_list.value.length; j++) {
          if (friend_tag_list.value[j].uid === friend_id.value) {
            new_potential_frd_data.tag = friend_tag_list.value[j].tag;
            found = true;
          }
        }
        if (found === false)
          new_potential_frd_data.tag = '';

        const new_frd_data = {
          uid: friend_id.value,
          username: frd_username.value,
          tag: new_potential_frd_data.tag
        }


        potentialFriend.value.push(new_potential_frd_data);

        if (Number(friendData[i].status) === 1)
          friend.value.push(new_frd_data);
      }
      console.log('friend:', friend);
      console.log('potential friend:', potentialFriend);

      // sort friend by tag
      friend.value.sort((a, b) => {
        return a.tag.localeCompare(b.tag);
      });

    })
    .catch((error) => {
      console.error(error);
    });
}
function changetag(frd_id) {
  let tag = potential_tag.value;
  console.log('frd_id:', frd_id);
  console.log('tag:', tag);
  if (tag === '')
  {
    ElMessage.error('标签不能为空');
    return;
  }

  // change friend_tag_list first, if not found add a new one
  let found = false;
  for (let i = 0; i < friend_tag_list.value.length; i++) {
    if (friend_tag_list.value[i].uid === frd_id) {
      friend_tag_list.value[i].tag = tag;
      found = true;
    }
  }
  if (found === false) {
    friend_tag_list.value.push({
      uid: frd_id,
      tag: tag
    });
  }
  // send change tag message
  axios({
    url: 'https://CookieIMBackend-Cookie.app.secoder.net/groupfriend/',
    data: {
      groupfriend: friend_tag_list.value
    },
    method: 'post'
  })
    .then((response) => {
      console.log(response.data);
      getfriend();
    })
    .catch((error) => {
      console.error(error);
    });
}

function getgroup() {
  // old version
  axios.get('https://CookieIMBackend-Cookie.app.secoder.net/insepectgroup/')
    .then((response) => {
      console.log(response.data);
      chat.value = [];
      avatarGroup.value = [];
      const groupData = response.data.group_info;
      // get max uid list length
      let max_uid_list_length = 0;
      for (let i = 0; i < groupData.length; i++) {
        if (JSON.parse(groupData[i].uid_list).length > max_uid_list_length)
          max_uid_list_length = JSON.parse(groupData[i].uid_list).length;
      }
      avatarGroup.value = new Array(max_uid_list_length);

      for (let i = 0; i<groupData.length; i++) {
        const get_group_message = {
          type: 'get_group_info',
          group_id: groupData[i].group_id,
          text: 'anything'
        };
        console.log('Sending get group message:', get_group_message);
        websocket.value.send(JSON.stringify(get_group_message));
      }

      // updateGroupData(groupData).then(() => {
      //   console.log('chat:', chat);
      // }).catch((error) => {
      //   console.error(error);
      // })
    })
    .catch((error) => {
      console.error(error);
    });

  // new version
}

function uid_to_username(uid) {
  return new Promise((resolve, reject) => {
    axios({
      url: 'https://CookieIMBackend-Cookie.app.secoder.net/searchfriends/',
      params: {
        id: Number(uid)
      },
      method: 'get'
    })
      .then((response) => {
        resolve(response.data['candidate'][0].username);
      })
      .catch((error) => {
        reject(error);
      });
  });
}


async function getUsernamesInBatch(uidBatches) {
  const allUsernames = await Promise.all(
    uidBatches.map(async (uids) => {
      const usernames = await Promise.all(uids.map(uid => uid_to_username(uid)));
      return usernames;
    })
  );
  return allUsernames;
}

/* async function updateGroupData(groupData) {
  const groupsWithUsernames = await Promise.all(
    groupData.map(async (group) => {
      const uidList = JSON.parse(group.uid_list);
      const usernames = await getUsernamesInBatch([uidList]);

      return {
        group_id: group.group_id,
        group_name: group.groupname,
        uid_list: uidList,
        username_list: usernames[0],
        posts: []
      };
    })
  );
  chat.value.push(...groupsWithUsernames);
} */

async function updateonegroupData(onegroupdata) {
  const uidList = JSON.parse(onegroupdata.uid_list);
  let adminList = onegroupdata.admin_list;

  let admin_name = [[]]

  if (typeof adminList === 'string')
    adminList = JSON.parse(adminList);

  if (adminList.length !== 0)
  {
    console.log('adminList:', adminList);
    admin_name = await getUsernamesInBatch([adminList]);
  }

  const uid_name = await getUsernamesInBatch([uidList]);

  if (typeof onegroupdata.posts === 'string')
    onegroupdata.posts = JSON.parse(onegroupdata.posts);
  const message_post = onegroupdata.posts;

  let pendingList = [];
  let pending_name = [[]];

  if (Number(onegroupdata.root) === Number(sessionStorage.getItem('uid')) || adminList.includes(Number(sessionStorage.getItem('uid'))) === true)
  {
    pendingList = onegroupdata.pending_list;
    if (typeof pendingList === 'string')
      pendingList = JSON.parse(pendingList);
    if (pendingList.length !== 0)
    {
      console.log('pendingList:', pendingList);
      pending_name = await getUsernamesInBatch([pendingList]);
    }
  }
  else
  {
    // do nothing
  }

  const groupsWithUsernames = {
    group_id: onegroupdata.group_id,
    group_name: onegroupdata.groupname,
    root: onegroupdata.root,
    admin_list: adminList,
    admin_name: admin_name[0],
    pending_list: pendingList,
    pending_name: pending_name[0],
    uid_list: uidList,
    username_list: uid_name[0],
    posts: message_post,
    is_friend: Number(onegroupdata.is_friend)
  }

  console.log('group:', groupsWithUsernames);
  let target_chat = groupsWithUsernames;
  // remove old target chat and push new one
  chat.value = chat.value.filter(chat => Number(chat.group_id) !== target_chat.group_id);
  chat.value.push(target_chat);
  console.log('chat:', chat);
  // fresh selected chat
  if (target_chat.group_id === selectedChatIndex.value)
    selectedChat.value = chat.value.filter(chat => chat.group_id === selectedChatIndex.value);

  return;
}




async function createNewMessage_instant(message) {
  console.log('in createNewMessage_instant');
  const message_group_idx = Number(message.group_id);
  const { uid1, username } = await uid_to_username(message.sender_id);
  //const avatar_url=await fetchAvatar_message(message.sender_id);
  let sender_class = '';
  
  if (Number(message.sender_id) !== Number(uid.value)) {
    sender_class = 'receiver';
  } else {
    sender_class = 'sender';
  }

  console.log('sender_class:', sender_class);

  const new_message = {
    text: message.text,
    senderClass: sender_class,
    sender_id: message.sender_id,
    sender_username: username,
    group_id: message.group_id,
    message_id: message.message_id,
    time: message.time,
    avatar:'https://s2.loli.net/2024/05/18/IVo9bzRiqJ7ASKv.jpg'
    

  };
  

  //console.log('new_message:', new_message);
  groupofmessages.value[message_group_idx].push(new_message);
  avatar_messageid.value=message.message_id;
  // sort messages by time
  groupofmessages.value[message_group_idx].sort((a, b) => {
    return new Date(a.time) - new Date(b.time);
  });

  
  if (message_group_idx === selectedChatIndex.value) // fresh the message list
    messages.value = groupofmessages.value[selectedChatIndex.value];
  
  // 查找 message_id 为 avatar_messageid.value 的消息
  const messageIndex = groupofmessages.value[message_group_idx].findIndex(
         message => message.message_id === avatar_messageid.value
        );

        if (messageIndex !== -1) {
          console.log('找到了需要更新头像的消息',groupofmessages.value[message_group_idx][messageIndex])
          updateNewMessageAvatar(message.sender_id,message_group_idx,messageIndex);
          //groupofmessages.value[message_group_idx][messageIndex].avatar=fetchAvatar_message_syn(avatar_messageid.value)
        }


}
async function updateNewMessageAvatar(sender_id,message_group_idx,messageIndex){
  groupofmessages.value[message_group_idx][messageIndex].avatar=await fetchAvatar_message(sender_id)
  if (message_group_idx === selectedChatIndex.value) // fresh the message list
    messages.value = groupofmessages.value[selectedChatIndex.value];
}


async function createNewMessage(message) {
  console.log('in createNewMessage');
  const message_group_idx = Number(message.group_id);
  const { uid1, username } = await uid_to_username(message.sender_id);
  const avatar_url=await fetchAvatar_message(message.sender_id);
  let sender_class = '';
  
  if (Number(message.sender_id) !== Number(uid.value)) {
    sender_class = 'receiver';
  } else {
    sender_class = 'sender';
  }

  console.log('sender_class:', sender_class);

  const new_message = {
    text: message.text,
    senderClass: sender_class,
    sender_id: message.sender_id,
    sender_username: username,
    group_id: message.group_id,
    message_id: message.message_id,
    time: message.time,
    avatar:avatar_url
    

  };
  

  //console.log('new_message:', new_message);
  groupofmessages.value[message_group_idx].push(new_message);
  
  // sort messages by time
  groupofmessages.value[message_group_idx].sort((a, b) => {
    return new Date(a.time) - new Date(b.time);
  });

  
  if (message_group_idx === selectedChatIndex.value) // fresh the message list
    messages.value = groupofmessages.value[selectedChatIndex.value];
}



async function createNewHistoryMessage(message) {
  const message_group_idx = Number(message.group_id);
  const senderUsername = await uid_to_username(message.sender_id);
  const new_message = {
    text: message.text,
    sender_id: message.sender_id,
    sender_username: senderUsername,
    group_id: message.group_id,
    message_id: message.message_id,
    time: message.time
  };

  console.log('new_message:', new_message);
  console.log('history_messages:', history_messages.value);
  console.log('history_messages[message_group_idx]:', history_messages.value[message_group_idx]);

  history_messages.value[message_group_idx].push(new_message);

  // sort messages by time
  history_messages.value[message_group_idx].sort((a, b) => {
    return new Date(a.time) - new Date(b.time);
  });

  
  console.log(history_messages.value);
}


function farewell()
{
  // get all is friend group id
  const is_friend_group_id = chat.value.filter(chat => chat.is_friend === 1).map(chat => Number(chat.group_id));
  console.log('is_friend_group_id:', is_friend_group_id);

  const farewell_message = {
    type: 'farewell',
    text: 'anything',
    group_list: is_friend_group_id
  }
  console.log('farewell_message:', farewell_message);
  websocket.value.send(JSON.stringify(farewell_message));

  // clear all data
  sessionStorage.clear();
  router.push('/');
}

// functions about websocket
function connectWebSocket() {
  const token_str = '?token=' + sessionStorage.getItem('uid');
  console.log('my token', token_str);
  websocket.value = new WebSocket('wss://CookieIMBackend-Cookie.app.secoder.net/chat/' + token_str);

  websocket.value.onopen = () => {
    console.log('WebSocket connection established.');

    getfriend();
    getgroup();

    // get history messages
    setTimeout(() => {
      chat.value.forEach((group) => {
        const history_message = {
            type: 'history',
            text: 'anything',
            group_id: Number(group.group_id)
          };
        console.log('Sending history message:', history_message);
        websocket.value.send(JSON.stringify(history_message));
      })
    }, 1000);
  };

  websocket.value.onmessage = (event) => {
    console.log(event);
    let message = JSON.parse(event.data);

    console.log(message);

    if (typeof message === 'string') {
      message = JSON.parse(message);
    }
   

    if (String(message.type) === 'receivegroup') {
      console.log('group type');
      getgroup();
      getfriend();
    }
    else if (String(message.type) === 'break_group')
    {
      console.log('break group type');
      getgroup();
      getfriend();
      const deleted_group_id = Number(message.group_id);
      if (deleted_group_id === selectedChatIndex.value) {
        messages.value = [];
        selectedChatIndex.value = -1;
      }
    }
    else if (String(message.type) === 'get_re_message'){
      console.log('get_re_message type');
      console.log('messageID',message.message_id);
      console.log('be reply',message.re_message);
      console.log('reply which',message.re_which_message);
     
      if (message.re_message !== null && message.re_message.length > 0) {
        let reMessageString = message.re_message.toString(); // 转换成字符串
        let commaCount = (reMessageString.match(/,/g) || []).length; // 计算逗号的个数
        messageToChat.replyNumber = commaCount+1; // 将逗号的个数作为 replyNumber 的值

        console.log('转化后的回复数：', messageToChat.replyNumber);
      } 
      else {
        messageToChat.replyNumber = 0;
      }

     if (message.re_which_message !== null) {
       let reWhichMessageString = message.re_which_message.toString(); // 转换成字符串
       let replyMessageIdString = reWhichMessageString.replace(/\[|\]/g, ''); // 去掉方括号 []
       messageToChat.Reply_Message_ID = parseInt(replyMessageIdString); // 将字符串转换成整数
       console.log('转化后的回复消息id', messageToChat.Reply_Message_ID );
     } 
     else{
      messageToChat.Reply_Message_ID  = -1;
     }

      
    }
    
    else if (String(message.type) === 'people_who_read_it'){
      console.log('people_who_read_it type')
      if(message.people_who_read_it!==null){
        if(message.people_who_read_it.length>0){
          console.log('有人读过，收到为',message.people_who_read_it)
          messageToChat.readList=message.people_who_read_it.toString();
          console.log('转化后的已读列表',messageToChat.readList)

          if(selectedChat.value[0].is_friend === 1){
            //私聊
            messageToChat.is_friend=1;
          }
          else messageToChat.is_friend=0;
          /* if(selectedChat.value[0].is_friend === 1){//私聊
            let readString = message.re_message.toString(); // 转换成字符串
            console.log('转化后的已读列表',readString)
            let readCount = (readString.match(/,/g) || []).length; // 计算逗号的个数
            if(readCount<1){
              messageToChat.readList='对方未读';
            }
            else{
              messageToChat.readList='对方已读';
            }
            console.log('转化后的已读情况',messageToChat.readList)
         
          }
          else{//群聊
            messageToChat.readList='已读:'+ message.people_who_read_it.toString();
            console.log('转化后的已读列表',messageToChat.readList)
          } */
          
        }
        else messageToChat.readList='';
        
      }
      else messageToChat.readList='';
      
      
    }
    else if(String(message.type) === 'pip_read_message'){
      console.log('pip_read_message type')
      console.log('成功批量标记已读',message.message_ids)

    }
    
    else if (String(message.type) === 'type_m') {
      //refresh NewestMessageID
      if (Number(message.sender_id) === Number(uid.value)){
        console.log('消息是我发的,id是',message.message_id);
        NewestMessageID=message.message_id;
      }
      //refresh read  
      if(Number(message.group_id)===Number(selectedChatIndex.value)){
        console.log('当前消息实时已读,id是',message.message_id);
        read_message(message.message_id);
      }
      else{
        unreadmessages_number.value[message.group_id]++;
      }

      
      {
        console.log('instant case1')
        const message_group_idx = Number(message.group_id);
        if (message_group_idx >= groupofmessages.value.length)
        {
          adjustMessageArraySize(message_group_idx + 1);
          adjusthistoryMessageArraySize(message_group_idx + 1);
        }

        createNewMessage_instant(message);
         
        
        
       
/*   groupofmessages.value[message_group_idx].push(new_message);

groupofmessages.value[message_group_idx].sort((a, b) => {
  return new Date(a.time) - new Date(b.time);
}); */
        
      }

     
    }

    else if (String(message.type) === 'offline') // message reveived when offline
    {
      console.log('offline type');
      unreadmessages_number.value[message.group_id]++;

      /* const message_group_idx = Number(message.group_id);
      if (message_group_idx >= groupofmessages.value.length)
      {
        adjustMessageArraySize(message_group_idx + 1);
        adjusthistoryMessageArraySize(message_group_idx + 1);
      }

      createNewMessage(message); */
      // already handled in history message
      // no need to handle again



    }

    else if (String(message.type) === 'set_post')
    {
      console.log('set_post type');
      const message_group_idx = Number(message.group_id);
      let target_chat = chat.value.filter(chat => Number(chat.group_id) === message_group_idx)[0];
      target_chat.posts.push({
        content: message.post,
        time: message.time
      });
      // remove old target chat and push new one
      chat.value = chat.value.filter(chat => Number(chat.group_id) !== message_group_idx);
      chat.value.push(target_chat);
    }

    else if (String(message.type) === 'set_group_name')
    {
      console.log('set_group_name type');
      const message_group_idx = Number(message.group_id);
      let target_chat = chat.value.filter(chat => Number(chat.group_id) === message_group_idx)[0];
      target_chat.group_name = message.groupname;
      // remove old target chat and push new one
      chat.value = chat.value.filter(chat => Number(chat.group_id) !== message_group_idx);
      chat.value.push(target_chat);
    }
    else if (String(message.type) === 'set_admin')
    {
      console.log('set_admin type, getgroup');
      
      // do nothing but get certain group

      const get_group_message = {
        type: 'get_group_info',
        group_id: message.group_id,
        text: 'anything'
      };
      console.log('Sending get group message:', get_group_message);
      websocket.value.send(JSON.stringify(get_group_message));

      // update selectedchatismyadmingroup
      if (Number(message.admin_uid) === Number(sessionStorage.getItem('uid')) && selectedChat.value[0].group_id === message.group_id)
      {
        selectedChatisMyAdminGroup.value = true;
      }
    }

    else if (String(message.type) === 'invite_member')
    {
      console.log('invite_member type, getgroup');
      
      // do nothing but get certain group

      const get_group_message = {
        type: 'get_group_info',
        group_id: message.group_id,
        text: 'anything'
      };
      console.log('Sending get group message:', get_group_message);
      websocket.value.send(JSON.stringify(get_group_message));

      // update selectedchat
      if (selectedChat.value[0].group_id === message.group_id)
      {
        // update pending list
        selectedChat.value[0].pending_list.push(Number(message.new_uid));
      }
    }

    else if (String(message.type) == 'accept_invite' || String(message.type) == 'accept_member')
    {
      console.log('accept_invite or accept_member type, getgroup');
      
      // do nothing but get certain group

      const get_group_message = {
        type: 'get_group_info',
        group_id: message.group_id,
        text: 'anything'
      };
      console.log('Sending get group message:', get_group_message);
      websocket.value.send(JSON.stringify(get_group_message));
    }

    else if (String(message.type) === 'transfer_root')
    {
      console.log('transfer_root type, getgroup');
      
      // do nothing but get certain group

      const get_group_message = {
        type: 'get_group_info',
        group_id: message.group_id,
        text: 'anything'
      };
      console.log('Sending get group message:', get_group_message);
      websocket.value.send(JSON.stringify(get_group_message));

      if (Number(message.root) === Number(sessionStorage.getItem('uid')))
      {
        // update selectedchatismygroup
        if (selectedChat.value[0].group_id === message.group_id)
        {
          selectedChatisMyGroup.value = true;
        }
      }
    }

    else if (String(message.type) == 'delete_member')
    {
      console.log('delete_member type, getgroup');

      // if the deleted member is me, get group
      if (Number(message.member_id) === Number(sessionStorage.getItem('uid')))
      {
        getgroup();
        // update selected chat
        if (selectedChat.value[0].group_id === message.group_id)
        {
          messages.value = [];
          selectedChatIndex.value = -1;
        }
      }
      // else update group info
      else
      {
        const get_group_message = {
          type: 'get_group_info',
          group_id: message.group_id,
          text: 'anything'
        };
        console.log('Sending get group message:', get_group_message);
        websocket.value.send(JSON.stringify(get_group_message));

        // if the deleted member is in the selected chat, update selected chat
        if (selectedChat.value[0].group_id === message.group_id)
        {
          // find index first
          const new_uid_list = selectedChat.value[0].uid_list.filter(uid => uid !== Number(message.member_id));
          const new_username_list = selectedChat.value[0].username_list.filter((username, index) => selectedChat.value[0].uid_list[index] !== Number(message.member_id));
          selectedChat.value[0].uid_list = new_uid_list;
          selectedChat.value[0].username_list = new_username_list;
          const new_admin_list = selectedChat.value[0].admin_list.filter(admin => admin !== Number(message.member_id));
          const new_admin_name = selectedChat.value[0].admin_name.filter((admin_name, index) => selectedChat.value[0].admin_list[index] !== Number(message.member_id));
          selectedChat.value[0].admin_list = new_admin_list;
          selectedChat.value[0].admin_name = new_admin_name;
        }
      }      
    }

    else if (String(message.type) === 'leave')
    {
      console.log('leave type, getgroup');

      // if the leaved member is me, get group
      if (Number(message.uid) === Number(sessionStorage.getItem('uid')))
      {
        getgroup();
        selectedChatIndex.value=-1;
      }
      // else update group info
      else
      {
        const get_group_message = {
          type: 'get_group_info',
          group_id: message.group_id,
          text: 'anything'
        };
        console.log('Sending get group message:', get_group_message);
        websocket.value.send(JSON.stringify(get_group_message));

        // if the leaved member is in the selected chat, update selected chat
        if (selectedChat.value[0].group_id === message.group_id)
        {
          // find index first
          const new_uid_list = selectedChat.value[0].uid_list.filter(uid => uid !== Number(message.uid));
          const new_username_list = selectedChat.value[0].username_list.filter((username, index) => selectedChat.value[0].uid_list[index] !== Number(message.uid));
          selectedChat.value[0].uid_list = new_uid_list;
          selectedChat.value[0].username_list = new_username_list;
          const new_admin_list = selectedChat.value[0].admin_list.filter(admin => admin !== Number(message.uid));
          const new_admin_name = selectedChat.value[0].admin_name.filter((admin_name, index) => selectedChat.value[0].admin_list[index] !== Number(message.uid));
          selectedChat.value[0].admin_list = new_admin_list;
          selectedChat.value[0].admin_name = new_admin_name;
        }
      }
    }

    else if (String(message.type) === 'get_group_info')
    {
      console.log('get_group_info type');
      updateonegroupData(message);
    }
    else if (String(message.type) === 'farewell')
    {
      console.log('farewell type');
      getfriend();
      getgroup();

      const message = '您的uid为' + String(message.uid) + '的好友已注销';
      ElMessage.error(message);
      messages.value=[];
      selectedChatIndex.value=-1;
    }
    else if (String(message.type) === 'oops, group has gone')
    {
      console.log('oops, group has gone type');
      getfriend();
      getgroup();
      const message = '您的group_id为' + String(message.group_id) + '的群因群主注销已解散';
      ElMessage.error(message);
      messages.value=[];
      selectedChatIndex.value=-1;
      
    }

    else if (Array.isArray(message))
    {
      console.log('array type');
      if (message.length === 0)
      {
        // do nothing
      }
      
      else
      {
        if (typeof message[0] === 'string')
          message[0] = JSON.parse(message[0]);

        console.log('message[0]:', message[0]);

        if (String(message[0].type) === 'history')
        {
          console.log('history type');
          for (let i = 0; i < message.length; i++)
          {
            console.log('message[i]:', message[i]);
            let cur_message = message[i];
            if (typeof cur_message === 'string')
              cur_message = JSON.parse(cur_message);
            const message_group_idx = Number(cur_message.group_id);
            if (message_group_idx >= history_messages.value.length)
            {
              adjusthistoryMessageArraySize(message_group_idx + 1);
            }

            createNewHistoryMessage(cur_message);

            if (message_group_idx >= groupofmessages.value.length)
            {
              adjustMessageArraySize(message_group_idx + 1);
            }

            createNewMessage(cur_message);
          }
        }
      }

      
    }
    
    

    else
    {
      console.log(message);
    }
  };

  websocket.value.onclose = () => {
    console.log('WebSocket connection closed');
    //connectWebSocket();
  };
}

// functions about message

function adjustMessageArraySize(rowNumber) {
  const currentSize = groupofmessages.value.length;
  const rowsToAdd = rowNumber - currentSize;

  console.log('Adjusting message array size by adding ' + rowsToAdd + ' rows.');

  for (let i = 0; i < rowsToAdd; i++) {
    groupofmessages.value.push([]);
  }
}

function adjusthistoryMessageArraySize(rowNumber) {
  const currentSize = history_messages.value.length;
  const rowsToAdd = rowNumber - currentSize;

  console.log('Adjusting history message array size by adding ' + rowsToAdd + ' rows.');

  for (let i = 0; i < rowsToAdd; i++) {
    history_messages.value.push([]);
  }
}

function sendMessage() {
  if (selectedChatIndex.value === -1) {
    ElMessage.error('请先选择一个群聊');
    return;
  }

  const messageText = messageInput.value.trim();

  if (messageText !== '') {
    //console.log('in sendMessage: messageText',messageText);
    sendMessageToWebSocket(messageText);
    nextTick(() => {
      messageInput.value = ''; // Clear the input field
    });
  }
}
function sendMessage_reply(id) {//参数为被回复的消息id
  
  if (selectedChatIndex.value === -1) {
    ElMessage.error('请先选择一个群聊');
    return;
  }

  const messageText = messageInput.value.trim();
  const replyText='回复：'+ messageText;

  if (messageText !== '') {
    
    
    sendMessageToWebSocket(replyText);
    
    nextTick(() => {
      messageInput.value = ''; // Clear the input field
    });
    
    //这里可能要等待一会儿
    setTimeout(() => {
    console.log('in reply: waiting');
    const replyObj={
      type:'re_message',
      message_id:id,
      text:'anything',
      re_message_id:NewestMessageID
   };
    websocket.value.send(JSON.stringify(replyObj));
    console.log('observe:send reply message to websocket:', replyObj);

  }, 500);

    
  }
  
}


function check_reply(id){
  
  const checkReplyObj={
    type: 'get_re_message',
    message_id:id,
    text:'anything'
  };
  console.log("observe: send check_reply to websocket",checkReplyObj)
  websocket.value.send(JSON.stringify(checkReplyObj));

}


function sendMessageToWebSocket(message) {
  const messageObj = {
    type: 'type_m',
    text: message,
    uid: uid.value,
    group_id: selectedChatIndex.value
  };
  if (selectedChatIndex.value === -1) {
    ElMessage.error('请先选择一个群聊');
    return;
  }

  console.log('sendMessageToWebSocket:', messageObj);
  websocket.value.send(JSON.stringify(messageObj));
}

function getReadList(messageID){
  const getReadObj = {
    type: 'people_who_read_it',
    text:'anything',
    message_id: messageID
  };
 
  console.log('getReadList:', getReadObj);
  websocket.value.send(JSON.stringify(getReadObj));
}
function read_message(messageID){
  const readObj = {
    type: 'read_message',
    text:'anything',
    message_id: messageID
  };
 
  console.log('ReadMessage:', readObj);
  websocket.value.send(JSON.stringify(readObj));
}
function pip_read_message(ids){
  const readObj = {
    type: 'pip_read_message',
    text:'anything',
    message_ids: ids
  };
 
  console.log('ReadMessage:', readObj);
  websocket.value.send(JSON.stringify(readObj));
}

function deleteMessage(messageId,group_id){

  const deleteObj = {
    type: 'delete_message',
    text:'anything',
    message_id: messageId
  };
 
  console.log('Deletinging message:', deleteObj);
  websocket.value.send(JSON.stringify(deleteObj));
  // 找到要删除的消息所在的索引
const indexToDelete = groupofmessages.value[selectedChatIndex.value].findIndex(message => message.message_id === messageId);

// 如果找到了消息，则将其从数组中删除
if (indexToDelete !== -1) {
  groupofmessages.value[selectedChatIndex.value].splice(indexToDelete, 1);
  const message_group_idx = Number(group_id);
  // sort messages by time
  groupofmessages.value[selectedChatIndex.value].sort((a, b) => {
    return new Date(a.time) - new Date(b.time);
  });

  if (message_group_idx === selectedChatIndex.value) // fresh the message list
    messages.value = groupofmessages.value[selectedChatIndex.value];
}


const indexToDelete_history = history_messages.value[selectedChatIndex.value].findIndex(message => message.message_id === messageId);
if (indexToDelete_history !== -1) {
  history_messages.value[selectedChatIndex.value].splice(indexToDelete_history, 1);
  // sort messages by time
  history_messages.value[selectedChatIndex.value].sort((a, b) => {
    return new Date(a.time) - new Date(b.time);
  });
}


  




}

</script>

<style scoped>
body {
  font-family: Arial, sans-serif;
}

.el-aside {
  border: 1px solid var(--el-border-color);
  border-radius: 0;
  width: 300px;
  background-color: rgb(233, 232, 231);
  border-color: rgb(232, 232, 232);
}

.el-main {
  border: 1px solid var(--el-border-color);
  border-radius: 2px;
  height: 300px;
  background-color: rgb(245, 245, 245);
  border-color: rgb(232, 232, 232);
}

.el-header {
  border: 1px solid var(--el-border-color);
  border-radius: 2px;
  background-color: rgb(245, 245, 245);
  border-color: rgb(232, 232, 232);
}

.el-footer {
  border: 1px solid var(--el-border-color);
  border-radius: 2px;
  background-color: rgb(245, 245, 245);
  border-color: rgb(232, 232, 232);
}

.chat-container {
  width: 60vw;
  height: 80vh;
  display: flex;
}

.chat-messages {
  padding: 10px;
  height: 300px;
}

.el-container {
  flex: 1;
}

.input-container {
  padding: 10px;
  height: 150px;
  width: 100%;
  background-color: rgb(245, 245, 245);
}

.input-container button {
  padding: 8px 15px;
  background-color: rgb(233, 233, 233);
  color: #fff;
  cursor: pointer;
}
</style>
