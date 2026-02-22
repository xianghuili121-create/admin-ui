<template>
  <div class="menu-page">
    <el-card shadow="never" class="query-card">
      <el-form :model="queryForm" inline @submit.prevent>
        <el-form-item label="菜单名称">
          <el-input v-model="queryForm.menuName" clearable placeholder="支持模糊搜索" @keyup.enter="applyFilter" />
        </el-form-item>
        <el-form-item label="权限码">
          <el-input v-model="queryForm.permCode" clearable placeholder="支持模糊搜索" @keyup.enter="applyFilter" />
        </el-form-item>
        <el-form-item label="类型">
          <el-select v-model="queryForm.menuType" clearable placeholder="全部" style="width: 140px">
            <el-option label="目录" value="0" />
            <el-option label="菜单" value="1" />
            <el-option label="按钮" value="2" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="queryForm.status" clearable placeholder="全部" style="width: 140px">
            <el-option label="启用" value="1" />
            <el-option label="停用" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="显示">
          <el-select v-model="queryForm.visible" clearable placeholder="全部" style="width: 140px">
            <el-option label="显示" value="1" />
            <el-option label="隐藏" value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="applyFilter">查询</el-button>
          <el-button icon="Refresh" @click="resetFilter">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-row :gutter="12" class="action-row">
      <el-col :span="1.5">
        <el-button type="success" icon="Plus" @click="openDialog()">新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button @click="expandAll(true)">展开</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button @click="expandAll(false)">折叠</el-button>
      </el-col>
      <RightToolbar @refresh="getList" />
    </el-row>

    <el-card shadow="never">
      <el-table
        v-loading="loading"
        ref="tableRef"
        :data="filteredList"
        row-key="id"
        stripe
        style="width: 100%"
        show-overflow-tooltip
        :tree-props="{ children: 'children' }"
      >
        <el-table-column type="index" width="55" label="序号" fixed />
        <el-table-column prop="menuName" label="菜单名称" min-width="160" fixed />
        <el-table-column label="图标" width="70">
          <template #default="{ row }">
            <el-icon :size="22">
              <component v-if="row.icon" :is="row.icon"></component>
            </el-icon>
          </template>
        </el-table-column>
        <el-table-column prop="permCode" label="权限码" min-width="150" />
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.menuType == 0" type="success" effect="plain">目录</el-tag>
            <el-tag v-else-if="row.menuType == 1" type="warning" effect="plain">菜单</el-tag>
            <el-tag v-else type="info" effect="plain">按钮</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="route" label="路由" min-width="180" />
        <el-table-column prop="component" label="组件" min-width="200" />
        <el-table-column prop="sort" label="排序" width="90" />
        <el-table-column label="显示" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.visible == 1" type="primary" effect="plain">显示</el-tag>
            <el-tag v-else type="info" effect="plain">隐藏</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.status == 1" type="success" effect="plain">启用</el-tag>
            <el-tag v-else type="danger" effect="plain">停用</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="updateTime" label="更新时间" width="180">
          <template #default="{ row }">
            <span>{{ row.updateTime ? row.updateTime : '未更新' }}</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right">
          <template #default="{ row }">
            <el-button @click="openDialog(null, row.id)" type="success" link icon="Plus">新增子项</el-button>
            <el-button @click="openDialog(row.id)" type="primary" link icon="Edit">修改</el-button>
            <el-button
              :disabled="row.id == 1 || (row.children && row.children.length > 0)"
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
    </el-card>

    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="720px" @closed="resetForm(formRef)">
      <el-form :model="form" ref="formRef" :rules="rules" label-position="top">
        <el-row :gutter="20">
          <el-col :span="12" v-if="isEdit">
            <el-form-item label="菜单ID">
              <el-input v-model="form.id" disabled />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="上级菜单" prop="parentId">
              <el-tree-select
                v-model="form.parentId"
                node-key="id"
                :props="{ label: 'menuName' }"
                :data="parentOptions"
                default-expand-all
                check-strictly
                :render-after-expand="false"
                style="width: 100%"
                placeholder="请选择上级菜单"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单类型" prop="menuType">
              <el-radio-group v-model="form.menuType">
                <el-radio value="0">目录</el-radio>
                <el-radio value="1">菜单</el-radio>
                <el-radio value="2">按钮</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单图标" prop="icon">
              <ElIconPicker v-model="form.icon" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="菜单名称" prop="menuName">
              <el-input v-model="form.menuName" placeholder="请输入菜单名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="权限码" prop="permCode">
              <el-input v-model="form.permCode" placeholder="如 user:list / role:add" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType != '2'">
            <el-form-item label="路由" prop="route">
              <el-input v-model="form.route" placeholder="如 /system/user" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="form.menuType == '1'">
            <el-form-item label="组件路径" prop="component">
              <el-input v-model="form.component" placeholder="如 system/user/index" />
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
          <el-col :span="12">
            <el-form-item label="是否显示" prop="visible">
              <el-switch
                v-model="form.visible"
                active-value="1"
                inactive-value="0"
                active-action-icon="View"
                inactive-action-icon="Hide"
                style="--el-switch-on-color: #13ce66; --el-switch-off-color: #ff4949"
              />
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
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import RightToolbar from '@/components/RightToolbar.vue'
import ElIconPicker from '@/components/ElIconPicker.vue'
import { addMenu, deleteById, getMenuById, getMenuList, upMenu } from '@/api/system/menu'

const loading = ref(false)
const saving = ref(false)

const list = ref([])
const tableRef = ref(null)

const queryForm = reactive({
  menuName: '',
  permCode: '',
  menuType: null,
  status: null,
  visible: null,
})

const dialogVisible = ref(false)
const formRef = ref(null)
const form = ref({})

const isEdit = computed(() => Boolean(form.value?.id))
const dialogTitle = computed(() => (isEdit.value ? '修改菜单' : '新增菜单'))

const resetFormModel = () => {
  form.value = {
    id: null,
    parentId: 0,
    menuType: '0',
    menuName: '',
    permCode: '',
    route: '',
    component: '',
    icon: '',
    visible: '1',
    status: '1',
    sort: 0,
  }
}

const rules = reactive({
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  permCode: [{ required: true, message: '请输入权限码', trigger: 'blur' }],
  route: [
    {
      validator: (rule, value, callback) => {
        if (form.value.menuType !== '2' && !String(value || '').trim()) return callback(new Error('请输入路由'))
        callback()
      },
      trigger: 'blur',
    },
  ],
  component: [
    {
      validator: (rule, value, callback) => {
        if (form.value.menuType === '1' && !String(value || '').trim()) return callback(new Error('请输入组件路径'))
        callback()
      },
      trigger: 'blur',
    },
  ],
})

const getList = async () => {
  loading.value = true
  try {
    const res = await getMenuList()
    if (res.code === 200) list.value = res.rows || []
  } catch (e) {
    ElMessage.error(e?.message || '加载失败')
  } finally {
    loading.value = false
  }
}

const matchNode = (node) => {
  const nameOk = !queryForm.menuName || String(node.menuName || '').includes(queryForm.menuName)
  const codeOk = !queryForm.permCode || String(node.permCode || '').includes(queryForm.permCode)
  const typeOk = queryForm.menuType === null || String(node.menuType) === String(queryForm.menuType)
  const statusOk = queryForm.status === null || String(node.status) === String(queryForm.status)
  const visibleOk = queryForm.visible === null || String(node.visible) === String(queryForm.visible)
  return nameOk && codeOk && typeOk && statusOk && visibleOk
}

const filterTree = (nodes) => {
  const arr = Array.isArray(nodes) ? nodes : []
  const result = []
  for (const n of arr) {
    const children = filterTree(n.children)
    if (matchNode(n) || children.length > 0) {
      result.push({
        ...n,
        children,
      })
    }
  }
  return result
}

const filteredList = computed(() => filterTree(list.value))

const applyFilter = () => {
  expandAll(true)
}

const resetFilter = () => {
  queryForm.menuName = ''
  queryForm.permCode = ''
  queryForm.menuType = null
  queryForm.status = null
  queryForm.visible = null
  expandAll(false)
}

const buildParentOptions = (tree, excludeId) => {
  const arr = Array.isArray(tree) ? tree : []
  const result = []
  for (const n of arr) {
    if (excludeId && String(n.id) === String(excludeId)) continue
    const children = buildParentOptions(n.children, excludeId)
    const item = { ...n, children }
    result.push(item)
  }
  return result
}

const parentOptions = computed(() => {
  const base = [{ id: 0, menuName: '顶级', children: [] }, ...(list.value || [])]
  const excludeId = form.value?.id
  return buildParentOptions(base, excludeId)
})

const openDialog = async (id, parentId = 0) => {
  resetFormModel()
  form.value.parentId = parentId
  if (id) {
    const res = await getMenuById(id)
    if (res.code === 200) {
      form.value = {
        ...form.value,
        ...res.data,
      }
    }
  }
  dialogVisible.value = true
}

const resetForm = (el) => {
  if (el) el.resetFields()
  resetFormModel()
}

watch(
  () => form.value.menuType,
  (t) => {
    if (t === '2') {
      form.value.route = ''
      form.value.component = ''
      form.value.icon = ''
    }
    if (t !== '1') {
      form.value.component = ''
    }
  }
)

const submit = async (el) => {
  if (!el) return
  await el.validate(async (valid) => {
    if (!valid) return
    saving.value = true
    try {
      if (form.value.id) {
        const res = await upMenu(form.value)
        if (res.code === 200) ElMessage.success('保存成功')
      } else {
        const res = await addMenu(form.value)
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
    await ElMessageBox.confirm(`确定删除菜单【${row.menuName}】吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })
    await deleteById(row.id)
    ElMessage.success('删除成功')
    await getList()
  } catch {
  }
}

const expandAll = (expanded) => {
  const table = tableRef.value
  const store = table?.store
  const rowKey = table?.rowKey
  if (!store || !rowKey) return
  const states = store.states
  const map = states.treeData?.value || {}
  Object.values(map).forEach((n) => {
    n.expanded = expanded
  })
}

onMounted(async () => {
  resetFormModel()
  await getList()
})
</script>

<style scoped>
.menu-page {
  padding: 16px;
}

.query-card {
  margin-bottom: 12px;
}

.action-row {
  margin-bottom: 12px;
}
</style>
