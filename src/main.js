import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'


import { createI18n } from 'vue-i18n'; // 注意这里的路径

import * as ElementPlusIconsVue from '@element-plus/icons-vue'
const app = createApp(App)
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
    app.component(key, component)
}

// 支持的语言列表
const SUPPORTED_LANGS = ['zh', 'en', 'ja', 'ko', 'es', 'vi']

// 语言检测优先级：本地存储 > 电脑系统语言 > 英文
const browserLang = (navigator.language || 'en').slice(0, 2).toLowerCase()
let language = localStorage.getItem("language")
if (!language || !SUPPORTED_LANGS.includes(language)) {
    language = SUPPORTED_LANGS.includes(browserLang) ? browserLang : 'en'
}

import en from './lang/en.json';
import zh from './lang/zh.json';
import ja from './lang/ja.json';
import ko from './lang/ko.json';
import es from './lang/es.json';
import vi from './lang/vi.json';


const i18n = createI18n({
    legacy: false,
    locale: language,
    fallbackLocale: 'en',
    messages: {
        "zh": zh,
        "en": en,
        "ja": ja,
        "ko": ko,
        "es": es,
        "vi": vi,
    }
});


// 2. 定义一些路由
// 每个路由都需要映射到一个组件。
// 我们后面再讨论嵌套路由。

const routes = [
    {
        path: '/:lang?',
        component: () => import('@/layouts/DefaultLayout.vue'),
        children: [
            {
                path: '',
                name: 'home',
                component: () => import('@/pages/Index.vue'),
                meta: {
                    title: 'nav.home'
                }
            },
            {
                path: 'json',
                name: 'Json',
                component: () => import('@/pages/format/Json.vue'),
                meta: {
                    title: 'nav.jsonFormat'
                }
            },
            {
                path: 'xml',
                name: 'Xml',
                component: () => import('@/pages/format/Xml.vue'),
                meta: {
                    title: 'nav.xmlFormat'
                }
            },
            {
                path: 'sql',
                name: 'Sql',
                component: () => import('@/pages/format/Sql.vue'),
                meta: {
                    title: 'nav.sqlFormat'
                }
            },
            {
                path: 'base64',
                name: 'base64',
                component: () => import('@/pages/encode/Base64.vue'),
                meta: {
                    title: 'nav.base64'
                }
            },
            {
                path: 'url',
                name: 'url',
                component: () => import('@/pages/encode/Url.vue'),
                meta: {
                    title: 'nav.urlEncode'
                }
            },
            {
                path: 'linuxCron',
                name: 'linuxCron',
                component: () => import('@/pages/format/LinuxCron.vue'),
                meta: {
                    title: 'nav.linuxCron'
                }
            },
            {
                path: 'javaCron',
                name: 'javaCron',
                component: () => import('@/pages/format/JavaCron.vue'),
                meta: {
                    title: 'nav.javaCron'
                }
            },
            {
                path: 'text-diff',
                name: 'text-diff',
                component: () => import('@/pages/text/text-diff.vue'),
                meta: {
                    title: 'nav.textDiff'
                }
            },
            {
                path: 'text-deduplicates',
                name: 'text-deduplicates',
                component: () => import('@/pages/text/text-deduplicates.vue'),
                meta: {
                    title: 'nav.textDedup'
                }
            },
            {
                path: 'text-edit',
                name: 'text-edit',
                component: () => import('@/pages/text/Editor.vue'),
                meta: {
                    title: 'nav.textEditor'
                }
            },
            {
                path: 'camelCaseToUnderline',
                name: 'camelCaseToUnderline',
                component: () => import('@/pages/format/camelCaseToUnderline.vue'),
                meta: {
                    title: 'nav.camelCase'
                }
            },
            {
                path: 'hibernateToSql',
                name: 'hibernateToSql',
                component: () => import('@/pages/format/HibernateToSql.vue'),
                meta: {
                    title: 'nav.hibernateToSql'
                }
            },
            {
                path: 'qrcode',
                name: 'qrcode',
                component: () => import('@/pages/qrcode/QRCode.vue'),
                meta: {
                    title: 'nav.qrcode'
                }
            }
        ]
    }
];


const router = createRouter({
    history: createWebHistory("/"),
    routes
})

// 全局后置钩子
router.afterEach((to, from) => {
    // 使用 i18n 翻译标题
    document.title = i18n.global.t(to.meta.title);
})

// 修改路由守卫
router.beforeEach((to, from, next) => {
    // 获取 URL 中的语言参数
    const lang = to.params.lang || language
    
    // 如果是支持的语言，就切换
    if (['zh', 'en', 'ja', 'ko', 'es', 'vi'].includes(lang)) {
        i18n.global.locale.value = lang
        localStorage.setItem('language', lang)
    }
    
    // 如果URL中没有语言参数，重定向到带有默认语言的URL
    if (!to.params.lang && to.path !== '/') {
        return next(`/${lang}${to.path}`)
    }
    
    // 如果路径不正确，重定向到首页
    if (to.matched.length === 0) {
        return next(`/${lang}/`)
    }
    
    next()
})

//确保 _use_ 路由实例使
//整个应用支持路由。
app.use(router)

// main.js 引入
// 使用 i18n 插件
app.use(i18n);

app.mount('#app')
