<template>
    <el-row justify="center">
        <el-col :span="18">
            <h3>{{ $t('base64.text') }}：</h3>
            <el-input v-model="text" :rows="10" type="textarea" :placeholder="$t('base64.text')"
                :style="{ boxShadow: `var(--el-box-shadow-lighter)` }" />
        </el-col>

        <el-col :span="18" style="margin: 15px 0;" align="middle">
            <el-button type="primary" icon="BottomRight" @click="strToBase64()">{{ $t('base64.encode') }}</el-button>
            <el-button type="primary" icon="TopLeft" @click="base64ToStr()">{{ $t('base64.decode') }}</el-button>
        </el-col>

        <el-col :span="18">
            <h3>{{ $t('base64.base64') }}：</h3>
            <el-input v-model="base64" :rows="10" type="textarea" :placeholder="$t('base64.base64')"
                :style="{ boxShadow: `var(--el-box-shadow-lighter)` }" />
        </el-col>
    </el-row>
</template>
  
<script>
export default {
    name: 'Base64'
}
</script>
  
  
  
<script  setup>

    import { ref } from 'vue'

    const text = ref('')
    const base64 = ref('')

    text.value = ""
    function strToBase64() {
        base64.value = utf8_to_b64(text.value)
    }


    function base64ToStr() {
        var t = b64_to_utf8(base64.value)
        if (t != "") {
            text.value = t
        }
    }


    function utf8_to_b64(str) {
        return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, function (match, p1) {
            return String.fromCharCode(parseInt(p1, 16));
        }));
    }


    function b64_to_utf8(str) {
        try {
            let decoded = decodeURIComponent(Array.prototype.map.call(atob(str), function (c) {
                return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            return decoded;
        } catch (e) {
            ElNotification({
                title: 'Base64解码失败',
                message: '无效的Base64字符串',
                type: 'error',
            })
            return "";
        }
    }

</script>
  
<style></style>