<template>
  <div class="home">
    <header class="home-hero">
      <p class="home-subtitle">{{ $t('homeSubtitle') }}</p>
    </header>

    <section v-for="section in sections" :key="section.titleKey" class="home-section">
      <h2 class="section-title">{{ $t(section.titleKey) }}</h2>
      <div class="tool-grid">
        <router-link
          v-for="tool in section.tools"
          :key="tool.path"
          :to="'/' + currentLang + tool.path"
          class="tool-card"
        >
          <div class="tool-icon">
            <el-icon :size="24"><component :is="tool.icon" /></el-icon>
          </div>
          <div class="tool-text">
            <div class="tool-name">{{ $t(tool.nameKey) }}</div>
            <div class="tool-desc">{{ $t(tool.descKey) }}</div>
          </div>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import {
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
const i18n = useI18n()
const currentLang = computed(() => route.params.lang || i18n.locale.value)

const sections = [
  {
    titleKey: 'devTool',
    tools: [
      { path: '/json', icon: Document, nameKey: 'json.name', descKey: 'json.desc' },
      { path: '/xml', icon: DocumentCopy, nameKey: 'xml.name', descKey: 'xml.desc' },
      { path: '/sql', icon: DataAnalysis, nameKey: 'sql.name', descKey: 'sql.desc' },
      { path: '/base64', icon: Key, nameKey: 'base64.name', descKey: 'base64.desc' },
      { path: '/url', icon: Link, nameKey: 'url.name', descKey: 'url.desc' },
      { path: '/linuxCron', icon: AlarmClock, nameKey: 'linuxCron.name', descKey: 'linuxCron.desc' },
      { path: '/javaCron', icon: Timer, nameKey: 'javaCron.name', descKey: 'javaCron.desc' },
      { path: '/camelCaseToUnderline', icon: Switch, nameKey: 'camel.name', descKey: 'camel.desc' },
      { path: '/hibernateToSql', icon: Connection, nameKey: 'hibernate.name', descKey: 'hibernate.desc' },
      { path: '/qrcode', icon: Grid, nameKey: 'qrcode.name', descKey: 'qrcode.desc' }
    ]
  },
  {
    titleKey: 'textTool',
    tools: [
      { path: '/text-diff', icon: DocumentChecked, nameKey: 'diff.name', descKey: 'diff.desc' },
      { path: '/text-deduplicates', icon: Filter, nameKey: 'deduplicates.name', descKey: 'deduplicates.desc' },
      { path: '/text-edit', icon: EditPen, nameKey: 'text.name', descKey: 'text.desc' }
    ]
  }
]
</script>

<style scoped>
.home {
  max-width: 1400px;
  margin: 0 auto;
  padding: 28px 36px 48px;
}

.home-hero {
  text-align: center;
  padding: 16px 0 32px;
}

.home-subtitle {
  font-size: 14px;
  color: #909399;
  margin: 0;
}

.home-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: #606266;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 12px 4px;
}

.tool-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 12px;
}

.tool-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 18px;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 10px;
  color: #303133;
  text-decoration: none;
  transition: border-color 0.15s, transform 0.15s, box-shadow 0.15s;
}

.tool-card:hover {
  border-color: #c6e2ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
}

.tool-card:active {
  transform: translateY(0);
}

.tool-icon {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #ecf5ff;
  color: #409eff;
}

.tool-text {
  flex: 1;
  min-width: 0;
}

.tool-name {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tool-desc {
  margin-top: 3px;
  font-size: 12px;
  color: #909399;
  line-height: 1.4;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>