<template>
  <el-row justify="center" align="middle">
    <el-col :md="16">
      <h3>{{ $t('linuxCron.desc') }}</h3>
    </el-col>

    <el-col :md="8" :offset="2">
      <div class="box">
        <el-input v-model="inputValue" :placeholder="$t('linuxCron.placeholder')" class="inp"></el-input>
        <el-button type="primary" @click="showExecTime">{{ $t('linuxCron.parse') }}</el-button>
      </div>

      <div class="error-msg" v-if="errorMsg != ''">
        <el-row align="middle">
          <el-col :md="1">
            <el-icon size="40" color="#e75033">
              <CircleCloseFilled />
            </el-icon>
          </el-col>
          <el-col :md="12" style="margin-left: 30px;">
            <div v-html="errorMsg"></div>
          </el-col>
        </el-row>
      </div>

      <h4>{{ $t('linuxCron.next7') }}</h4>

      <div style="margin-left: -30px;padding-top: 10px;">
        <el-timeline>
          <el-timeline-item v-for="(activity, index) in activities" :key="index" type="success" :hollow="false"
            :timestamp="activity.timestamp" :center="false">
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-col>

    <el-col :md="8" :offset="2">
      <h4>{{ $t('linuxCron.example') }}</h4>

      <el-table :data="tableData" style="width: 100%" :border="true" :show-header="false" :cell-style="cellStyle"
        cell-class-name="a">
        <el-table-column prop="one" align="center">
          <template #default="{ row }">
            <div v-html="row.one"></div>
          </template>
        </el-table-column>
        <el-table-column prop="two" align="center">
          <template #default="{ row }">
            <div v-html="row.two"></div>
          </template>
        </el-table-column>
        <el-table-column prop="three" align="center">
          <template #default="{ row }">
            <div v-html="row.three"></div>
          </template>
        </el-table-column>
        <el-table-column prop="four" align="center">
          <template #default="{ row }">
            <div v-html="row.four"></div>
          </template>
        </el-table-column>
        <el-table-column prop="five" align="center">
          <template #default="{ row }">
            <div v-html="row.five"></div>
          </template>
        </el-table-column>
      </el-table>
    </el-col>
  </el-row>

  <pre v-html="formatExplain"></pre>
</template>



<script setup>
import { reactive, ref } from 'vue'
import parser from 'cron-parser'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const tableData = [
  {
    one: '*',
    two: '*',
    three: '*',
    four: '*',
    five: '*'
  },
  {
    one: t('linuxCron.minute'),
    two: t('linuxCron.hour'),
    three: t('linuxCron.day'),
    four: t('linuxCron.month'),
    five: t('linuxCron.week'),
  }
]


var inputValue = ref('*/2 * * * *')

var errorMsg = ref('')

var formatExplain = ref('')
formatExplain.value = ""


var activities = ref([])

function showExecTime() {
  try {
    // console.log(inputValue.value)
    if (inputValue.value === '') {
      return
    }
    var interval = parser.parseExpression(inputValue.value);

    activities.value = []

    for (let index = 0; index < 7; index++) {
      var time = formatDate(interval.next().toString())
      activities.value.push({ "timestamp": time })
      // console.log(time)
    }

    errorMsg.value = ''
  } catch (error) {
    errorMsg.value = t('linuxCron.errorParse') + error.message
    // console.log(error)
  }
}


function formatDate(value = Date.now(), format = "Y-M-D h:m:s") {
  const formatNumber = n => `0${n}`.slice(-2);
  const date = new Date(value);
  const formatList = ["Y", "M", "D", "h", "m", "s"];
  const resultList = [];
  resultList.push(date.getFullYear().toString());
  resultList.push(formatNumber(date.getMonth() + 1));
  resultList.push(formatNumber(date.getDate()));
  resultList.push(formatNumber(date.getHours()));
  resultList.push(formatNumber(date.getMinutes()));
  resultList.push(formatNumber(date.getSeconds()));
  for (let i = 0; i < resultList.length; i++) {
    format = format.replace(formatList[i], resultList[i]);
  }
  return format;
}


function cellStyle({ row, column, rowIndex, columnIndex }) {
  switch (columnIndex) {
    case 0:
      return { backgroundColor: '#CCFFE6' }
    case 1:
      return { backgroundColor: '#FFFF99' }
    case 2:
      return { backgroundColor: '#F7C6C6' }
    case 3:
      return { backgroundColor: '#CCCCFF' }
    case 4:
      return { backgroundColor: '#E6FFCC' }
  }

  return {}
}


</script>

<style>
.container {
  display: flex;
  align-items: center;
}


.form-container {
  display: flex;
  justify-content: space-between;
}

.box {
  width: 500px;
  /* height: 100px; */
  /* margin: 150px auto 0; */
}

.inp {
  width: 300px !important;
  margin-right: 20px;
}


.error-msg {
  color: #e75033;
  background-color: #ffe5e0;
  font-size: 12px;
  padding: 10px;
  margin-top: 20px;
}

.a {
  font-weight: bolder;
  color: black;
  border: 1px solid black;
}


.el-table {
  border: 1px solid black;
}
</style>