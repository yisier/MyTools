<template>
  <div class="text-editor-page">
    <div class="editor-toolbar">
      <span class="toolbar-label">{{ $t('text.language') }}</span>
      <el-select v-model="langType" @change="handleLang" style="width: 140px;">
        <el-option v-for="(item) in langArray" :key="item.name" :label="item.name" :value="item.path">
        </el-option>
      </el-select>
    </div>

    <div ref="ace" class="ace-editor-full" />
  </div>
</template>

<script>
//ace-editor
import ace from 'ace-builds'

// ace主题包
import 'ace-builds/src-min-noconflict/theme-eclipse'
import 'ace-builds/src-min-noconflict/theme-one_dark'
import { isDark, onThemeChange } from '@/theme'
// ace 检索框
import 'ace-builds/src-min-noconflict/ext-searchbox'
// ace语言包
import 'ace-builds/src-min-noconflict/mode-javascript'
import 'ace-builds/src-min-noconflict/mode-xml'
import 'ace-builds/src-min-noconflict/mode-json5'
import 'ace-builds/src-min-noconflict/mode-text'
import 'ace-builds/src-min-noconflict/mode-java'
import 'ace-builds/src-min-noconflict/mode-html'
import 'ace-builds/src-min-noconflict/mode-sql'
//代码完成
import 'ace-builds/src-min-noconflict/ext-language_tools'

export default {
  name: 'editer',
  data() {
    return {
      editor: null,
      resizeObserver: null,
      langType: 'Text',
      langArray: [
        {
          name: 'Text',
          path: 'ace/mode/text'
        },
        {
          name: 'JavaScript',
          path: 'ace/mode/javascript'
        },
        {
          name: 'Json',
          path: 'ace/mode/json5'
        },
        {
          name: 'Xml',
          path: 'ace/mode/xml'
        },
        {
          name: 'Java',
          path: 'ace/mode/java'
        },
        {
          name: 'Html',
          path: 'ace/mode/html'
        },
        {
          name: 'Sql',
          path: 'ace/mode/sql'
        },
      ]
    }
  },
  mounted() {
    this.editor = ace.edit(this.$refs.ace, {
      useWorker: true,
      fontSize: 14, // 编辑器内字体大小
      theme: isDark() ? 'ace/theme/one_dark' : 'ace/theme/eclipse', // 默认设置的主题
      mode: 'ace/mode/text', // 默认设置的语言模式
      tabSize: 4,// 制表符设置为 4 个空格大小
      readOnly: false,//只读
      enableBasicAutocompletion: true, //启动基本自动完成
      showPrintMargin: false,
      wrap: 'free',  //  换行
    });

    // 系统主题切换时同步编辑器主题
    this.offThemeChange = onThemeChange((dark) => {
      this.editor && this.editor.setTheme(dark ? 'ace/theme/one_dark' : 'ace/theme/eclipse')
    })

    // 容器尺寸变化时自适应
    this.resizeObserver = new ResizeObserver(() => {
      this.editor && this.editor.resize()
    })
    this.resizeObserver.observe(this.$refs.ace)

    const editer = localStorage.getItem('editer')
    if (editer) {
      this.editor.setValue(editer, -1)
    }
  },
  beforeUnmount() {
    this.offThemeChange && this.offThemeChange()
    this.resizeObserver && this.resizeObserver.disconnect()
    this.editor && this.editor.destroy()
  },
  methods: {
    handleLang(val) {
      this.editor.setOption("mode", val);
    },
  }
}
</script>

<style scoped>
.text-editor-page {
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 12px 16px;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.toolbar-label {
  font-size: 13px;
  color: #606266;
}

.ace-editor-full {
  flex: 1;
  min-height: 0;
}
</style>
