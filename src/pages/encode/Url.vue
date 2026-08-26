<template>
    <el-row  justify="center" align="middle">
      <el-col :md="6">
        <h3>{{ $t('url.desc') }}</h3>
      </el-col>
    </el-row>
  
    <el-row :gutter="10" justify="center">
  
      <el-col :span="18">
        <h5>{{ $t('url.urlText') }}：</h5>
        <el-input v-model="text1" :rows="10" type="textarea" :placeholder="$t('url.urlText')"
          :style="{ boxShadow: `var(--el-box-shadow-lighter)` }" />
      </el-col>
  
      <el-col :span="18" style="margin: 15px 0;" align="middle">
        <el-button type="primary" icon="BottomRight" @click="enCode()">{{ $t('url.encode') }}</el-button>
        <el-button type="primary" icon="TopLeft" @click="deCode()">{{ $t('url.decode') }}</el-button>
      </el-col>
  
      <el-col :span="18">
        <h5>{{ $t('url.urlCode') }}：</h5>
        <el-input v-model="text2" :rows="10" type="textarea" :placeholder="$t('url.urlCode')"
          :style="{ boxShadow: `var(--el-box-shadow-lighter)` }" />
      </el-col>
    </el-row>
  </template>
  
  <script>
  export default {
    name: 'Base64'
  }
  </script>
  
  
  
  <script  setup>
  
  import { ref } from 'vue'
  
  const text1 = ref('')
  const text2 = ref('')
  
  text1.value = ""
  function enCode() {
    text2.value = encodeURIComponent(text1.value)
  }
  
  
  function deCode() {
    text1.value = decodeURIComponent(text2.value)
  }
  
  
  </script>
  
  <style></style>