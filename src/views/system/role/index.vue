<template>
  <div class="role-page">
    <el-card shadow="never" class="query-card">
      <el-form :model="queryForm" inline @submit.prevent>
        <el-form-item label="角色名称">
          <el-input v-model="queryForm.roleName" placeholder="支持模糊搜索" clearable @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="角色标识">
          <el-input v-model="queryForm.roleCode" placeholder="精确匹配" clearable @keyup.enter="handleQuery" />
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
      <RightToolbar @refresh="getList" />
    </el-row>

    <el-card shadow="never">
      <el-table v-loading="loading" :data="list" stripe style="width: 100%" show-overflow-tooltip>
        <el-table-column type="index" width="55" label="序号" fixed />
        <el-table-column prop="id" label="ID" width="90" />
        <el-table-column prop="roleName" label="角色名称" min-width="160" fixed />
        <el-table-column prop="roleCode" label="角色标识" min-width="180" />
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status == 1" type="success">启用</el-tag>
            <el-tag v-else type="danger">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            <span>{{ row.updateTime ? row.updateTime : '未更新' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260" fixed="right">
          <template #default="{ row }">
            <el-button :disabled="row.id == 1 && !isRootUser" @click="openDialog(row.id)" type="primary" link icon="Edit">
              修改
            </el-button>
            <el-button :disabled="row.id == 1" @click="handleDelete(row)" type="danger" link icon="Delete">删除</el-button>
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

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="760px" @closed="resetForm(formRef)">
      <el-tabs v-model="activeTab">
        <el-tab-pane label="基础信息" name="base">
          <el-form :model="form" ref="formRef" :rules="rules" label-position="top">
            <el-row :gutter="20">
              <el-col :span="12" v-if="isEdit">
                <el-form-item label="角色ID">
                  <el-input v-model="form.id" disabled />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="角色名称" prop="roleName">
                  <el-input v-model="form.roleName" placeholder="请输入角色名称" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="角色标识" prop="roleCode">
                  <el-input v-model="form.roleCode" placeholder="请输入角色标识" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序" prop="sort">
                  <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
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
                <el-form-item label="描述" prop="roleDesc">
                  <el-input v-model="form.roleDesc" placeholder="请输入描述" type="textarea" :rows="3" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-form>
        </el-tab-pane>

        <el-tab-pane label="菜单权限" name="perm">
          <div class="perm-toolbar">
            <el-input v-model="menuFilterText" placeholder="过滤菜单（名称/权限码）" clearable style="width: 280px" />
            <div class="perm-actions">
              <el-button @click="expandAll(true)">展开</el-button>
              <el-button @click="expandAll(false)">折叠</el-button>
              <el-button type="primary" plain @click="checkAll(true)">全选</el-button>
              <el-button type="danger" plain @click="checkAll(false)">全不选</el-button>
            </div>
          </div>
          <el-tree
            ref="menuTreeRef"
            :data="menuOpt"
            node-key="id"
            show-checkbox
            :props="{ label: 'menuName', children: 'children' }"
            :filter-node-method="filterNode"
            :check-strictly="false"
            :default-expand-all="false"
          >
            <template #default="{ data }">
              <div class="tree-node">
                <span class="node-title">{{ data.menuName }}</span>
                <el-tag v-if="data.menuType == 0" size="small" type="success" effect="plain">目录</el-tag>
                <el-tag v-else-if="data.menuType == 1" size="small" type="warning" effect="plain">菜单</el-tag>
                <el-tag v-else size="small" type="info" effect="plain">按钮</el-tag>
                <span class="node-code">{{ data.permCode }}</span>
              </div>
            </template>
          </el-tree>
        </el-tab-pane>
      </el-tabs>

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
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RightToolbar from '@/components/RightToolbar.vue'
import { usePermissionStore } from '@/stores/permission'
import { getRoleList, addRole, aditRole, getRoleById, deleteRoleById } from '@/api/system/role'
import { getMenuList } from '@/api/system/menu'

const permissionStore = usePermissionStore()
const isRootUser = computed(() => permissionStore.userInfo?.username === 'root')

const loading = ref(false)
const saving = ref(false)

const list = ref([])
const total = ref(0)

const queryForm = reactive({
  page: 1,
  size: 15,
  roleName: '',
  roleCode: '',
  status: null,
})

const menuOpt = ref([])
const menuTreeRef = ref(null)
const menuFilterText = ref('')

const dialogVisible = ref(false)
const activeTab = ref('base')
const formRef = ref(null)
const form = ref({})

const isEdit = computed(() => Boolean(form.value?.id))
const dialogTitle = computed(() => (isEdit.value ? '修改角色' : '新增角色'))

const rules = reactive({
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleCode: [{ required: true, message: '请输入角色标识', trigger: 'blur' }],
})

const resetFormModel = () => {
  form.value = {
    id: null,
    roleName: '',
    roleCode: '',
    roleDesc: '',
    status: '1',
    sort: 0,
    menuIds: [],
  }
}

const getList = async () => {
  loading.value = true
  try {
    const res = await getRoleList({ ...queryForm })
    list.value = res.rows || []
    total.value = res.total || 0
  } catch (e) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const getMenuOpt = async () => {
  const res = await getMenuList()
  if (res.code === 200) menuOpt.value = res.rows || []
}

const handleQuery = () => {
  queryForm.page = 1
  getList()
}

const resetQuery = () => {
  queryForm.page = 1
  queryForm.size = 15
  queryForm.roleName = ''
  queryForm.roleCode = ''
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

const openDialog = async (id) => {
  activeTab.value = 'base'
  resetFormModel()
  await getMenuOpt()
  if (id) {
    const res = await getRoleById(id)
    if (res.code === 200) {
      form.value = {
        ...form.value,
        ...res.data,
      }
    }
  }
  dialogVisible.value = true
  await nextTick()
  const tree = menuTreeRef.value
  if (tree) tree.setCheckedKeys(form.value.menuIds || [])
}

const resetForm = (el) => {
  if (el) el.resetFields()
  resetFormModel()
  activeTab.value = 'base'
  menuFilterText.value = ''
}

const filterNode = (value, data) => {
  if (!value) return true
  const v = String(value).trim().toLowerCase()
  const name = String(data.menuName || '').toLowerCase()
  const code = String(data.permCode || '').toLowerCase()
  return name.includes(v) || code.includes(v)
}

watch(menuFilterText, (v) => {
  const tree = menuTreeRef.value
  if (tree) tree.filter(v)
})

const expandAll = (expanded) => {
  const tree = menuTreeRef.value
  if (!tree) return
  const nodesMap = tree.store?.nodesMap || {}
  Object.values(nodesMap).forEach((n) => {
    n.expanded = expanded
  })
}

const checkAll = (checked) => {
  const tree = menuTreeRef.value
  if (!tree) return
  tree.setCheckedNodes(checked ? menuOpt.value : [])
}

const submit = async (el) => {
  if (!el) return
  await el.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      const tree = menuTreeRef.value
      const checkedKeys = tree ? tree.getCheckedKeys() : []
      const halfKeys = tree ? tree.getHalfCheckedKeys() : []
      const menuIds = Array.from(new Set([...checkedKeys, ...halfKeys]))

      const payload = {
        ...form.value,
        menuIds,
      }

      if (payload.id == 1 && !isRootUser.value) {
        ElMessage.error('仅 root 用户可修改 root 角色')
        return
      }

      if (payload.id) {
        const res = await aditRole(payload)
        if (res.code === 200) ElMessage.success('保存成功')
      } else {
        const res = await addRole(payload)
        if (res.code === 200) ElMessage.success('保存成功')
      }
      dialogVisible.value = false
      await getList()
    } catch (e) {
      ElMessage.error(e?.message || '保存失败')
    } finally {
      saving.value = false
    }
  })
}

const handleDelete = async (row) => {
  try {
    await ElMessageBox.confirm(`确定删除角色【${row.roleName}】吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteRoleById(row.id)
    ElMessage.success('删除成功')
    await getList()
  } catch {
  }
}

onMounted(async () => {
  resetFormModel()
  await getList()
})
</script>

<style scoped>
.role-page {
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

.perm-toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.perm-actions {
  display: flex;
  gap: 8px;
}

.tree-node {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.node-title {
  flex: 0 0 auto;
}

.node-code {
  margin-left: auto;
  opacity: 0.7;
  font-size: 12px;
  white-space: nowrap;
}
</style>
