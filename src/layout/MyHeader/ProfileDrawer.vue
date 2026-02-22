<template>
  <el-drawer v-model="visible" size="480px" :with-header="false" :append-to-body="true">
    <motion.div class="drawer" :initial="{ opacity: 0, x: 10 }" :animate="{ opacity: 1, x: 0 }" :transition="{ duration: 0.25 }">
      <div class="top">
        <div class="user">
          <el-upload
            class="avatar-uploader"
            :action="uploadAction"
            name="avatar"
            :headers="uploadHeaders"
            :show-file-list="false"
            accept="image/*"
            :on-success="onAvatarSuccess"
            :before-upload="beforeUpload"
          >
            <motion.div :whileHover="{ scale: 1.03 }" :whilePress="{ scale: 0.98 }" class="avatar-wrap">
              <el-avatar :size="56" :src="profile?.avatarUrl || permissionStore.userInfo.avatarUrl" />
              <div class="avatar-mask">更换</div>
            </motion.div>
          </el-upload>

          <div class="meta">
            <div class="name">
              <span class="username">{{ permissionStore.userInfo.username || '-' }}</span>
              <el-tag v-if="permissionStore.userInfo.userId" size="small" effect="plain">ID: {{ permissionStore.userInfo.userId }}</el-tag>
            </div>
            <div class="desc">
              <span class="nickname">{{ profile?.name || '-' }}</span>
              <span class="split">·</span>
              <span class="email">{{ profile?.email || '-' }}</span>
            </div>
            <div class="roles" v-if="profile?.roleList?.length">
              <el-tag v-for="r in profile.roleList" :key="r.id" size="small" effect="plain" type="info">{{ r.roleName }}</el-tag>
            </div>
          </div>
        </div>

        <div class="stats">
          <div class="stat">
            <div class="stat-num">{{ profile?.stats?.totalPoints ?? 0 }}</div>
            <div class="stat-label">积分</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ profile?.stats?.level ?? 1 }}</div>
            <div class="stat-label">等级</div>
          </div>
          <div class="stat">
            <div class="stat-num">{{ `${profile?.stats?.expInLevel ?? 0}/${profile?.stats?.expToNext ?? 100}` }}</div>
            <div class="stat-label">经验</div>
          </div>
        </div>

        <div class="actions">
          <el-button @click="visible = false">关闭</el-button>
          <el-button type="danger" plain @click="logoutNow">退出登录</el-button>
        </div>
      </div>

      <el-tabs v-model="activeTab" class="tabs">
        <el-tab-pane label="资料" name="profile">
          <motion.div :initial="{ opacity: 0, y: 8 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.2 }">
            <el-form ref="profileRef" :model="profileForm" :rules="profileRules" label-position="top">
              <el-form-item label="昵称" prop="nickname">
                <el-input v-model="profileForm.nickname" clearable placeholder="用于展示" />
              </el-form-item>
              <el-form-item label="性别" prop="gender">
                <el-radio-group v-model="profileForm.gender">
                  <el-radio value="1">男</el-radio>
                  <el-radio value="2">女</el-radio>
                  <el-radio value="0">未知</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="邮箱" prop="email">
                <el-input v-model="profileForm.email" clearable placeholder="example@xx.com" />
              </el-form-item>
              <el-form-item label="手机号" prop="phoneNumber">
                <el-input v-model="profileForm.phoneNumber" clearable placeholder="用于联系（可选）" />
              </el-form-item>
              <el-form-item label="生日" prop="birthdayDate">
                <el-date-picker v-model="profileForm.birthdayDate" type="date" value-format="YYYY-MM-DD" placeholder="请选择生日" style="width: 100%" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingProfile" @click="saveProfile">保存资料</el-button>
              </el-form-item>
            </el-form>
          </motion.div>
        </el-tab-pane>

        <el-tab-pane label="安全" name="security">
          <motion.div :initial="{ opacity: 0, y: 8 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.2 }">
            <el-alert type="info" show-icon :closable="false" title="建议定期更新密码，避免在多个系统复用相同密码。" />
            <div style="height: 12px" />
            <el-form ref="passwordRef" :model="passwordForm" :rules="passwordRules" label-position="top">
              <el-form-item label="原密码" prop="oldPassword">
                <el-input v-model="passwordForm.oldPassword" show-password autocomplete="current-password" />
              </el-form-item>
              <el-form-item label="新密码" prop="newPassword">
                <el-input v-model="passwordForm.newPassword" show-password autocomplete="new-password" />
              </el-form-item>
              <el-form-item label="确认新密码" prop="confirmPassword">
                <el-input v-model="passwordForm.confirmPassword" show-password autocomplete="new-password" />
              </el-form-item>
              <el-form-item>
                <el-button type="primary" :loading="savingPassword" @click="savePassword">修改密码</el-button>
              </el-form-item>
            </el-form>
          </motion.div>
        </el-tab-pane>

        <el-tab-pane label="关于" name="about">
          <motion.div :initial="{ opacity: 0, y: 8 }" :animate="{ opacity: 1, y: 0 }" :transition="{ duration: 0.2 }" class="about">
            <el-descriptions :column="1" border>
              <el-descriptions-item label="账号">{{ permissionStore.userInfo.username || '-' }}</el-descriptions-item>
              <el-descriptions-item label="昵称">{{ profile?.name || '-' }}</el-descriptions-item>
              <el-descriptions-item label="邮箱">{{ profile?.email || '-' }}</el-descriptions-item>
              <el-descriptions-item label="手机号">{{ profile?.phoneNumber || '-' }}</el-descriptions-item>
              <el-descriptions-item label="生日">{{ profile?.birthdayDate || '-' }}</el-descriptions-item>
              <el-descriptions-item label="最近签到">{{ profile?.stats?.lastCheckinDate || '-' }}</el-descriptions-item>
            </el-descriptions>
          </motion.div>
        </el-tab-pane>
      </el-tabs>
    </motion.div>
  </el-drawer>
</template>

<script setup>
import { motion } from 'motion-v';
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { useRouter } from 'vue-router';

import { getToken, removeToken } from '@/utils/myCookie';
import { usePermissionStore } from '@/stores/permission';
import { getProfile, updatePassword, updateProfile } from '@/api/system/user';
import { logout } from '@/api/auth';

const router = useRouter();
const permissionStore = usePermissionStore();

const visible = defineModel({ type: Boolean, default: false });

const activeTab = ref('profile');
const profile = ref(null);
const savingProfile = ref(false);
const savingPassword = ref(false);

const profileRef = ref(null);
const passwordRef = ref(null);

const profileForm = reactive({
  nickname: '',
  gender: 0,
  email: '',
  phoneNumber: '',
  birthdayDate: '',
});

const passwordForm = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const profileRules = reactive({
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  email: [
    {
      validator: (rule, value, callback) => {
        const v = String(value || '').trim();
        if (!v) return callback();
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        if (!ok) return callback(new Error('邮箱格式不正确'));
        callback();
      },
      trigger: 'blur',
    },
  ],
});

const passwordRules = reactive({
  oldPassword: [{ required: true, message: '请输入原密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        const v = String(value || '');
        if (v.length < 6 || v.length > 20) return callback(new Error('新密码长度需 6~20 位'));
        callback();
      },
      trigger: 'blur',
    },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordForm.newPassword) return callback(new Error('两次输入不一致'));
        callback();
      },
      trigger: 'blur',
    },
  ],
});

const uploadAction = computed(() => `${import.meta.env.VITE_API_BASE_URL}/upload/avatar`);
const uploadHeaders = computed(() => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
});

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;
  if (!isImage) ElMessage.error('请上传图片文件');
  if (!isLt2M) ElMessage.error('图片大小不能超过 2MB');
  return isImage && isLt2M;
};

const onAvatarSuccess = async (resp) => {
  const url = resp?.data;
  if (!url) {
    ElMessage.error('上传失败');
    return;
  }
  try {
    await updateProfile({ avatarUrl: url });
    ElMessage.success('头像已更新');
    await refreshProfile();
    await permissionStore.loadInfo();
  } catch (e) {
    ElMessage.error(e?.message || '更新失败');
  }
};

const refreshProfile = async () => {
  const res = await getProfile();
  if (res.code !== 200) throw new Error(res.message || '获取个人资料失败');
  profile.value = res.data;
  profileForm.nickname = res.data?.name || '';
  profileForm.gender = res.data?.gender ?? 0;
  profileForm.email = res.data?.email || '';
  profileForm.phoneNumber = res.data?.phoneNumber || '';
  profileForm.birthdayDate = res.data?.birthdayDate || '';
};

const saveProfile = async () => {
  if (!profileRef.value) return;
  await profileRef.value.validate(async (valid) => {
    if (!valid) return;
    savingProfile.value = true;
    try {
      await updateProfile({
        nickname: String(profileForm.nickname || '').trim(),
        gender: profileForm.gender,
        email: String(profileForm.email || '').trim(),
        phoneNumber: String(profileForm.phoneNumber || '').trim(),
        birthdayDate: profileForm.birthdayDate || '',
      });
      ElMessage.success('保存成功');
      await refreshProfile();
      await permissionStore.loadInfo();
    } catch (e) {
      ElMessage.error(e?.message || '保存失败');
    } finally {
      savingProfile.value = false;
    }
  });
};

const savePassword = async () => {
  if (!passwordRef.value) return;
  await passwordRef.value.validate(async (valid) => {
    if (!valid) return;
    savingPassword.value = true;
    try {
      await updatePassword({ oldPassword: passwordForm.oldPassword, newPassword: passwordForm.newPassword });
      ElMessage.success('密码修改成功');
      passwordForm.oldPassword = '';
      passwordForm.newPassword = '';
      passwordForm.confirmPassword = '';
    } catch (e) {
      ElMessage.error(e?.message || '修改失败');
    } finally {
      savingPassword.value = false;
    }
  });
};

const logoutNow = async () => {
  try {
    await ElMessageBox.confirm('确定退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
  } catch {
    return;
  }
  try {
    await logout();
  } catch {
  }
  removeToken();
  permissionStore.reset();
  visible.value = false;
  router.push('/login');
};

watch(
  () => visible.value,
  async (v) => {
    if (!v) return;
    activeTab.value = 'profile';
    try {
      await refreshProfile();
      await nextTick();
    } catch (e) {
      ElMessage.error(e?.message || '加载失败');
    }
  }
);
</script>

<style scoped lang="scss">
.drawer {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.top {
  padding: 6px 2px 0;
}

.user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-uploader {
  display: inline-flex;
}

.avatar-wrap {
  position: relative;
  border-radius: 999px;
  overflow: hidden;
  cursor: pointer;
}

.avatar-mask {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.35);
  color: #fff;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.avatar-wrap:hover .avatar-mask {
  opacity: 1;
}

.meta {
  flex: 1;
  min-width: 0;
}

.name {
  display: flex;
  align-items: center;
  gap: 8px;
}

.username {
  font-weight: 700;
  font-size: 16px;
  color: #0f172a;
}

.desc {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
  display: flex;
  align-items: center;
  gap: 6px;
}

.split {
  opacity: 0.6;
}

.roles {
  margin-top: 6px;
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.stats {
  margin-top: 12px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.stat {
  padding: 10px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 10px;
  background: var(--el-fill-color-light);
}

.stat-num {
  font-weight: 800;
  font-size: 18px;
  color: #0f172a;
}

.stat-label {
  margin-top: 4px;
  font-size: 12px;
  color: #64748b;
}

.actions {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.tabs {
  margin-top: 6px;
}

.about {
  padding-top: 8px;
}
</style>
