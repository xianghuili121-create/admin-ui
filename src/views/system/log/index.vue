<template>
  <div class="log-page">
    <el-tabs v-model="activeTab">
      <el-tab-pane label="请求/审计日志" name="db">
        <el-card shadow="never" class="query-card">
          <el-form :model="dbQuery" inline @submit.prevent>
            <el-form-item label="级别">
              <el-select v-model="dbQuery.level" clearable placeholder="全部" style="width: 120px">
                <el-option label="info" value="info" />
                <el-option label="warn" value="warn" />
                <el-option label="error" value="error" />
              </el-select>
            </el-form-item>
            <el-form-item label="关键字">
              <el-input v-model="dbQuery.keyword" clearable placeholder="message/url/ip/用户名" @keyup.enter="loadDbLogs" />
            </el-form-item>
            <el-form-item label="URL">
              <el-input v-model="dbQuery.url" clearable placeholder="/api/xxx" @keyup.enter="loadDbLogs" />
            </el-form-item>
            <el-form-item label="方法">
              <el-select v-model="dbQuery.method" clearable placeholder="全部" style="width: 120px">
                <el-option label="GET" value="GET" />
                <el-option label="POST" value="POST" />
                <el-option label="PUT" value="PUT" />
                <el-option label="DELETE" value="DELETE" />
              </el-select>
            </el-form-item>
            <el-form-item label="用户">
              <el-input v-model="dbQuery.username" clearable placeholder="username" @keyup.enter="loadDbLogs" />
            </el-form-item>
            <el-form-item label="状态码">
              <el-input v-model="dbQuery.statusCode" clearable placeholder="200/401/500" style="width: 120px" @keyup.enter="loadDbLogs" />
            </el-form-item>
            <el-form-item label="时间">
              <el-date-picker
                v-model="dbDateRange"
                type="datetimerange"
                range-separator="至"
                start-placeholder="开始时间"
                end-placeholder="结束时间"
                value-format="YYYY-MM-DDTHH:mm:ss.SSSZ"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="Search" @click="handleDbQuery">查询</el-button>
              <el-button icon="Refresh" @click="resetDbQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </el-card>

        <el-row :gutter="12" class="action-row">
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="loadDbLogs">刷新</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="primary" plain :loading="exporting" @click="exportLogs">导出</el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" plain :disabled="selectedDbIds.length === 0" :loading="deleting" @click="deleteSelected">
              删除选中
            </el-button>
          </el-col>
          <el-col :span="1.5">
            <el-button type="danger" :loading="cleaning" @click="cleanupLogs">清理</el-button>
          </el-col>
        </el-row>

        <el-card shadow="never">
          <el-table v-loading="dbLoading" :data="dbRows" stripe row-key="_id" @selection-change="onDbSelectionChange">
            <el-table-column type="selection" width="48" />
            <el-table-column label="时间" width="180">
              <template #default="{ row }">{{ formatTime(row.createdAt || row.createTime) }}</template>
            </el-table-column>
            <el-table-column label="级别" width="90">
              <template #default="{ row }">
                <el-tag :type="levelTagType(row.level)" effect="plain">{{ row.level }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="message" label="message" min-width="180" show-overflow-tooltip />
            <el-table-column label="URL" min-width="220" show-overflow-tooltip>
              <template #default="{ row }">{{ row.request?.url || '-' }}</template>
            </el-table-column>
            <el-table-column label="方法" width="90">
              <template #default="{ row }">{{ row.request?.method || '-' }}</template>
            </el-table-column>
            <el-table-column label="状态码" width="100">
              <template #default="{ row }">{{ row.request?.statusCode ?? '-' }}</template>
            </el-table-column>
            <el-table-column label="耗时" width="100">
              <template #default="{ row }">{{ row.request?.durationMs ?? '-' }} ms</template>
            </el-table-column>
            <el-table-column label="用户" width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row.request?.username || row.request?.userId || '-' }}</template>
            </el-table-column>
            <el-table-column label="IP" width="140" show-overflow-tooltip>
              <template #default="{ row }">{{ row.request?.ip || '-' }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="openDetail(row)">详情</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              background
              layout="total, sizes, prev, pager, next"
              :total="dbTotal"
              :page-size="dbQuery.size"
              :current-page="dbQuery.page"
              :page-sizes="[10, 20, 50, 100]"
              @size-change="onDbSizeChange"
              @current-change="onDbPageChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="文件日志" name="files">
        <el-row :gutter="12" class="action-row">
          <el-col :span="1.5">
            <el-button icon="Refresh" @click="loadLogFiles">刷新</el-button>
          </el-col>
          <el-col :span="6">
            <el-input v-model="fileKeyword" clearable placeholder="搜索文件名" />
          </el-col>
        </el-row>

        <el-card shadow="never">
          <el-table v-loading="fileLoading" :data="filteredFiles" stripe row-key="fileName">
            <el-table-column prop="fileName" label="文件名" min-width="220" show-overflow-tooltip />
            <el-table-column prop="size" label="大小" width="120">
              <template #default="{ row }">{{ formatSize(row.size) }}</template>
            </el-table-column>
            <el-table-column prop="mtime" label="更新时间" width="180">
              <template #default="{ row }">{{ formatTime(row.mtime) }}</template>
            </el-table-column>
            <el-table-column label="操作" width="120" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link :loading="downloadingMap[row.fileName]" @click="downloadFile(row.fileName)">
                  下载
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-drawer v-model="detailVisible" title="日志详情" size="50%">
      <div v-if="currentRow" class="detail">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="时间">{{ formatTime(currentRow.createdAt || currentRow.createTime) }}</el-descriptions-item>
          <el-descriptions-item label="级别">{{ currentRow.level }}</el-descriptions-item>
          <el-descriptions-item label="message" :span="2">{{ currentRow.message }}</el-descriptions-item>
          <el-descriptions-item label="URL" :span="2">{{ currentRow.request?.url || '-' }}</el-descriptions-item>
          <el-descriptions-item label="方法">{{ currentRow.request?.method || '-' }}</el-descriptions-item>
          <el-descriptions-item label="状态码">{{ currentRow.request?.statusCode ?? '-' }}</el-descriptions-item>
          <el-descriptions-item label="耗时">{{ currentRow.request?.durationMs ?? '-' }} ms</el-descriptions-item>
          <el-descriptions-item label="用户">{{ currentRow.request?.username || currentRow.request?.userId || '-' }}</el-descriptions-item>
          <el-descriptions-item label="IP">{{ currentRow.request?.ip || '-' }}</el-descriptions-item>
          <el-descriptions-item label="UA" :span="2">{{ currentRow.request?.ua || '-' }}</el-descriptions-item>
        </el-descriptions>

        <div class="json-block">
          <div class="json-title">body</div>
          <pre class="json-pre">{{ prettyJson(currentRow.request?.body) }}</pre>
        </div>
        <div class="json-block">
          <div class="json-title">query</div>
          <pre class="json-pre">{{ prettyJson(currentRow.request?.query) }}</pre>
        </div>
        <div class="json-block">
          <div class="json-title">params</div>
          <pre class="json-pre">{{ prettyJson(currentRow.request?.params) }}</pre>
        </div>
      </div>
    </el-drawer>
  </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  cleanupDbLogs,
  deleteDbLogs,
  downloadLogFile,
  exportDbLogs,
  listDbLogs,
  listLogFiles,
} from '@/api/system/log';

const activeTab = ref('db');

const dbLoading = ref(false);
const dbRows = ref([]);
const dbTotal = ref(0);
const selectedDbIds = ref([]);
const exporting = ref(false);
const deleting = ref(false);
const cleaning = ref(false);

const dbQuery = reactive({
  page: 1,
  size: 20,
  level: null,
  keyword: '',
  url: '',
  method: null,
  username: '',
  statusCode: '',
});
const dbDateRange = ref(null);

const detailVisible = ref(false);
const currentRow = ref(null);

const fileLoading = ref(false);
const fileRows = ref([]);
const fileKeyword = ref('');
const downloadingMap = ref({});

const filteredFiles = computed(() => {
  const k = String(fileKeyword.value || '').trim().toLowerCase();
  if (!k) return fileRows.value;
  return (fileRows.value || []).filter((f) => String(f.fileName || '').toLowerCase().includes(k));
});

const levelTagType = (level) => {
  if (level === 'error') return 'danger';
  if (level === 'warn') return 'warning';
  return 'info';
};

const formatSize = (bytes) => {
  const n = Number(bytes || 0);
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
};

const formatTime = (v) => {
  if (!v) return '-';
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return String(v);
  const pad = (n) => String(n).padStart(2, '0');
  return (
    d.getFullYear() +
    '-' +
    pad(d.getMonth() + 1) +
    '-' +
    pad(d.getDate()) +
    ' ' +
    pad(d.getHours()) +
    ':' +
    pad(d.getMinutes()) +
    ':' +
    pad(d.getSeconds())
  );
};

const prettyJson = (obj) => {
  if (obj === null || obj === undefined) return '';
  try {
    return JSON.stringify(obj, null, 2);
  } catch {
    return String(obj);
  }
};

const buildDbParams = () => {
  const params = { ...dbQuery };
  if (dbDateRange.value && Array.isArray(dbDateRange.value) && dbDateRange.value.length === 2) {
    params.from = dbDateRange.value[0];
    params.to = dbDateRange.value[1];
  }
  Object.keys(params).forEach((k) => {
    if (params[k] === '' || params[k] === null || params[k] === undefined) delete params[k];
  });
  return params;
};

const loadDbLogs = async () => {
  dbLoading.value = true;
  try {
    const res = await listDbLogs(buildDbParams());
    dbRows.value = res.rows || [];
    dbTotal.value = res.total || 0;
  } catch (e) {
    ElMessage.error(e?.message || '加载失败');
  } finally {
    dbLoading.value = false;
  }
};

const handleDbQuery = () => {
  dbQuery.page = 1;
  loadDbLogs();
};

const resetDbQuery = () => {
  dbQuery.page = 1;
  dbQuery.size = 20;
  dbQuery.level = null;
  dbQuery.keyword = '';
  dbQuery.url = '';
  dbQuery.method = null;
  dbQuery.username = '';
  dbQuery.statusCode = '';
  dbDateRange.value = null;
  loadDbLogs();
};

const onDbPageChange = (p) => {
  dbQuery.page = p;
  loadDbLogs();
};

const onDbSizeChange = (s) => {
  dbQuery.size = s;
  dbQuery.page = 1;
  loadDbLogs();
};

const onDbSelectionChange = (rows) => {
  selectedDbIds.value = (rows || []).map((r) => r._id);
};

const openDetail = (row) => {
  currentRow.value = row;
  detailVisible.value = true;
};

const exportLogs = async () => {
  exporting.value = true;
  try {
    const payload = { ...buildDbParams(), format: 'jsonl', maxRows: 20000, expirySeconds: 300 };
    delete payload.page;
    delete payload.size;
    const res = await exportDbLogs(payload);
    const url = res.data?.url;
    if (!url) return ElMessage.error('导出失败');
    window.open(url, '_blank');
    ElMessage.success('已生成导出链接');
  } catch (e) {
    ElMessage.error(e?.message || '导出失败');
  } finally {
    exporting.value = false;
  }
};

const deleteSelected = async () => {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedDbIds.value.length} 条日志吗？`, '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
  } catch {
    return;
  }

  deleting.value = true;
  try {
    await deleteDbLogs(selectedDbIds.value);
    ElMessage.success('删除成功');
    selectedDbIds.value = [];
    await loadDbLogs();
  } catch (e) {
    ElMessage.error(e?.message || '删除失败');
  } finally {
    deleting.value = false;
  }
};

const cleanupLogs = async () => {
  let days = 7;
  try {
    const res = await ElMessageBox.prompt('请输入保留天数（将删除早于该天数的日志）', '清理日志', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputValue: '7',
      inputPattern: /^[1-9]\d*$/,
      inputErrorMessage: '请输入正整数',
    });
    days = Number(res.value);
  } catch {
    return;
  }

  cleaning.value = true;
  try {
    const res = await cleanupDbLogs({ beforeDays: days });
    ElMessage.success(`已清理 ${res.data?.deletedCount || 0} 条`);
    await loadDbLogs();
  } catch (e) {
    ElMessage.error(e?.message || '清理失败');
  } finally {
    cleaning.value = false;
  }
};

const loadLogFiles = async () => {
  fileLoading.value = true;
  try {
    const res = await listLogFiles();
    fileRows.value = res.rows || [];
  } catch (e) {
    ElMessage.error(e?.message || '加载失败');
  } finally {
    fileLoading.value = false;
  }
};

const downloadFile = async (fileName) => {
  downloadingMap.value = { ...downloadingMap.value, [fileName]: true };
  try {
    const res = await downloadLogFile(fileName);
    const blob = res.data;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (e) {
    ElMessage.error(e?.message || '下载失败');
  } finally {
    downloadingMap.value = { ...downloadingMap.value, [fileName]: false };
  }
};

watch(activeTab, (v) => {
  if (v === 'db') loadDbLogs();
  if (v === 'files') loadLogFiles();
});

onMounted(async () => {
  await loadDbLogs();
});
</script>

<style scoped>
.log-page {
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

.detail {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.json-block {
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 10px;
}

.json-title {
  font-weight: 600;
  margin-bottom: 8px;
}

.json-pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
  font-size: 12px;
  line-height: 1.5;
}
</style>
