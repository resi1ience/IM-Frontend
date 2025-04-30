<template>
    <div>
      <el-dialog title="修改信息" :visible.sync="visible">
        <el-input v-model="inputValue" :placeholder="'请输入新的' + type"></el-input>
        <span slot="footer" class="dialog-footer">
          <el-button @click="visible = false">取 消</el-button>
          <el-button type="primary" @click="saveInfo">保 存</el-button>
        </span>
      </el-dialog>
    </div>
  </template>
  
  <script setup>
  import { ref, watch } from 'vue';
  import { ElDialog, ElInput, ElButton } from 'element-plus';
  
  const props = defineProps({
    type: String,
    value: String
  });
  
  const emit = defineEmits(['close', 'save']);
  const visible = ref(true);
  const inputValue = ref('');
  
  watch(() => props.value, (newValue) => {
    inputValue.value = newValue;
  });
  
  function saveInfo() {
    emit('save', props.type, inputValue.value);
    visible.value = false;
  }
  </script>
  