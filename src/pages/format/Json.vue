<template>
  <div class="format-page">
    <div class="page-header">
      <span class="header-title">
        <el-icon>
          <EditPen />
        </el-icon>
        {{ $t('json.desc') }}
      </span>
    </div>

    <div ref="ace" class="ace-editor-full" />

    <div class="success-msg" v-if="checkResut">
      <el-icon size="18" color="#329d38">
        <SuccessFilled />
      </el-icon>
      <span>{{ $t('json.correct') }}</span>
    </div>

    <div class="error-msg" v-if="checkResut != null && !checkResut && errorMsg != ''">
      <el-icon size="18" color="#e75033">
        <CircleCloseFilled />
      </el-icon>
      <span v-html="errorMsg"></span>
    </div>

    <div class="ace-toolbar">
      <el-button type="primary" @click="jsonCheckFormat()">{{ $t('json.format') }}</el-button>
      <el-button @click="compression()">{{ $t('json.compress') }}</el-button>
      <el-button @click="escape()">{{ $t('json.escape') }}</el-button>
      <el-button @click="removeEscaping()">{{ $t('json.removeEscaping') }}</el-button>
      <el-button @click="clearValue()">{{ $t('json.clearValue') }}</el-button>
    </div>
  </div>
</template>

<script>
//ace-editor
import ace from 'ace-builds'

import modeJsonUrl from 'ace-builds/src-min-noconflict/mode-json?url';
ace.config.setModuleUrl('ace/mode/json', modeJsonUrl);

import themeEclipseUrl from 'ace-builds/src-min-noconflict/theme-eclipse?url';
ace.config.setModuleUrl('ace/theme/eclipse', themeEclipseUrl);

import workerJsonUrl from 'ace-builds/src-min-noconflict/worker-json?url';
ace.config.setModuleUrl('ace/mode/json_worker', workerJsonUrl);

import 'ace-builds/src-min-noconflict/ext-language_tools';
ace.require("ace/ext/language_tools");

import 'ace-builds/src-min-noconflict/ext-searchbox';
ace.require("ace/ext/ext-searchbox");

// js-beautify
import beautify from "js-beautify"
import jsonlint from '@/assets/jsonlint'


export default {
  name: 'Json',
  data() {
    return {
      editor: null,
      resizeObserver: null,
      errorMsg: null,
      checkResut: null
    }
  },
  mounted() {
    //快速开始-demo
    this.editor = ace.edit(this.$refs.ace, {
      useWorker: true,
      fontSize: 14, // 编辑器内字体大小
      theme: 'ace/theme/eclipse', // 默认设置的主题
      mode: 'ace/mode/json', // 默认设置的语言模式
      tabSize: 4,// 制表符设置为 4 个空格大小
      readOnly: false,//只读
      enableBasicAutocompletion: true, //启动基本自动完成
      showPrintMargin: false,
      wrap: 'free',  //  换行
    });

    // 容器尺寸变化时自适应
    this.resizeObserver = new ResizeObserver(() => {
      this.editor && this.editor.resize()
    })
    this.resizeObserver.observe(this.$refs.ace)

    const json = localStorage.getItem('json')
    if (json) {
      this.editor.setValue(json, -1)
      this.jsonCheckFormat()
    }

  },
  beforeUnmount() {
    this.resizeObserver && this.resizeObserver.disconnect()
    this.editor && this.editor.destroy()
  },
  methods: {

    jsonCheckFormat() {
      try {
        if (this.editor.getValue() == "") {
          return
        }
        localStorage.setItem('json', this.editor.getValue())

        var code = beautify(this.editor.getValue(), {
          indent_size: 2,//缩进两个空格
          space_in_empty_paren: true,
        });
        this.editor.setValue(code, -1)
        // 验证通过
        let result = jsonlint.parse(this.editor.getValue())
        this.checkResut = true
      } catch (e) {
        this.checkResut = false
        let lines = e.message.split("\n"); // 将字符串分割成行
        let secondLine = lines[0]; // 获取第二行
        let secondNumber = parseInt(secondLine.match(/\d+/)); // 提取数字并转换为整数
        this.errorMsg = e.message.replace(/\n/g, "<br>")
        this.editor.gotoLine(secondNumber, 1)
      }
    },

    compression() {
      this.jsonCheckFormat()
      let jsonObj = JSON.parse(this.editor.getValue());
      let compressedJsonStr = JSON.stringify(jsonObj, null, 0);
      this.editor.setValue(compressedJsonStr)
      this.checkResut = false
      this.errorMsg = ""
      localStorage.setItem('json', this.editor.getValue())

    },

    escape() {
      this.editor.setValue(this.editor.getValue().replaceAll('"', '\\"'))
      localStorage.setItem('json', this.editor.getValue())
    },

    removeEscaping() {
      this.editor.setValue(this.editor.getValue().replaceAll("\\", ""))
      localStorage.setItem('json', this.editor.getValue())
    },

    clearValue: function () {
      this.editor.setValue("")
      this.checkResut = false
      this.errorMsg = ""
      localStorage.setItem('json', this.editor.getValue())
    },
  }
}
</script>

<style scoped>
.format-page {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #606266;
}

.ace-editor-full {
  flex: 1;
  min-height: 0;
  box-shadow: var(--el-box-shadow-lighter);
}

.ace-toolbar {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 12px;
  flex-shrink: 0;
}

.success-msg {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #329d38;
  background-color: #ddf4df;
  font-size: 12px;
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 4px;
  flex-shrink: 0;
}

.error-msg {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  color: #e75033;
  background-color: #ffe5e0;
  font-size: 12px;
  padding: 8px 12px;
  margin-top: 10px;
  border-radius: 4px;
  max-height: 120px;
  overflow-y: auto;
  flex-shrink: 0;
}
</style>