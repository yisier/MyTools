<template>
    <div class="text-deduplicates">
        <el-card class="pane-card">
            <template #header>
                <div class="card-header">
                    <span>
                        <el-icon>
                            <EditPen />
                        </el-icon>
                        {{ $t('deduplicates.inputPlaceholder') }}
                    </span>
                    <el-button type="primary" size="small" @click="clearValue()">{{ $t('deduplicates.clearValue') }}</el-button>
                </div>
            </template>
            <div ref="ace1" class="ace-pane" />
        </el-card>

        <div class="middle-pane">
            <el-card class="stats-card">
                <div class="item">{{ $t('deduplicates.originalLines') }}：<span class="num num-green">{{ originalLines }}</span></div>
                <div class="item">{{ $t('deduplicates.duplicateLines') }}：<span class="num num-red">{{ duplicateLines }}</span></div>
                <div class="item">{{ $t('deduplicates.resultLines') }}：<span class="num">{{ resultLines }}</span></div>
            </el-card>
            <el-button type="primary" @click="toDeduplicates()">{{ $t('deduplicates.toDeduplicates') }}</el-button>
        </div>

        <el-card class="pane-card">
            <template #header>
                <div class="card-header">
                    <span>
                        <el-icon>
                            <List />
                        </el-icon>
                        {{ $t('deduplicates.result') }}
                    </span>
                    <el-button type="primary" size="small" @click="copy()">{{ $t('deduplicates.copy') }}</el-button>
                </div>
            </template>
            <div ref="ace2" class="ace-pane" />
        </el-card>
    </div>
</template>

<script>
import ace from 'ace-builds'

import modeXmlUrl from 'ace-builds/src-min-noconflict/mode-xml?url';
ace.config.setModuleUrl('ace/mode/xml', modeXmlUrl);

import themeEclipseUrl from 'ace-builds/src-min-noconflict/theme-eclipse?url';
ace.config.setModuleUrl('ace/theme/eclipse', themeEclipseUrl);

import 'ace-builds/src-min-noconflict/ext-language_tools';
ace.require("ace/ext/language_tools");

export default {
    name: 'TextDeduplicates',
    data() {
        return {
            editor1: null,
            editor2: null,
            resizeObserver: null,
            originalLines: 0,
            duplicateLines: 0,
            resultLines: 0
        }
    },
    mounted() {
        this.editor1 = ace.edit(this.$refs.ace1, {
            useWorker: true,
            fontSize: 14, // 编辑器内字体大小
            theme: 'ace/theme/eclipse', // 默认设置的主题
            mode: 'ace/mode/text', // 默认设置的语言模式
            tabSize: 4,// 制表符设置为 4 个空格大小
            readOnly: false,//只读
            enableBasicAutocompletion: true, //启动基本自动完成
            showPrintMargin: false,
            wrap: 'off',  //  换行
            highlightSelectedWord: false, // 高亮选中文本
        });

        this.editor2 = ace.edit(this.$refs.ace2, {
            useWorker: true,
            fontSize: 14, // 编辑器内字体大小
            theme: 'ace/theme/eclipse', // 默认设置的主题
            mode: 'ace/mode/text', // 默认设置的语言模式
            tabSize: 4,// 制表符设置为 4 个空格大小
            readOnly: true,//只读
            enableBasicAutocompletion: true, //启动基本自动完成
            showPrintMargin: false,
            wrap: 'off',  //  换行
            highlightSelectedWord: false, // 高亮选中文本
        });

        // 容器尺寸变化时自适应
        this.resizeObserver = new ResizeObserver(() => {
            this.editor1 && this.editor1.resize()
            this.editor2 && this.editor2.resize()
        })
        this.resizeObserver.observe(this.$refs.ace1)
        this.resizeObserver.observe(this.$refs.ace2)

        const text_duplicates = localStorage.getItem('text_duplicates')
        if (text_duplicates) {
            this.editor1.setValue(text_duplicates, -1)
            this.toDeduplicates()
        }
    },
    beforeUnmount() {
        this.resizeObserver && this.resizeObserver.disconnect()
        this.editor1 && this.editor1.destroy()
        this.editor2 && this.editor2.destroy()
    },
    methods: {
        clearValue: function () {
            this.editor1.setValue("")
            this.editor2.setValue("")
            this.originalLines = 0
            this.duplicateLines = 0
            this.resultLines = 0
        },

        toDeduplicates: function () {
            var v1 = this.editor1.getValue()

            if (v1 == null || v1 == '') {
                return
            }

            var originalArr = v1.split(/\r?\n/)

            var resutlArr = Array.from(new Set(originalArr))
            var result = ""
            resutlArr.forEach(element => {
                result += element + '\r\n'
            });

            this.editor2.setValue(result)

            this.originalLines = originalArr.length
            this.duplicateLines = originalArr.length - resutlArr.length
            this.resultLines = resutlArr.length

            localStorage.setItem('text_duplicates', this.editor1.getValue())
        },

        copy() {
            const oInput = document.createElement('textarea')
            oInput.value = this.editor2.getValue()
            document.body.appendChild(oInput)
            oInput.select()
            document.execCommand('Copy')
            oInput.remove()
            ElNotification({
                title: this.$t('deduplicates.copySuccess'),
                type: 'success',
            })
        }
    }
}
</script>

<style>
.text-deduplicates {
    height: 100%;
    box-sizing: border-box;
    display: flex;
    gap: 10px;
    padding: 12px 16px;
}

.text-deduplicates .pane-card {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
}

.text-deduplicates .el-card__body {
    padding: 0;
    flex: 1;
    min-height: 0;
    position: relative;
}

.text-deduplicates .ace-pane {
    position: absolute;
    inset: 0;
}

.text-deduplicates .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.text-deduplicates .el-card__header {
    padding: 10px 14px;
    box-sizing: border-box;
}

.text-deduplicates .middle-pane {
    width: 150px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 14px;
}

.text-deduplicates .stats-card .item {
    padding: 10px 12px;
    font-size: 13px;
    color: #606266;
    white-space: nowrap;
}

.text-deduplicates .num {
    font-size: 1.2em;
    font-weight: 600;
}

.text-deduplicates .num-green {
    color: #3bb76d;
}

.text-deduplicates .num-red {
    color: #e6162d;
}
</style>
