<template>
  <el-row justify="center" align="middle">
    <el-col :md="16">
      <h3>{{ $t('javaCron.desc') }}</h3>
    </el-col>


    <el-col :md="16" :span="24">
      <el-form-item >
        <el-input v-model="expression2" :placeholder="$t('javaCron.cronPlaceholder')">
          <template #append>
            <el-button type="primary" @click="handleShowCron">
              {{ $t('javaCron.parse') }}
              <i class="el-icon-time el-icon--right"></i>
            </el-button>
          </template>

        </el-input>
      </el-form-item>
    </el-col>

    <el-col :md="16">
      <crontab ref="crontabRef" :expression="expression" :hideComponent="hideComponent"></crontab>
    </el-col>

  </el-row>

</template>





<script setup>
import { ref } from 'vue'

import Crontab from '../../components/Crontab/index.vue'

const expression = ref("");

const hideComponent = ref([]);

const expression2 = ref("");


function handleShowCron() {
  expression.value = expression2.value
  console.log(navigator.language)
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