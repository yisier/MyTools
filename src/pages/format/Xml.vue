<template>
  <div class="format-page">
    <div class="page-header">
      <span class="header-title">
        <el-icon>
          <EditPen />
        </el-icon>
        {{ $t('xml.desc') }}
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
      <el-button type="primary" @click="xmlCheckFormat()">{{ $t('xml.format') }}</el-button>
      <el-button @click="compression()">{{ $t('xml.compress') }}</el-button>
      <el-button @click="clearValue()">{{ $t('xml.clearValue') }}</el-button>
    </div>
  </div>
</template>
  
<script>
//ace-editor
import ace from 'ace-builds'

import modeXmlUrl from 'ace-builds/src-min-noconflict/mode-xml?url';
ace.config.setModuleUrl('ace/mode/xml', modeXmlUrl);

import themeEclipseUrl from 'ace-builds/src-min-noconflict/theme-eclipse?url';
ace.config.setModuleUrl('ace/theme/eclipse', themeEclipseUrl);

import workerXmlUrl from 'ace-builds/src-min-noconflict/worker-xml?url';
ace.config.setModuleUrl('ace/mode/xml_worker', workerXmlUrl);

import 'ace-builds/src-min-noconflict/ext-language_tools';
ace.require("ace/ext/language_tools");

import 'ace-builds/src-min-noconflict/ext-searchbox';
ace.require("ace/ext/ext-searchbox");



export default {
  name: 'Xml',
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
      mode: 'ace/mode/xml', // 默认设置的语言模式
      tabSize: 4,// 制表符设置为 4 个空格大小
      readOnly: false,//只读
      enableBasicAutocompletion: true, //启动基本自动完成
      showPrintMargin: false,
      wrap: 'free',  //  换行
      enableKeyboardAccessibility:true, //启用键盘辅助功能
    });

    // 容器尺寸变化时自适应
    this.resizeObserver = new ResizeObserver(() => {
      this.editor && this.editor.resize()
    })
    this.resizeObserver.observe(this.$refs.ace)

    const xml = localStorage.getItem('xml')
    if (xml) {
      this.editor.setValue(xml, -1)
      this.xmlCheckFormat()
    }

  },
  beforeUnmount() {
    this.resizeObserver && this.resizeObserver.disconnect()
    this.editor && this.editor.destroy()
  },
  methods: {

    xmlCheckFormat() {
      try {
        var xml = this.editor.getValue()

        if (xml == '') {
          return
        }

        localStorage.setItem('xml', this.editor.getValue())

        //获取编辑器中语法校验的结果
        var annotations = this.editor.getSession().getAnnotations();

        //遍历结果 记录提示信息
        for (var aid = 0, alen = annotations.length; aid < alen; ++aid) {
          var row = annotations[aid].row + 1;
          //存在错误 必须修改
          if (annotations[aid].type === 'error') {
            var txt = " 行：" + row + "；列：" + annotations[aid].column + "; </br>  提示：" + annotations[aid].text;
            this.editor.gotoLine(row, 1)
            this.checkResut = false
            this.errorMsg = txt
            return
          }

        }

        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");
        const xmlHeader = xml.match(/^<\?xml [^?]*\?>/);

        let formatted = "";


        var error = xmlDoc.getElementsByTagName("parsererror")[0]
        if (error) {
          this.checkResut = false

          if (error.textContent != null) {
            this.errorMsg = error.textContent
          }

          return
        }


        function traverse(node, depth = 0) {
          const tab = "    ".repeat(depth);
          if (node.nodeType === Node.ELEMENT_NODE) {
            formatted += `${tab}<${node.tagName}`;

            for (let i = 0; i < node.attributes.length; i++) {
              formatted += ` ${node.attributes[i].name}="${node.attributes[i].value}"`;
            }

            if (node.childNodes.length === 0) {
              formatted += "/>";
            } else {
              formatted += ">";
              if (node.childNodes.length === 1 && node.childNodes[0].nodeType === Node.TEXT_NODE) {
                formatted += `${node.childNodes[0].textContent.trim()}</${node.tagName}>`;
              } else {
                formatted += "\n";
                for (let i = 0; i < node.childNodes.length; i++) {
                  traverse(node.childNodes[i], depth + 1);
                }
                formatted += `${tab}</${node.tagName}>`;
              }
            }
            formatted += "\n";
          } else if (node.nodeType === Node.TEXT_NODE) {
            const trimmedValue = node.textContent.trim();
            if (trimmedValue) {
              formatted += `${tab}${trimmedValue}\n`;
            }
          }
        }

        traverse(xmlDoc.documentElement);

        if (xmlHeader) {
          formatted = xmlHeader[0] + "\n" + formatted;
        }

        this.editor.setValue(formatted, -1)
        this.checkResut = true
      } catch (e) {
        this.checkResut = false
        this.errorMsg = e.message
      }

    },

    compression() {
      var xmlString = this.editor.getValue()
      xmlString = xmlString.replace(/>\s+</g, '><');
      this.editor.setValue(xmlString)
      this.checkResut = false
      this.errorMsg = ""
      localStorage.setItem('xml', this.editor.getValue())
    },

    clearValue: function () {
      this.editor.setValue("")
      this.checkResut = false
      this.errorMsg = ""
      localStorage.setItem('xml', this.editor.getValue())
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