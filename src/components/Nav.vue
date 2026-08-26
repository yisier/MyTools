<template>
    <aside class="sidebar">
        <div class="sidebar-brand" @click="goHome" :title="$t('home')">
            <el-icon :size="20" color="#409eff"><Setting /></el-icon>
            <span class="brand-name">MyTools</span>
        </div>

        <nav class="sidebar-nav">
            <div v-for="group in groups" :key="group.key" class="nav-group">
                <div class="nav-group-title">{{ $t(group.titleKey) }}</div>
                <router-link
                    v-for="item in group.items"
                    :key="item.path"
                    :to="'/' + currentLang + item.path"
                    class="nav-item"
                    :class="{ active: isActive(item.path) }"
                >
                    <el-icon :size="16"><component :is="item.icon" /></el-icon>
                    <span class="nav-item-label">{{ $t(item.nameKey) }}</span>
                </router-link>
            </div>
        </nav>

        <div class="sidebar-footer">
            <el-dropdown trigger="click" popper-class="lang-dropdown" @command="changeLocale">
                <button class="lang-btn">
                    <el-icon :size="14"><Sort /></el-icon>
                    <span>{{ currentLabel }}</span>
                    <el-icon :size="12" class="caret"><ArrowDown /></el-icon>
                </button>
                <template #dropdown>
                    <el-dropdown-menu>
                        <el-dropdown-item
                            v-for="item in options"
                            :key="item.value"
                            :command="item.value"
                            :class="{ 'is-current': item.value === currentLang }"
                        >
                            {{ item.label }}
                        </el-dropdown-item>
                    </el-dropdown-menu>
                </template>
            </el-dropdown>
        </div>
    </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
    Sort,
    ArrowDown,
    Setting,
    HomeFilled,
    Document,
    DocumentCopy,
    DataAnalysis,
    Key,
    Link,
    AlarmClock,
    Timer,
    Switch,
    Connection,
    Grid,
    DocumentChecked,
    Filter,
    EditPen
} from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const i18n = useI18n()
const currentLang = computed(() => route.params.lang || i18n.locale.value)

const groups = [
    {
        key: 'home',
        titleKey: 'home',
        items: [
            { path: '', icon: HomeFilled, nameKey: 'home' }
        ]
    },
    {
        key: 'dev',
        titleKey: 'devTool',
        items: [
            { path: '/json', icon: Document, nameKey: 'json.name' },
            { path: '/xml', icon: DocumentCopy, nameKey: 'xml.name' },
            { path: '/sql', icon: DataAnalysis, nameKey: 'sql.name' },
            { path: '/base64', icon: Key, nameKey: 'base64.name' },
            { path: '/url', icon: Link, nameKey: 'url.name' },
            { path: '/linuxCron', icon: AlarmClock, nameKey: 'linuxCron.name' },
            { path: '/javaCron', icon: Timer, nameKey: 'javaCron.name' },
            { path: '/camelCaseToUnderline', icon: Switch, nameKey: 'camel.name' },
            { path: '/hibernateToSql', icon: Connection, nameKey: 'hibernate.name' },
            { path: '/qrcode', icon: Grid, nameKey: 'qrcode.name' }
        ]
    },
    {
        key: 'text',
        titleKey: 'textTool',
        items: [
            { path: '/text-diff', icon: DocumentChecked, nameKey: 'diff.name' },
            { path: '/text-deduplicates', icon: Filter, nameKey: 'deduplicates.name' },
            { path: '/text-edit', icon: EditPen, nameKey: 'text.name' }
        ]
    }
]

function isActive(path) {
    const target = '/' + currentLang.value + path
    const current = route.path.replace(/\/+$/, '') || '/'
    return current === target || (path === '' && (current === '/' + currentLang.value || current === '/'))
}

function goHome() {
    router.push('/' + currentLang.value)
}

const options = [
    { value: 'en', label: 'English' },
    { value: 'zh', label: '中文简体' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'es', label: 'Español' },
    { value: 'vi', label: 'Tiếng Việt' }
]

const currentLabel = computed(() => {
    const found = options.find((item) => item.value === currentLang.value)
    return found ? found.label : 'English'
})

function changeLocale(v) {
    localStorage.setItem('language', v)
    const newPath = route.path.replace(/^\/[^/]*/, '/' + v)
    router.push(newPath)
    i18n.global.locale.value = v
}
</script>

<style scoped>
.sidebar {
    width: 224px;
    flex-shrink: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;
    background: #fff;
    border-right: 1px solid #e4e7ed;
}

.sidebar-brand {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 16px 16px 12px;
    cursor: pointer;
    user-select: none;
}

.brand-name {
    font-size: 15px;
    font-weight: 700;
    color: #303133;
    letter-spacing: 0.3px;
}

.sidebar-nav {
    flex: 1;
    overflow-y: auto;
    padding: 0 8px 12px;
}

.sidebar-nav::-webkit-scrollbar {
    width: 6px;
}

.sidebar-nav::-webkit-scrollbar-thumb {
    background: #dcdfe6;
    border-radius: 3px;
}

.nav-group {
    margin-top: 12px;
}

.nav-group-title {
    font-size: 11px;
    font-weight: 600;
    color: #909399;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    padding: 0 10px;
    margin-bottom: 4px;
}

.nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 10px;
    margin-bottom: 2px;
    border-radius: 6px;
    color: #303133;
    font-size: 13.5px;
    text-decoration: none;
    transition: background-color 0.12s, color 0.12s;
}

.nav-item:hover {
    background: #f5f7fa;
}

.nav-item.active {
    background: #ecf5ff;
    color: #409eff;
    font-weight: 600;
}

.nav-item-label {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.sidebar-footer {
    border-top: 1px solid #f0f2f5;
    padding: 10px 12px;
}

.lang-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    width: 100%;
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #606266;
    font-size: 13px;
    cursor: pointer;
    transition: background-color 0.12s;
}

.lang-btn:hover {
    background: #f5f7fa;
}

.lang-btn .caret {
    margin-left: auto;
    color: #c0c4cc;
}
</style>
