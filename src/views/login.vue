<template>
  <div class="login-page">
    <motion.div class="bg" :initial="{ opacity: 0 }" :animate="{ opacity: 1 }" :transition="{ duration: 0.6 }">
      <motion.div class="blob blob-1" :animate="{ y: [0, -18, 0] }" :transition="{ duration: 6, repeat: Infinity }" />
      <motion.div class="blob blob-2" :animate="{ y: [0, 14, 0] }" :transition="{ duration: 7, repeat: Infinity }" />
      <motion.div class="blob blob-3" :animate="{ y: [0, -10, 0] }" :transition="{ duration: 8, repeat: Infinity }" />
    </motion.div>

    <motion.div
      class="panel"
      :initial="{ opacity: 0, y: 18, scale: 0.98 }"
      :animate="{ opacity: 1, y: 0, scale: 1 }"
      :transition="{ duration: 0.5 }"
    >
      <el-card class="card" shadow="always">
        <div class="header">
          <motion.div :initial="{ opacity: 0, y: 6 }" :animate="{ opacity: 1, y: 0 }" :transition="{ delay: 0.05 }">
            <div class="title">管理系统</div>
            <div class="subtitle">欢迎回来，请登录继续</div>
          </motion.div>
        </div>

        <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="loginHandle">
          <el-form-item label="账号 / 邮箱 / 手机号" prop="username">
            <el-input v-model="form.username" placeholder="请输入账号或邮箱或手机号" clearable autocomplete="username" />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input v-model="form.password" placeholder="请输入密码" show-password autocomplete="current-password" />
          </el-form-item>

          <div class="row">
            <el-checkbox v-model="isSavePass" label="记住账号密码" size="default" />
            <el-link type="primary" underline="never" @click="handleForgot">忘记密码？</el-link>
          </div>

          <motion.div :whileHover="{ scale: 1.01 }" :whilePress="{ scale: 0.99 }">
            <el-button @click="loginHandle" type="primary" class="submit" :loading="loadingLogin">
              {{ loadingLogin ? '登录中' : '登录' }}
            </el-button>
          </motion.div>

          <div class="footer">
            <span class="tip">还没有账号？</span>
            <el-link type="primary" underline="never" @click="handleRegister">去注册</el-link>
          </div>
        </el-form>
      </el-card>
    </motion.div>
  </div>
</template>

<script setup>
import { motion } from 'motion-v';
import { onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

import { login } from '@/api/auth';
import { isCode } from '@/utils/myUtil';
import { setToken } from '@/utils/myCookie';

const router = useRouter();

const STORAGE_KEY = 'manage-system:login';

const loadingLogin = ref(false);
const isSavePass = ref(false);

const formRef = ref(null);
const form = reactive({
  username: '',
  password: '',
});

const rules = reactive({
  username: [{ required: true, message: '请输入账号/邮箱/手机号', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
});

const loadRemember = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    isSavePass.value = Boolean(parsed?.remember);
    if (isSavePass.value) {
      if (parsed?.username) form.username = String(parsed.username);
      if (parsed?.password) form.password = String(parsed.password);
    }
  } catch {
  }
};

watch(
  () => isSavePass.value,
  (v) => {
    if (!v) {
      localStorage.removeItem(STORAGE_KEY);
    }
  }
);

async function loginHandle() {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    loadingLogin.value = true;
    try {
      const res = await login({ username: form.username.trim(), password: form.password });
      if (isCode(res)) {
        setToken(res.token);
        // 如果勾选了记住密码，则保存；否则清除保存的信息
        if (isSavePass.value) {
          localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify({ remember: true, username: form.username, password: form.password })
          );
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
        form.password = '';
        await router.push('/home');
        ElMessage.success('登录成功！');
        return;
      }
      ElMessage.error(res?.message || '登录失败');
    } catch (e) {
      // ElMessage.error(e?.response?.data?.message || e?.message || '登录失败');
    } finally {
      loadingLogin.value = false;
    }
  });
}

function handleForgot() {
  ElMessageBox.alert('当前版本暂未开放找回密码功能，请联系管理员处理。', '提示', { confirmButtonText: '知道了' });
}

function handleRegister() {
  ElMessageBox.alert('当前版本暂未开放注册入口，请联系管理员开通账号。', '提示', { confirmButtonText: '知道了' });
}

onMounted(() => {
  loadRemember();
});

</script>

<style lang="scss" scoped>
.login-page {
  height: 100vh;
  position: relative;
  overflow: hidden;
  display: grid;
  align-items: center;
  justify-content: center;
  background: radial-gradient(1200px 600px at 20% 20%, rgba(64, 158, 255, 0.22), transparent 60%),
    radial-gradient(1200px 600px at 80% 70%, rgba(103, 194, 58, 0.18), transparent 60%),
    linear-gradient(180deg, #0b1220 0%, #0f172a 100%);
}

.bg {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.blob {
  position: absolute;
  width: 380px;
  height: 380px;
  border-radius: 999px;
  filter: blur(50px);
  opacity: 0.55;
}

.blob-1 {
  top: -120px;
  left: -120px;
  background: radial-gradient(circle at 30% 30%, rgba(64, 158, 255, 0.9), rgba(64, 158, 255, 0.05));
}

.blob-2 {
  bottom: -140px;
  right: -140px;
  background: radial-gradient(circle at 30% 30%, rgba(103, 194, 58, 0.9), rgba(103, 194, 58, 0.05));
}

.blob-3 {
  top: 35%;
  right: 10%;
  width: 260px;
  height: 260px;
  background: radial-gradient(circle at 30% 30%, rgba(230, 162, 60, 0.9), rgba(230, 162, 60, 0.05));
}

.panel {
  position: relative;
  width: min(440px, calc(100vw - 32px));
}

.card {
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(8px);
}

.header {
  margin-bottom: 10px;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
}

.subtitle {
  margin-top: 6px;
  font-size: 13px;
  color: #64748b;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -2px;
  margin-bottom: 10px;
}

.submit {
  width: 100%;
  height: 40px;
  border-radius: 10px;
}

.footer {
  margin-top: 12px;
  display: flex;
  justify-content: center;
  gap: 8px;
  align-items: center;
}

.tip {
  font-size: 13px;
  color: #64748b;
}
</style>
