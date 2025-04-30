<template>
  <div>
    <h2>会话列表</h2>
    <ul>
      <li v-for="(grp, index) in Group" :key="index" @click="select(grp.group_id)">
<!--         <el-button width="100px"><el-text>{{ grp.group_name }}</el-text><el-text>{{  props.unreadmessages_number[grp.group_id]}}</el-text></el-button>
 -->        
         <el-button width="100px">
            <el-text v-if="grp.is_friend === 0">{{ grp.group_name }}</el-text>
            <el-text v-else-if="grp.uid_list[0] === props.uid">{{ grp.username_list[1] }}</el-text>
            <el-text v-else>{{ grp.username_list[0] }}</el-text>
<!--             <el-text :style="{ color: 'white', backgroundColor: 'red' }">{{ props.unreadmessages_number[grp.group_id] }}</el-text>
 -->     
            <el-text v-if="props.unreadmessages_number[grp.group_id] > 0" :style="{ color: 'white', backgroundColor: 'red' }">{{ props.unreadmessages_number[grp.group_id] }}</el-text>

         </el-button>

      </li>
    </ul>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  Group: {
    type: Array,
    required: true
  },
  selectChat: {
    type: Function,
    required: true
  },
  unreadmessages_number:{
    type:Array,
    required:true
  },
  uid:{
    type:Number,
    required:true
  }
});

let selectedChatIndex = 0;

function select(index) {
  console.log('in chatlist:function',props.selectChat)
  selectedChatIndex = index;
  props.selectChat(index);
}
</script>
