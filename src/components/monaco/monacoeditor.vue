<template>
  <div ref="container" class="monaco-editor" :style="containerStyle"></div>
</template>
<script>
import * as monaco from 'monaco-editor'
export default {
  name: 'AcMonaco',
  props: {
    opts: {
      type: Object,
      default() {
        return {}
      }
    },
    height: {
      type: [Number, String],
      default: 300
    }
  },
  computed: {
    containerStyle() {
      return {
        height: typeof this.height === 'number' ? `${this.height}px` : this.height
      }
    }
  },
  data() {
    return {
      // 主要配置
      defaultOpts: {
        value: '', // 编辑器的值
        theme: 'vs', // 编辑器主题：vs, hc-black, or vs-dark，更多选择详见官网
      },
      // 编辑器对象
      monacoEditor: {}
    }
  },
  watch: {
    opts: {
      handler() {
        this.init()
      },
      deep: true
    }
  },
  mounted() {
    this.init()
  },
  methods: {
    init() {
      // 生成编辑器配置
      let editorOptions = Object.assign(this.defaultOpts, this.opts)
      // editorOptions.readonly = false;
      // editorOptions.language = 'javascript'
      // 初始化编辑器实例
      this.monacoDiffInstance = monaco.editor.createDiffEditor(this.$refs['container'], editorOptions)
      this.monacoDiffInstance.setModel({
        // oldValue为以前的值
        original: monaco.editor.createModel("123\n123", 'txt'),
        // oldValue为新的值
        modified: monaco.editor.createModel("123\n1234", 'txt')

      })

      // 内容变化时向父组件抛出事件，用于持久化
      const emitChange = () => {
        this.$emit('change', {
          original: this.monacoDiffInstance.getOriginalEditor().getValue(),
          modified: this.monacoDiffInstance.getModifiedEditor().getValue()
        })
      }
      this.monacoDiffInstance.getOriginalEditor().onDidChangeModelContent(emitChange)
      this.monacoDiffInstance.getModifiedEditor().onDidChangeModelContent(emitChange)

    },
    // 供父组件调用手动获取值
    getVal() {
      return this.monacoEditor.getValue()
    },
    // 供父组件调用，设置左侧(原始)内容，lang 可选，用于切换语言高亮
    setOriginal(value, lang) {
      this.monacoDiffInstance.getOriginalEditor().setValue(value)
      if (lang && monaco.languages.getLanguages().some(l => l.id === lang)) {
        monaco.editor.setModelLanguage(this.monacoDiffInstance.getOriginalEditor().getModel(), lang)
      }
    },
    // 供父组件调用，设置右侧(修改后)内容
    setModified(value, lang) {
      this.monacoDiffInstance.getModifiedEditor().setValue(value)
      if (lang && monaco.languages.getLanguages().some(l => l.id === lang)) {
        monaco.editor.setModelLanguage(this.monacoDiffInstance.getModifiedEditor().getModel(), lang)
      }
    }
  }
}
</script>

