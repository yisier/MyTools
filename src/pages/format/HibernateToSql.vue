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
                                    {{ $t('hibernate.title') }}
                                </span>
                            </div>
                        </template>
                    </el-card>

                    <div :style="{ boxShadow: `var(--el-box-shadow-lighter)` }" ref="ace" class="ace-editor" />

                    <div class="error-msg" v-if="errorMsg != ''">
                        <el-row align="middle">
                            <el-col :md="1" :offset="1">
                                <el-icon size="40" color="#e75033">
                                    <CircleCloseFilled />
                                </el-icon>
                            </el-col>
                            <el-col :md="20" style="margin-left: 20px;">
                                <div v-html="errorMsg"></div>
                            </el-col>
                        </el-row>
                    </div>

                    <div class="ace-toolbar">
                        <el-button type="primary" @click="convert()">{{ $t('hibernate.convert') }}</el-button>
                        <el-button @click="clearValue()">{{ $t('hibernate.clearValue') }}</el-button>
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
                                {{ $t('hibernate.result') }}
                            </span>
                            <el-button type="primary" size="small" @click="copy()">{{ $t('hibernate.copy') }}</el-button>
                        </div>
                    </template>
                </el-card>
                <div :style="{ boxShadow: `var(--el-box-shadow-lighter)` }" ref="ace2" class="ace-editor" />
            </el-col>
        </el-row>
    </div>
</template>

<script>
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

const DEMO = `SELECT o FROM OrderInfo o
left join Customer c on c.id = o.customerId
left join Product p on p.id = o.product.productId
WHERE o.deletedFlag IS NULL AND o.status =:status
and c.cityCode =:cityCode and o.payType not in (:payTypes)
and p.skuInfo.barCode is null
order by p.skuInfo.createTime`;

export default {
    name: 'HibernateToSql',
    data() {
        return {
            editor: null,
            editor2: null,
            resutVal: "",
            errorMsg: "",
            editor2Option: {
                useWorker: false,
                maxLines: 18,
                minLines: 10,
                fontSize: 14,
                theme: 'ace/theme/eclipse',
                mode: 'ace/mode/sql',
                tabSize: 4,
                readOnly: true,
                enableBasicAutocompletion: false,
                showPrintMargin: false,
                wrap: 'free',
                highlightActiveLine: false
            }
        }
    },
    mounted() {
        this.editor = ace.edit(this.$refs.ace, {
            useWorker: true,
            maxLines: 22,
            minLines: 18,
            fontSize: 14,
            theme: 'ace/theme/eclipse',
            mode: 'ace/mode/sql',
            tabSize: 4,
            readOnly: false,
            enableBasicAutocompletion: true,
            showPrintMargin: false,
            wrap: 'free',
            highlightActiveLine: false,
            value: DEMO
        });

        this.editor2 = ace.edit(this.$refs.ace2, this.editor2Option);

        const cached = localStorage.getItem('hibernateToSql')
        if (cached) {
            this.editor.setValue(cached, -1)
        }

        this.convert()
    },
    methods: {
        camelToSnake(s) {
            if (!s) return s;
            return s
                .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
                .replace(/([A-Z]+)([A-Z][a-z])/g, '$1_$2')
                .toLowerCase();
        },

        collectAliases(hql) {
            const map = {};
            const re = /\b(from|join)\s+([A-Z][\w$]*)\s+(?:as\s+)?([a-zA-Z_][\w$]*)\b/gi;
            let m;
            while ((m = re.exec(hql)) !== null) {
                const alias = m[3];
                const entity = m[2];
                const kw = (m[1] || '').toLowerCase();
                const reserved = new Set(['on', 'where', 'and', 'or', 'group', 'order', 'having', 'left', 'right', 'inner', 'outer', 'cross', 'full', 'join', 'as', 'fetch']);
                if (reserved.has(alias.toLowerCase())) continue;
                map[alias] = { entity, table: this.camelToSnake(entity) };
            }
            return map;
        },

        replaceEntityDeclarations(hql, aliasMap) {
            return hql.replace(/\b(from|join)\s+([A-Z][\w$]*)\s+((?:as\s+)?)([a-zA-Z_][\w$]*)\b/gi, (full, kw, entity, asKw, alias) => {
                if (!aliasMap[alias]) return full;
                return `${kw} ${aliasMap[alias].table} ${asKw}${alias}`;
            });
        },

        expandPropertyPaths(hql, aliasMap) {
            const aliases = Object.keys(aliasMap);
            if (aliases.length === 0) return hql;
            const aliasAlt = aliases
                .sort((a, b) => b.length - a.length)
                .map(a => a.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
                .join('|');
            const re = new RegExp(`\\b(${aliasAlt})((?:\\.[a-zA-Z_][\\w$]*)+)\\b`, 'g');
            return hql.replace(re, (full, alias, tail) => {
                const segments = tail.slice(1).split('.');
                const snake = segments.map(s => this.camelToSnake(s)).join('_');
                return `${alias}.${snake}`;
            });
        },

        convertHql(hql) {
            const aliasMap = this.collectAliases(hql);
            let out = this.replaceEntityDeclarations(hql, aliasMap);
            out = this.expandPropertyPaths(out, aliasMap);
            return out;
        },

        convert() {
            const input = this.editor.getValue();
            localStorage.setItem('hibernateToSql', input);

            if (!input.trim()) {
                this.resutVal = '';
                this.errorMsg = '';
                this.refreshOutput('');
                return;
            }

            try {
                const raw = this.convertHql(input);
                let out;
                try {
                    out = format(raw, { paramTypes: { named: [':'] } });
                } catch (e) {
                    try {
                        out = format(raw);
                    } catch (e2) {
                        out = raw;
                    }
                }
                this.resutVal = out;
                this.errorMsg = '';
                this.refreshOutput(out);
            } catch (error) {
                this.errorMsg = error.message;
            }
        },

        refreshOutput(val) {
            const lines = Math.max(10, Math.min(40, val.split(/\n/).length + 1));
            this.editor2Option.maxLines = lines;
            this.editor2Option.minLines = lines;
            this.editor2.destroy();
            this.editor2 = ace.edit(this.$refs.ace2, this.editor2Option);
            this.editor2.setValue(val, -1);
        },

        clearValue() {
            this.editor.setValue('');
            this.editor2.setValue('');
            this.resutVal = '';
            this.errorMsg = '';
            localStorage.setItem('hibernateToSql', '');
        },

        copy() {
            const oInput = document.createElement('textarea');
            oInput.value = this.editor2.getValue();
            document.body.appendChild(oInput);
            oInput.select();
            document.execCommand('Copy');
            oInput.remove();
            ElNotification({
                title: this.$t('hibernate.copySuccess'),
                type: 'success',
            });
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

.error-msg {
    color: #e75033;
    background-color: #ffe5e0;
    font-size: 12px;
    padding: 10px;
}

.el-row {
    margin-bottom: 0px;
}
</style>
