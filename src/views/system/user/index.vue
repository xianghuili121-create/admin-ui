<template>
  <div class="user-page">
    <el-card shadow="never" class="query-card">
      <el-form :model="queryForm" inline @submit.prevent>
        <el-form-item label="用户名">
          <el-input v-model="queryForm.username" placeholder="支持模糊搜索" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="queryForm.roleId" clearable placeholder="全部角色" style="width: 180px">
            <el-option v-for="item in roleOpt" :key="item.id" :label="item.roleName" :value="item.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="全部" style="width: 140px">
            <el-option label="启用" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">查询</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="12" class="action-row">
      <el-col :span="1.5">
        <el-button type="success" icon="Plus" @click="openDialog()">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button type="danger" icon="Delete" :disabled="selectedUserIds.length === 0" @click="handleBatchDelete">
          批量删除
        </el-button>
      </el-col>
      <RightToolbar @refresh="getList" />
    </el-row>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="list"
        style="width: 100%"
        stripe
        show-overflow-tooltip
        @selection-change="onSelectionChange"
      >
        <el-table-column type="selection" width="48" :selectable="rowSelectable" fixed />
        <el-table-column type="index" width="55" label="序号" fixed />
        <el-table-column prop="userId" label="ID" width="90" />
        <el-table-column label="头像" width="72">
          <template #default="{ row }">
            <el-avatar :src="row.avatarUrl" :size="34" />
          </template>
        </el-table-column>
        <el-table-column prop="username" label="用户名" min-width="150" fixed />
        <el-table-column prop="name" label="姓名" width="120" />
        <el-table-column prop="phoneNumber" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="180" />
        <el-table-column prop="points" label="积分" width="90">
          <template #default="{ row }">
            <el-tag type="warning">{{ row.points || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="goldCoin" label="金币" width="90">
          <template #default="{ row }">
            <el-tag type="warning" effect="plain">{{ row.goldCoin || 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="角色" min-width="180" :tooltip-formatter="({ row }) => (row.roleList || []).map(r => r.roleName).join(', ')">
          <template #default="{ row }">
            <el-tag v-for="item in row.roleList || []" :key="item.id" type="success" effect="plain" style="margin: 0 5px 5px 0">
              {{ item.roleName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="在线" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.onlineStatus == 1" type="primary" effect="plain">在线</el-tag>
            <el-tag v-else type="info" effect="plain">离线</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status == 1" type="success">启用</el-tag>
            <el-tag v-else type="danger">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            <span>{{ row.updateTime ? row.updateTime : '未更新' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button
              :disabled="row.onlineStatus == 0 || row.userId == 1"
              @click="handleLogout(row.userId)"
              type="warning"
              link
              icon="SwitchButton"
            >
              强制下线
            </el-button>
            <el-button @click="openDialog(row.userId)" type="primary" link icon="Edit">修改</el-button>
            <el-button
              :disabled="row.isDelete == 1 || row.userId == 1 || row.userId == currentUserId"
              @click="handleDelete(row)"
              type="danger"
              link
              icon="Delete"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination">
        <el-pagination
          background
          layout="total, sizes, prev, pager, next"
          :total="total"
          :page-size="queryForm.size"
          :current-page="queryForm.page"
          :page-sizes="[10, 15, 20, 50]"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="640px" @closed="resetForm(formRef)">
      <el-form :model="form" ref="formRef" :rules="rules" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12" v-if="isEdit">
            <el-form-item label="用户ID">
              <el-input v-model="form.userId" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="用户名" prop="username">
              <el-input v-model="form.username" placeholder="6-20 位" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="!isEdit">
            <el-form-item label="用户密码" prop="password">
              <el-input v-model="form.password" show-password placeholder="6-20 位，建议字母+数字" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-else>
            <el-form-item label="重置密码" prop="resetPassword">
              <el-input v-model="form.resetPassword" show-password placeholder="留空则不修改" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="手机号" prop="phoneNumber">
              <el-input v-model="form.phoneNumber" placeholder="可选" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="性别" prop="gender">
              <el-radio-group v-model="form.gender">
                <el-radio value="1">男</el-radio>
                <el-radio value="0">女</el-radio>
                <el-radio value="2">保密</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="姓名" prop="name">
              <el-input v-model="form.name" placeholder="可选" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="邮箱" prop="email">
              <el-input v-model="form.email" placeholder="可选" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="状态" prop="status">
              <el-radio-group v-model="form.status">
                <el-radio value="1">启用</el-radio>
                <el-radio value="0">停用</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-divider><el-text>角色</el-text></el-divider>
            <el-form-item prop="roleIds">
              <el-select v-model="form.roleIds" multiple placeholder="请选择角色" style="width: 100%">
                <el-option v-for="item in roleOpt" :key="item.id" :label="item.roleName" :value="item.id" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" :loading="saving" @click="submit(formRef)" icon="Pointer">保存</el-button>
          <el-button @click="dialogVisible = false">取消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { usePermissionStore } from '@/stores/permission'
import RightToolbar from '@/components/RightToolbar.vue'
import { getUserList, addUser, aditUser, getUserById, deleteUserById, logoutUserById } from '@/api/system/user'
import { getRoleList } from '@/api/system/role'

const permissionStore = usePermissionStore()
const currentUserId = computed(() => permissionStore.userInfo?.userId)

const loading = ref(false)
const saving = ref(false)
const list = ref([])
const total = ref(0)

const roleOpt = ref([])

const queryForm = reactive({
  page: 1,
  size: 15,
  username: '',
  roleId: null,
  status: null,
})

const selectedUserIds = ref([])

const dialogVisible = ref(false)
const formRef = ref(null)
const form = ref({})

const isEdit = computed(() => Boolean(form.value?.userId))
const dialogTitle = computed(() => (isEdit.value ? '修改用户' : '新增用户'))

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d)[a-zA-Z\d]{6,20}$/

const validatePassword = (rule, value, callback) => {
  if (!value) return callback(new Error('请输入用户密码'))
  if (!passwordRegex.test(value)) return callback(new Error('密码需包含字母和数字，且长度为6-20位'))
  callback()
}

const validateResetPassword = (rule, value, callback) => {
  if (!value) return callback()
  if (!passwordRegex.test(value)) return callback(new Error('密码需包含字母和数字，且长度为6-20位'))
  callback()
}

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ validator: validatePassword, trigger: 'blur' }],
  resetPassword: [{ validator: validateResetPassword, trigger: 'blur' }],
  roleIds: [{ required: true, message: '请选择角色', trigger: 'change' }],
})

const resetFormModel = () => {
  form.value = {
    userId: null,
    username: '',
    password: '',
    resetPassword: '',
    phoneNumber: '',
    gender: '2',
    name: '',
    email: '',
    status: '1',
    roleIds: [4],
  }
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getUserList({ ...queryForm })
    list.value = res.rows || []
    total.value = res.total || 0
  } catch (e) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const getRoleOpt = async () => {
  const res = await getRoleList({ page: 1, size: 200 })
  roleOpt.value = res.rows || []
}

const handleQuery = () => {
  queryForm.page = 1
  getList()
}

const resetQuery = () => {
  queryForm.page = 1
  queryForm.size = 15
  queryForm.username = ''
  queryForm.roleId = null
  queryForm.status = null
  getList()
}

const handlePageChange = (p) => {
  queryForm.page = p
  getList()
}

const handleSizeChange = (s) => {
  queryForm.size = s
  queryForm.page = 1
  getList()
}

const onSelectionChange = (rows) => {
  selectedUserIds.value = (rows || []).map((r) => r.userId)
}

const rowSelectable = (row) => {
  if (row.userId == 1) return false
  if (currentUserId.value && String(row.userId) === String(currentUserId.value)) return false
  if (row.isDelete == 1) return false
  return true
}

const openDialog = async (userId) => {
  resetFormModel()
  if (userId) {
    const res = await getUserById(userId)
    if (res.code === 200) {
      const data = res.data || {}
      form.value = {
        ...form.value,
        ...data,
        resetPassword: '',
      }
    }
  }
  dialogVisible.value = true
}

const resetForm = (el) => {
  if (!el) return
  el.resetFields()
  resetFormModel()
}

const submit = async (el) => {
  if (!el) return
  await el.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const payload = { ...form.value }
      if (!payload.resetPassword) delete payload.resetPassword
      if (!payload.password) delete payload.password

      if (payload.userId && payload.resetPassword) {
        await ElMessageBox.confirm('检测到填写了重置密码，确认要修改该用户密码吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
      }

      if (payload.userId) {
        const res = await aditUser(payload)
        if (res.code === 200) ElMessage.success('保存成功')
      } else {
        const res = await addUser(payload)
        if (res.code === 200) ElMessage.success('保存成功')
      }
      dialogVisible.value = false
      await getList()
    } catch (e) {
      if (e !== 'cancel') ElMessage.error(e?.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除用户【${row.username}】吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteUserById({ userId: row.userId })
    ElMessage.success('删除成功')
    await getList()
  } catch {
  }
}

const handleBatchDelete = async () => {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedUserIds.value.length} 个用户吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteUserById({ userIds: selectedUserIds.value })
    ElMessage.success('删除成功')
    selectedUserIds.value = []
    await getList()
  } catch {
  }
}

const handleLogout = async (userId) => {
  try {
    await ElMessageBox.confirm('确定强制下线该用户吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await logoutUserById(userId)
    ElMessage.success('操作成功')
    await getList()
  } catch {
  }
}

onMounted(async () => {
  resetFormModel()
  await getRoleOpt()
  await getList()
})
</script>

<style scoped>
.user-page {
  padding: 16px;
}

.query-card {
  margin-bottom: 12px;
}

.action-row {
  margin-bottom: 12px;
}

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
