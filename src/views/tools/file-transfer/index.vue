<template>
  <div class="file-transfer-page">
    <div class="header">
      <el-card class="upload-card" shadow="never">
        <div class="upload-row">
          <el-upload
            v-model:file-list="uploadFileList"
            drag
            multiple
            :auto-upload="false"
            :limit="10"
          >
            <div class="upload-content">
              <el-icon class="upload-icon"><UploadFilled /></el-icon>
              <div class="upload-title">拖拽文件到此处，或点击选择</div>
              <div class="upload-subtitle">支持多文件上传，单文件大小受后端限制</div>
            </div>
          </el-upload>
          <div class="upload-actions">
            <el-button type="primary" :loading="uploading" :disabled="uploadFileList.length === 0" @click="doUpload">
              上传
            </el-button>
            <el-button :disabled="uploadFileList.length === 0" @click="uploadFileList = []">清空</el-button>
          </div>
        </div>
      </el-card>
    </div>

    <el-tabs v-model="activeTab" class="tabs">
      <el-tab-pane label="我的文件" name="files">
        <el-card shadow="never">
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input v-model="fileKeyword" placeholder="搜索文件名" clearable style="width: 240px" @keyup.enter="loadFiles" />
              <el-select v-model="fileScope" style="width: 140px">
                <el-option label="仅我的" value="mine" />
                <el-option label="全部文件" value="all" />
              </el-select>
              <el-tag v-if="selectedFileIds.length" type="info">已选 {{ selectedFileIds.length }}</el-tag>
            </div>
            <div class="toolbar-actions">
              <el-button type="primary" :disabled="selectedFileIds.length === 0" @click="openSendDialog">
                发送给用户
              </el-button>
              <el-button @click="loadFiles">刷新</el-button>
            </div>
          </div>

          <el-table v-loading="filesLoading" :data="fileRows" stripe @selection-change="onFileSelectionChange">
            <el-table-column type="selection" width="48" />
            <el-table-column prop="id" label="ID" width="90" />
            <el-table-column prop="originalName" label="文件名" min-width="220" show-overflow-tooltip />
            <el-table-column prop="ext" label="后缀" width="90" />
            <el-table-column prop="size" label="大小" width="120">
              <template #default="{ row }">{{ formatSize(row.size) }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="上传时间" width="180" />
            <el-table-column label="操作" width="220" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link @click="downloadFile(row.id)">下载</el-button>
                <el-button type="danger" link @click="deleteOne(row.id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div class="pagination">
            <el-pagination
              background
              layout="total, prev, pager, next"
              :total="fileTotal"
              :page-size="filePageSize"
              :current-page="filePage"
              @current-change="onFilePageChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="收件箱" name="inbox">
        <el-card shadow="never">
          <div class="toolbar">
            <el-button @click="loadInbox">刷新</el-button>
          </div>
          <el-table v-loading="inboxLoading" :data="inboxRows" row-key="id" stripe>
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="expand-actions">
                  <el-button size="small" type="primary" plain :disabled="row.files?.length === 0" @click="downloadAll(row.files)">
                    下载全部
                  </el-button>
                </div>
                <el-table :data="row.files" size="small">
                  <el-table-column prop="id" label="文件ID" width="90" />
                  <el-table-column prop="originalName" label="文件名" min-width="240" show-overflow-tooltip />
                  <el-table-column prop="ext" label="后缀" width="90" />
                  <el-table-column prop="size" label="大小" width="120">
                    <template #default="{ row: f }">{{ formatSize(f.size) }}</template>
                  </el-table-column>
                  <el-table-column label="操作" width="120">
                    <template #default="{ row: f }">
                      <el-button type="primary" link @click="downloadFile(f.id)">下载</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="90" />
            <el-table-column prop="senderUserId" label="发送者" width="120" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="文件数" width="100">
              <template #default="{ row }">{{ row.files?.length || 0 }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="发送时间" width="180" />
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link :disabled="row.status !== 'sent'" @click="markRead(row.id)">标记已读</el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination
              background
              layout="total, prev, pager, next"
              :total="inboxTotal"
              :page-size="inboxPageSize"
              :current-page="inboxPage"
              @current-change="onInboxPageChange"
            />
          </div>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="发件箱" name="outbox">
        <el-card shadow="never">
          <div class="toolbar">
            <el-button @click="loadOutbox">刷新</el-button>
          </div>
          <el-table v-loading="outboxLoading" :data="outboxRows" row-key="id" stripe>
            <el-table-column type="expand">
              <template #default="{ row }">
                <div class="expand-actions">
                  <el-button size="small" type="primary" plain :disabled="row.files?.length === 0" @click="downloadAll(row.files)">
                    下载全部
                  </el-button>
                </div>
                <el-table :data="row.files" size="small">
                  <el-table-column prop="id" label="文件ID" width="90" />
                  <el-table-column prop="originalName" label="文件名" min-width="240" show-overflow-tooltip />
                  <el-table-column prop="ext" label="后缀" width="90" />
                  <el-table-column prop="size" label="大小" width="120">
                    <template #default="{ row: f }">{{ formatSize(f.size) }}</template>
                  </el-table-column>
                  <el-table-column label="操作" width="120">
                    <template #default="{ row: f }">
                      <el-button type="primary" link @click="downloadFile(f.id)">下载</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </template>
            </el-table-column>
            <el-table-column prop="id" label="ID" width="90" />
            <el-table-column prop="receiverUserId" label="接收者" width="120" />
            <el-table-column label="状态" width="120">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row.status)">{{ statusText(row.status) }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column label="文件数" width="100">
              <template #default="{ row }">{{ row.files?.length || 0 }}</template>
            </el-table-column>
            <el-table-column prop="createTime" label="发送时间" width="180" />
            <el-table-column label="操作" width="160" fixed="right">
              <template #default="{ row }">
                <el-button type="danger" link :disabled="row.status !== 'sent'" @click="withdraw(row.id)">
                  撤回
                </el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination">
            <el-pagination
              background
              layout="total, prev, pager, next"
              :total="outboxTotal"
              :page-size="outboxPageSize"
              :current-page="outboxPage"
              @current-change="onOutboxPageChange"
            />
          </div>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog v-model="sendDialogVisible" title="发送文件" width="520px">
      <el-form label-width="90px">
        <el-form-item label="接收用户">
          <el-select
            v-model="receiverUserId"
            filterable
            remote
            clearable
            placeholder="搜索用户名"
            :remote-method="searchUsers"
            :loading="userLoading"
            style="width: 100%"
          >
            <el-option v-for="u in userOptions" :key="u.userId" :label="u.username + ' (#' + u.userId + ')'" :value="u.userId" />
          </el-select>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="sendNote" type="textarea" :rows="3" placeholder="可选" />
        </el-form-item>
        <el-form-item label="文件数">
          <div>{{ selectedFileIds.length }}</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="sendDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="sending" :disabled="!receiverUserId || selectedFileIds.length === 0" @click="doSend">
          发送
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { ElMessage, ElMessageBox } from 'element-plus';
import { UploadFilled } from '@element-plus/icons-vue';
import request from '@/utils/request';
import {
  deleteFile,
  getFileUrl,
  inboxTransfers,
  listFiles,
  markTransferRead,
  outboxTransfers,
  sendTransfer,
  uploadFiles,
  withdrawTransfer,
} from '@/api/system/fileTransfer';

const activeTab = ref('files');

const uploadFileList = ref([]);
const uploading = ref(false);

const filesLoading = ref(false);
const fileRows = ref([]);
const fileTotal = ref(0);
const filePage = ref(1);
const filePageSize = ref(10);
const fileKeyword = ref('');
const fileScope = ref('mine');
const selectedFileIds = ref([]);

const inboxLoading = ref(false);
const inboxRows = ref([]);
const inboxTotal = ref(0);
const inboxPage = ref(1);
const inboxPageSize = ref(10);

const outboxLoading = ref(false);
const outboxRows = ref([]);
const outboxTotal = ref(0);
const outboxPage = ref(1);
const outboxPageSize = ref(10);

const sendDialogVisible = ref(false);
const receiverUserId = ref(null);
const sendNote = ref('');
const sending = ref(false);

const userOptions = ref([]);
const userLoading = ref(false);

const userCache = new Map();

const formatSize = (bytes) => {
  const n = Number(bytes || 0);
  if (n < 1024) return n + ' B';
  if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' KB';
  if (n < 1024 * 1024 * 1024) return (n / 1024 / 1024).toFixed(1) + ' MB';
  return (n / 1024 / 1024 / 1024).toFixed(1) + ' GB';
};

const statusText = (status) => {
  if (status === 'sent') return '已发送';
  if (status === 'read') return '已读';
  if (status === 'withdrawn') return '已撤回';
  return status || '-';
};

const statusTagType = (status) => {
  if (status === 'sent') return 'warning';
  if (status === 'read') return 'success';
  if (status === 'withdrawn') return 'info';
  return 'info';
};

const loadFiles = async () => {
  filesLoading.value = true;
  try {
    const res = await listFiles({
      page: filePage.value,
      size: filePageSize.value,
      keyword: fileKeyword.value,
      scope: fileScope.value,
    });
    fileRows.value = res.rows || [];
    fileTotal.value = res.total || 0;
  } catch (e) {
    ElMessage.error(e?.message || '加载失败');
  } finally {
    filesLoading.value = false;
  }
};

const loadInbox = async () => {
  inboxLoading.value = true;
  try {
    const res = await inboxTransfers({
      page: inboxPage.value,
      size: inboxPageSize.value,
    });
    inboxRows.value = res.rows || [];
    inboxTotal.value = res.total || 0;
  } catch (e) {
    ElMessage.error(e?.message || '加载失败');
  } finally {
    inboxLoading.value = false;
  }
};

const loadOutbox = async () => {
  outboxLoading.value = true;
  try {
    const res = await outboxTransfers({
      page: outboxPage.value,
      size: outboxPageSize.value,
    });
    outboxRows.value = res.rows || [];
    outboxTotal.value = res.total || 0;
  } catch (e) {
    ElMessage.error(e?.message || '加载失败');
  } finally {
    outboxLoading.value = false;
  }
};

const onFileSelectionChange = (rows) => {
  selectedFileIds.value = (rows || []).map((r) => r.id);
};

const onFilePageChange = (p) => {
  filePage.value = p;
  loadFiles();
};

const onInboxPageChange = (p) => {
  inboxPage.value = p;
  loadInbox();
};

const onOutboxPageChange = (p) => {
  outboxPage.value = p;
  loadOutbox();
};

const doUpload = async () => {
  if (uploadFileList.value.length === 0) return;
  uploading.value = true;
  try {
    const formData = new FormData();
    uploadFileList.value.forEach((f) => {
      if (f.raw) formData.append('files', f.raw);
    });
    const res = await uploadFiles(formData);
    ElMessage.success('上传成功');
    uploadFileList.value = [];
    await loadFiles();
    return res;
  } catch (e) {
    ElMessage.error(e?.message || '上传失败');
  } finally {
    uploading.value = false;
  }
};

const downloadFile = async (id) => {
  try {
    const res = await getFileUrl(id);
    const url = res.data?.url || res.url;
    if (!url) return ElMessage.error('获取下载链接失败');
    window.open(url, '_blank');
  } catch (e) {
    ElMessage.error(e?.message || '获取下载链接失败');
  }
};

const deleteOne = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该文件吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await deleteFile(id);
    ElMessage.success('删除成功');
    await loadFiles();
  } catch {
  }
};

const openSendDialog = () => {
  sendDialogVisible.value = true;
};

const fetchUsers = async (query) => {
  const q = String(query || '').trim();
  if (!q) {
    userOptions.value = [];
    return;
  }

  if (userCache.has(q)) {
    userOptions.value = userCache.get(q);
    return;
  }

  userLoading.value = true;
  try {
    const res = await request({
      url: '/user/list',
      method: 'get',
      params: { username: q, page: 1, size: 10 },
    });
    const options = (res.rows || []).map((u) => ({ userId: u.userId, username: u.username }));
    userCache.set(q, options);
    userOptions.value = options;
  } catch (e) {
    userOptions.value = [];
    ElMessage.error(e?.message || '查询用户失败');
  } finally {
    userLoading.value = false;
  }
};

const searchUsers = useDebounceFn(fetchUsers, 300);

const doSend = async () => {
  sending.value = true;
  try {
    await sendTransfer({
      fileIds: selectedFileIds.value,
      receiverUserId: receiverUserId.value,
      note: sendNote.value,
    });
    ElMessage.success('发送成功');
    sendDialogVisible.value = false;
    receiverUserId.value = null;
    sendNote.value = '';
    await loadOutbox();
  } catch (e) {
    ElMessage.error(e?.message || '发送失败');
  } finally {
    sending.value = false;
  }
};

const markRead = async (id) => {
  try {
    await markTransferRead(id);
    ElMessage.success('已标记');
    await loadInbox();
  } catch (e) {
    ElMessage.error(e?.message || '操作失败');
  }
};

const withdraw = async (id) => {
  try {
    await ElMessageBox.confirm('确定撤回该发送记录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    });
    await withdrawTransfer(id);
    ElMessage.success('已撤回');
    await loadOutbox();
  } catch {
  }
};

const downloadAll = async (files) => {
  const list = Array.isArray(files) ? files : [];
  for (const f of list) {
    if (f?.id) await downloadFile(f.id);
  }
};

watch(activeTab, (v) => {
  if (v === 'files') loadFiles();
  if (v === 'inbox') loadInbox();
  if (v === 'outbox') loadOutbox();
});

watch(fileScope, () => {
  filePage.value = 1;
  loadFiles();
});

onMounted(async () => {
  await loadFiles();
});
</script>

<style scoped>
.file-transfer-page {
  padding: 16px;
}

.header {
  margin-bottom: 12px;
}

.upload-row {
  display: grid;
  grid-template-columns: 1fr 160px;
  gap: 12px;
  align-items: start;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 0;
}

.upload-icon {
  font-size: 28px;
}

.upload-title {
  font-size: 14px;
  font-weight: 600;
}

.upload-subtitle {
  font-size: 12px;
  opacity: 0.7;
}

.upload-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tabs {
  margin-top: 12px;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.toolbar-left {
  display: flex;
  gap: 8px;
  align-items: center;
}

.toolbar-actions {
  display: flex;
  gap: 8px;
}

.expand-actions {
  display: flex;
  justify-content: flex-end;
  padding: 6px 0 10px;
}

.pagination {
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
}
</style>
