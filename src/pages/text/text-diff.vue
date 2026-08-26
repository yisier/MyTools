<template>
  <div class="text-diff-page">
    <!--选择文件：左右两半分别对应左右编辑器窗格-->
    <div class="file-select-bar">
      <div class="pane-header">
        <el-button size="small" icon="Document" @click="$refs.originalInput.click()">{{ $t('diff.selectOriginal') }}</el-button>
        <span v-if="originalName" class="file-name">{{ originalName }}</span>
        <el-button class="clear-btn" size="small" icon="Delete" @click="clearOriginal">{{ $t('diff.clear') }}</el-button>
        <input ref="originalInput" type="file" style="display: none" @change="loadFile($event, 'original')" />
      </div>
      <div class="pane-header">
        <el-button size="small" icon="Document" @click="$refs.modifiedInput.click()">{{ $t('diff.selectModified') }}</el-button>
        <span v-if="modifiedName" class="file-name">{{ modifiedName }}</span>
        <el-button class="clear-btn" size="small" icon="Delete" @click="clearModified">{{ $t('diff.clear') }}</el-button>
        <input ref="modifiedInput" type="file" style="display: none" @change="loadFile($event, 'modified')" />
      </div>
    </div>

    <!--调用子组件-->
    <monaco ref="monaco" :opts="opts" @change="changeValue" height="calc(100% - 42px)"></monaco>
  </div>
</template>


<script>
import monaco from '../../components/monaco/monacoeditor.vue'
export default {
  components: { monaco },
  data() {
    return {
      originalName: '',
      modifiedName: '',
      saveTimer: null,
      sets: {
        language: {
          'txt': 'txt',
          'json': 'json',
          'xml': 'xml',
          'java': 'java',
          'mysql': 'mysql',
          'markdown': 'markdown',
          'javascript': 'javascript',
          'yaml': 'yaml',
          'bat': 'bat',
          'c': 'c',
          'cpp': 'cpp',
          'csharp': 'csharp',
          'css': 'css',
          'dockerfile': 'dockerfile',
          'go': 'go',
          'html': 'html',
          'pgsql': 'pgsql',
          'php': 'php',
          'powershell': 'powershell',
          'python': 'python',
          'ruby': 'ruby',
          'rust': 'rust',
          'shell': 'shell',
          'sql': 'sql',
          'typescript': 'typescript',
          'vb': 'vb',
        }
      },
      opts: {
        value: '',
        language: 'txt', // 语言类型
        theme: 'vs', // 编辑器主题
        contextmenu: false, // 上下文菜单(右键菜单)
        formatOnPaste: true, // 复制格式化
        foldingStrategy: 'indentation', // 代码可分小段折叠
        folding: true, // 是否启用代码折叠
        readOnly: false, // 只读
        autoIndent: false, // 自动缩进
        automaticLayout: true, // 自适应布局
        wordWrap: false, // 自动换行
        fontSize: 14,
        tabSize: 2, // tab 缩进长度
        renderSideBySide: true, // 行内比较
        originalEditable: true,
      }
    }
  },
  mounted() {
    this.restore()
  },
  methods: {
    changeLanguage(val) {
      this.opts.language = val
    },
    changeTheme(val) {
      this.opts.theme = val
    },
    // 根据文件扩展名推断语言类型
    getLanguage(fileName) {
      const ext = fileName.split('.').pop().toLowerCase()
      const langMap = {
        js: 'javascript', ts: 'typescript', md: 'markdown', yml: 'yaml',
        htm: 'html', sh: 'shell', py: 'python', ps1: 'powershell',
        cs: 'csharp', cxx: 'cpp', hpp: 'cpp', h: 'c'
      }
      return langMap[ext] || this.sets.language[ext]
    },
    // 选择文件后读取内容填入对应编辑器
    loadFile(event, side) {
      const file = event.target.files[0]
      if (!file) {
        return
      }
      const reader = new FileReader()
      reader.onload = () => {
        const lang = this.getLanguage(file.name)
        if (side === 'original') {
          this.originalName = file.name
          this.$refs.monaco.setOriginal(reader.result, lang)
        } else {
          this.modifiedName = file.name
          this.$refs.monaco.setModified(reader.result, lang)
        }
      }
      reader.readAsText(file)
      event.target.value = ''
    },
    // 清空左侧(原始)编辑器
    clearOriginal() {
      this.originalName = ''
      this.$refs.monaco.setOriginal('')
    },
    // 清空右侧(修改后)编辑器
    clearModified() {
      this.modifiedName = ''
      this.$refs.monaco.setModified('')
    },
    // 手动获取值
    getValue() {
    },
    // 从 localStorage 恢复上次的内容
    restore() {
      try {
        const saved = JSON.parse(localStorage.getItem('textDiff') || '{}')
        if (typeof saved.original === 'string') {
          this.$refs.monaco.setOriginal(saved.original)
        }
        if (typeof saved.modified === 'string') {
          this.$refs.monaco.setModified(saved.modified)
        }
        this.originalName = saved.originalName || ''
        this.modifiedName = saved.modifiedName || ''
      } catch (e) { }
    },
    // 内容改变自动获取值，防抖后持久化
    changeValue(val) {
      clearTimeout(this.saveTimer)
      this.saveTimer = setTimeout(() => {
        try {
          localStorage.setItem('textDiff', JSON.stringify({
            original: val.original,
            modified: val.modified,
            originalName: this.originalName,
            modifiedName: this.modifiedName
          }))
        } catch (e) { }
      }, 500)
    }
  }
}
</script>


<style scoped>
.text-diff-page {
  height: 100%;
}

.file-select-bar {
  display: flex;
  margin-bottom: 10px;
}

.pane-header {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.clear-btn {
  margin-left: auto;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
