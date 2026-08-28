<template>
    <div class="json">
        <el-row :gutter="20" justify="center" align="middle">
            <el-col :md="20">
                <div class="ace">
                    <el-card class="box-card">
                        <template #header>
                            <div class="card-header">
                                <span>
                                    <el-icon>
                                        <EditPen />
                                    </el-icon>
                                    {{ $t('camel.camelCaseToUnderline') }}
                                </span>
                            </div>
                        </template>
                    </el-card>

                    <div :style="{ boxShadow: `var(--el-box-shadow-lighter)` }" ref="ace" class="ace-editor" />

                    <div class="success-msg" v-if="checkResut">
                        <el-row align="middle">
                            <el-col :md="1" :offset="1">
                                <el-icon size="40">
                                    <SuccessFilled />
                                </el-icon>
                            </el-col>
                            <el-col :md="5" style="margin-left: 20px;">
                            </el-col>
                        </el-row>
                    </div>

                    <div class="error-msg" v-if="checkResut != null && !checkResut && errorMsg != ''">
                        <el-row align="middle">
                            <el-col :md="1" :offset="1">
                                <el-icon size="40">
                                    <CircleCloseFilled />
                                </el-icon>
                            </el-col>
                            <el-col :md="5" style="margin-left: 20px;">
                                <div v-html="errorMsg"></div>
                            </el-col>
                        </el-row>
                    </div>

                    <div class="ace-toolbar">
                        <el-button type="primary" @click="camelToUnderline()">{{ $t('camel.camelToUnderline') }}</el-button>
                        <el-button type="primary" @click="underlineToCamel()">{{ $t('camel.underlineToCamel') }}</el-button>
                        <el-button @click="clearValue()">{{ $t('camel.clearValue') }}</el-button>
                    </div>


                </div>
            </el-col>
            <el-col :md="20">
                <div style="margin-top: 10px;"></div>
            </el-col>

            <el-col :md="20" v-show="resutVal">
                <el-card class="box-card">
                    <template #header>
                        <div class="card-header">
                            <span>
                                <el-icon>
                                    <List />
                                </el-icon>
                                {{ $t('camel.result') }}
                            </span>
                            <el-button type="primary" size="small" @click="copy()">{{ $t('camel.copy') }}</el-button>
                        </div>

                    </template>
                </el-card>
                <div :style="{ boxShadow: `var(--el-box-shadow-lighter)` }" ref="ace2" class="ace-editor" />

                <!-- <el-input v-model="base64" :rows="10" readonly type="textarea" :value="resutVal" /> -->
            </el-col>


        </el-row>
    </div>
</template>
    
<script>
import ace from 'ace-builds'

import themeEclipseUrl from 'ace-builds/src-min-noconflict/theme-eclipse?url';
ace.config.setModuleUrl('ace/theme/eclipse', themeEclipseUrl);

import themeOneDarkUrl from 'ace-builds/src-min-noconflict/theme-one_dark?url';
ace.config.setModuleUrl('ace/theme/one_dark', themeOneDarkUrl);

import { isDark, onThemeChange } from '@/theme'

import 'ace-builds/src-min-noconflict/ext-language_tools';
ace.require("ace/ext/language_tools");

import 'ace-builds/src-min-noconflict/ext-searchbox';
ace.require("ace/ext/ext-searchbox");



export default {
    name: 'CamelCaseToUnderline',
    data() {
        return {
            editor: null,
            editor2: null,
            resutVal: "",
            editor2Option: {
                useWorker: false,
                maxLines: 10, // 最大行数，超过会自动出现滚动条
                minLines: 10, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
                fontSize: 14, // 编辑器内字体大小
                theme: isDark() ? 'ace/theme/one_dark' : 'ace/theme/eclipse', // 默认设置的主题
                mode: 'ace/mode/text', // 默认设置的语言模式
                tabSize: 4,// 制表符设置为 4 个空格大小
                readOnly: true,//只读
                enableBasicAutocompletion: false, //启动基本自动完成
                showPrintMargin: false,
                wrap: 'free',  //  换行
                highlightActiveLine: false
            }
        }
    },
    mounted() {
        //快速开始-demo
        this.editor = ace.edit(this.$refs.ace, {
            useWorker: true,
            maxLines: 18, // 最大行数，超过会自动出现滚动条
            minLines: 18, // 最小行数，还未到最大行数时，编辑器会自动伸缩大小
            fontSize: 14, // 编辑器内字体大小
            theme: isDark() ? 'ace/theme/one_dark' : 'ace/theme/eclipse', // 默认设置的主题
            mode: 'ace/mode/text', // 默认设置的语言模式
            tabSize: 4,// 制表符设置为 4 个空格大小
            readOnly: false,//只读
            enableBasicAutocompletion: true, //启动基本自动完成
            showPrintMargin: false,
            wrap: 'free',  //  换行,
            highlightActiveLine: false,
            value: 'UserName\nPassWord'

        });

        this.editor2 = ace.edit(this.$refs.ace2, this.editor2Option);

        // 系统主题切换时同步编辑器主题
        this.offThemeChange = onThemeChange((dark) => {
            const theme = dark ? 'ace/theme/one_dark' : 'ace/theme/eclipse'
            this.editor2Option.theme = theme
            this.editor && this.editor.setTheme(theme)
            this.editor2 && this.editor2.setTheme(theme)
        })

        const camelCase = localStorage.getItem('camelCase')
        if (camelCase) {
            this.editor.setValue(camelCase, -1)
        }


        this.camelToUnderline()

    },
    beforeUnmount() {
        this.offThemeChange && this.offThemeChange()
        this.editor && this.editor.destroy()
        this.editor2 && this.editor2.destroy()
    },
    methods: {

        underlineToCamel() {
            var editVal = this.editor.getValue();
            console.log(this.editor.session.getLength())
            this.resutVal = editVal.replace(/\_(\w)/g, (all, letter) => letter.toUpperCase())
            localStorage.setItem('camelCase', editVal)

            // this.editor2.session.set
            this.editor2Option.maxLines = this.editor.session.getLength() + 2
            this.editor2Option.minLines = this.editor.session.getLength() + 1

            this.editor2.destroy();
            this.editor2 = ace.edit(this.$refs.ace2, this.editor2Option);
            this.editor2.setValue(this.resutVal)
            // this.editor2.resize()
        },

        camelToUnderline() {
            var editVal = this.editor.getValue();
            this.resutVal = editVal.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();

            this.editor2Option.maxLines = this.editor.session.getLength() + 1
            this.editor2Option.minLines = this.editor.session.getLength() + 1

            this.editor2.destroy();
            this.editor2 = ace.edit(this.$refs.ace2, this.editor2Option);
            this.editor2.setValue(this.resutVal)
            // this.editor2.resize()

            localStorage.setItem('camelCase', editVal)
        },

        clearValue: function () {
            this.editor.setValue("")
            this.editor2.setValue("")
            this.resutVal = ''
            localStorage.setItem('camelCase', this.editor.getValue())
        },
        copy() {
            const oInput = document.createElement('textarea')
            oInput.value = this.editor2.getValue()
            document.body.appendChild(oInput)
            oInput.select()
            document.execCommand('Copy')
            oInput.remove()
            ElNotification({
                title: this.$t('camel.copySuccess'),
                type: 'success',
            })
        }
    }
}
</script>
  
<style>
.json .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.json .el-card__body {
    padding: 0px;
}

.json .el-card__header {
    padding: 10px;
    box-sizing: border-box;
    border: 1px;
    /* background-color: #ebebeb; */
}
</style>
  
  
    
<style scoped>
.ace-editor {
    margin-bottom: 20px;
}

.ace-toolbar {
    display: flex;
    justify-content: center;
    margin-top: 20px;
}

.ace-toolbar>button {
    margin-left: 20px;
}


.success-msg {
    color: var(--el-color-success);
    background-color: var(--el-color-success-light-9);
    font-size: 12px;
    padding: 10px;
}


.error-msg {
    color: var(--el-color-danger);
    background-color: var(--el-color-danger-light-9);
    font-size: 12px;
    padding: 10px;
}

/* .el-col-offset-1 {
      margin-left: 2%;
  } */

.el-row {
    margin-bottom: 0px;
}
</style>