<template>
  <div class="format-page">
    <div class="page-header">
      <span class="header-title">
        <el-icon>
          <EditPen />
        </el-icon>
        {{ $t('sql.desc') }}
      </span>
    </div>

    <div ref="ace" class="ace-editor-full" />

    <div class="error-msg" v-if="errorMsg != ''">
      <el-icon size="18" color="#e75033">
        <CircleCloseFilled />
      </el-icon>
      <span v-html="errorMsg"></span>
    </div>

    <div class="ace-toolbar">
      <el-button type="primary" @click="sqlCheckFormat()">{{ $t('sql.format') }}</el-button>
      <el-button @click="compression()">{{ $t('sql.compress') }}</el-button>
      <el-button @click="clearValue()">{{ $t('sql.clearValue') }}</el-button>
    </div>
  </div>
</template>
  
<script>
//ace-editor
import ace from 'ace-builds'

import modeSqlUrl from 'ace-builds/src-min-noconflict/mode-sql?url';
ace.config.setModuleUrl('ace/mode/sql', modeSqlUrl);

import themeEclipseUrl from 'ace-builds/src-min-noconflict/theme-eclipse?url';
ace.config.setModuleUrl('ace/theme/eclipse', themeEclipseUrl);

import 'ace-builds/src-min-noconflict/ext-language_tools';
ace.require("ace/ext/language_tools");

import 'ace-builds/src-min-noconflict/ext-searchbox';
ace.require("ace/ext/ext-searchbox");

import { format } from 'sql-formatter';



export default {
  name: 'Sql',
  data() {
    return {
      editor: null,
      resizeObserver: null,
      errorMsg: ""
    }
  },
  mounted() {
    //快速开始-demo
    this.editor = ace.edit(this.$refs.ace, {
      useWorker: true,
      fontSize: 14, // 编辑器内字体大小
      theme: 'ace/theme/eclipse', // 默认设置的主题
      mode: 'ace/mode/sql', // 默认设置的语言模式
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

    const sql = localStorage.getItem('sql')
    if (sql) {
      this.editor.setValue(sql, -1)
      this.sqlCheckFormat()
    }

  },
  beforeUnmount() {
    this.resizeObserver && this.resizeObserver.disconnect()
    this.editor && this.editor.destroy()
  },
  methods: {

    sqlCheckFormat() {

      var sql = this.editor.getValue()

      if (sql == '') {
        return
      }
      localStorage.setItem('sql', this.editor.getValue())

      try {
        this.editor.setValue(format(sql), -1)
        this.errorMsg = ""
      } catch (error) {
        this.errorMsg = error.message
      }

    },
    compression() {
      let sql = this.editor.getValue()

      sql = sql.replace(/\n/g, " "); // 去除换行符
      sql = sql.replace(/\t/g, ""); // 去除制表符
      sql = sql.replace(/\s*,\s*/g, ",");
      sql = sql.replace(/\s+/g, " "); // 将多个空格替换为一个空格
      this.editor.setValue(sql)
      localStorage.setItem('sql', this.editor.getValue())

    },

    clearValue: function () {
      this.editor.setValue("")
      this.errorMsg = ""
      localStorage.setItem('sql', this.editor.getValue())
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