<template>
  <div class="qrcode-page">
    <el-row :gutter="20">
      <el-col :xs="24" :md="12">
        <el-card class="panel input-panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><EditPen /></el-icon>
                {{ $t('qrcode.inputLabel') }}
              </span>
              <el-button v-if="inputText" link size="small" @click="clearInput">
                {{ $t('qrcode.clearValue') }}
              </el-button>
            </div>
          </template>

          <el-input
            v-model="inputText"
            type="textarea"
            :rows="5"
            :placeholder="$t('qrcode.placeholder')"
            resize="none"
            maxlength="500"
            show-word-limit
          />

          <div class="option-row">
            <span class="option-label">{{ $t('qrcode.size') }}</span>
            <el-radio-group v-model="size" size="small">
              <el-radio-button :value="160">S</el-radio-button>
              <el-radio-button :value="220">M</el-radio-button>
              <el-radio-button :value="300">L</el-radio-button>
            </el-radio-group>
          </div>

          <div class="generate-row">
            <el-button
              type="primary"
              :disabled="!inputText"
              @click="generate"
            >
              <el-icon><Refresh /></el-icon>
              {{ $t('qrcode.generate') }}
            </el-button>
          </div>
        </el-card>

        <el-card class="panel history-panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><Clock /></el-icon>
                {{ $t('qrcode.historyTitle') }}
                <span class="history-count">{{ history.length }}/10</span>
              </span>
              <el-button
                v-if="history.length"
                link
                size="small"
                @click="clearHistory"
              >
                {{ $t('qrcode.clearAll') }}
              </el-button>
            </div>
          </template>

          <div v-if="!history.length" class="empty-tip">
            {{ $t('qrcode.emptyHistory') }}
          </div>

          <ul v-else class="history-list">
            <li
              v-for="item in history"
              :key="item.id"
              class="history-item"
              @click="loadFromHistory(item)"
            >
              <img v-if="item.dataUrl" :src="item.dataUrl" class="history-thumb" alt="" />
              <div class="history-info">
                <div class="history-text" :title="item.text">{{ item.text || $t('qrcode.emptyText') }}</div>
                <div class="history-time">{{ formatTime(item.time) }}</div>
              </div>
              <el-button
                class="history-delete"
                link
                size="small"
                @click.stop="removeHistory(item.id)"
              >
                <el-icon><Close /></el-icon>
              </el-button>
            </li>
          </ul>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="12">
        <el-card class="panel preview-panel" shadow="never">
          <template #header>
            <div class="panel-header">
              <span class="panel-title">
                <el-icon><Picture /></el-icon>
                {{ $t('qrcode.previewTitle') }}
              </span>
            </div>
          </template>

          <div class="preview-wrapper">
            <div v-if="dataUrl" class="qr-wrapper">
              <img :src="dataUrl" :width="size" :height="size" alt="QR Code" />
              <div class="qr-text" :title="generatedText">{{ generatedText }}</div>
            </div>
            <div v-else class="qr-placeholder">
              <el-icon :size="64" color="#c0c4cc"><Picture /></el-icon>
              <p>{{ $t('qrcode.placeholder') }}</p>
            </div>
          </div>

          <div class="preview-actions">
            <el-button :disabled="!dataUrl" @click="downloadQr">
              <el-icon><Download /></el-icon>
              {{ $t('qrcode.download') }}
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import QRCode from 'qrcode'
import { ElMessage } from 'element-plus'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const STORAGE_KEY = 'qrcode_history'
const MAX_HISTORY = 10

const inputText = ref('')
const dataUrl = ref('')
const generatedText = ref('')
const size = ref(220)
const history = ref([])

function loadHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        history.value = parsed.slice(0, MAX_HISTORY)
      }
    }
  } catch (e) {
    history.value = []
  }
}

function persistHistory() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history.value))
  } catch (e) {
    ElMessage.error(t('qrcode.storageError'))
  }
}

async function generateQrCode(text) {
  if (!text) {
    return null
  }
  try {
    return await QRCode.toDataURL(text, {
      width: size.value,
      margin: 1,
      color: { dark: '#000000', light: '#ffffff' },
      errorCorrectionLevel: 'M',
    })
  } catch (e) {
    return null
  }
}

function formatTime(ts) {
  if (!ts) return ''
  const diff = Date.now() - ts
  const min = Math.floor(diff / 60000)
  if (min < 1) return t('qrcode.justNow')
  if (min < 60) return `${min} ${t('qrcode.minutesAgo')}`
  const hr = Math.floor(min / 60)
  if (hr < 24) return `${hr} ${t('qrcode.hoursAgo')}`
  const day = Math.floor(hr / 24)
  if (day < 30) return `${day} ${t('qrcode.daysAgo')}`
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function loadFromHistory(item) {
  inputText.value = item.text
  dataUrl.value = item.dataUrl || ''
  generatedText.value = item.text || ''
}

function removeHistory(id) {
  history.value = history.value.filter((it) => it.id !== id)
  persistHistory()
}

async function clearHistory() {
  if (!history.value.length) return
  history.value = []
  persistHistory()
}

async function generate() {
  const text = inputText.value.trim()
  if (!text) {
    ElMessage.warning(t('qrcode.emptyInput'))
    return
  }
  const url = await generateQrCode(text)
  if (!url) {
    ElMessage.error(t('qrcode.generateError'))
    return
  }
  dataUrl.value = url
  generatedText.value = text
  const filtered = history.value.filter((it) => it.text !== text)
  filtered.unshift({
    id: Date.now() + Math.random().toString(36).slice(2, 8),
    text,
    time: Date.now(),
    dataUrl: url,
  })
  history.value = filtered.slice(0, MAX_HISTORY)
  persistHistory()
}

function clearInput() {
  inputText.value = ''
  dataUrl.value = ''
  generatedText.value = ''
}

function downloadQr() {
  if (!dataUrl.value) return
  const a = document.createElement('a')
  a.href = dataUrl.value
  a.download = `qrcode-${Date.now()}.png`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
}

onMounted(() => {
  loadHistory()
})
</script>

<style scoped>
.qrcode-page {
  padding: 0 4px;
}

.panel {
  margin-bottom: 16px;
  border: 1px solid #ebeef5;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.panel-title {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #303133;
}

.panel-title .el-icon {
  color: #409eff;
}

.option-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 14px;
  font-size: 13px;
  color: #606266;
}

.option-label {
  flex-shrink: 0;
}

.generate-row {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}

.history-count {
  margin-left: 6px;
  font-size: 12px;
  font-weight: normal;
  color: #909399;
}

.empty-tip {
  padding: 32px 0;
  text-align: center;
  color: #c0c4cc;
  font-size: 13px;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
  max-height: 360px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 8px;
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;
}

.history-item:hover {
  background: #f5f7fa;
}

.history-thumb {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  background: #fff;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  object-fit: contain;
}

.history-info {
  flex: 1;
  min-width: 0;
}

.history-text {
  font-size: 13px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-time {
  margin-top: 2px;
  font-size: 11px;
  color: #909399;
}

.history-delete {
  flex-shrink: 0;
  color: #c0c4cc;
}

.history-delete:hover {
  color: #f56c6c;
}

.preview-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 320px;
  padding: 16px;
  background: #fafbfc;
  border-radius: 6px;
}

.qr-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.qr-wrapper img {
  display: block;
  max-width: 100%;
  height: auto;
  background: #fff;
  padding: 6px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
}

.qr-text {
  width: 100%;
  max-width: 100%;
  padding: 8px 12px;
  background: #f5f7fa;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.5;
  color: #303133;
  text-align: center;
  word-break: break-all;
  white-space: pre-wrap;
  box-sizing: border-box;
}

.qr-placeholder {
  text-align: center;
  color: #c0c4cc;
}

.qr-placeholder p {
  margin: 12px 0 0;
  font-size: 13px;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 16px;
  justify-content: center;
}

@media (max-width: 768px) {
  .panel {
    margin-bottom: 12px;
  }
  .preview-wrapper {
    min-height: 240px;
  }
  .history-list {
    max-height: 280px;
  }
}
</style>
