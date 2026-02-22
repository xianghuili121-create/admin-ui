<template>
  <div class="api-manager-container">
    <el-container class="layout-container">
      <!-- 左侧接口列表 -->
      <el-aside width="350px" class="api-sidebar">
        <div class="sidebar-header">
          <el-input
            v-model="searchKeyword"
            placeholder="搜索接口 (路径/名称/描述)"
            prefix-icon="Search"
            clearable
            @input="handleSearch"
          />
        </div>
        <el-scrollbar class="api-list">
          <el-collapse v-model="activeNames" accordion>
            <el-collapse-item
              v-for="(group, tagName) in filteredApiGroups"
              :key="tagName"
              :title="tagName + ' (' + group.length + ')'"
              :name="tagName"
            >
              <div
                v-for="api in group"
                :key="api.id"
                class="api-item"
                :class="{ active: currentApi && currentApi.id === api.id }"
                @click="selectApi(api)"
              >
                <div class="api-method" :class="api.method">{{ api.method.toUpperCase() }}</div>
                <div class="api-path" :title="api.path">{{ api.path }}</div>
                <div class="api-summary" :title="api.summary">{{ api.summary }}</div>
              </div>
            </el-collapse-item>
          </el-collapse>
          <div v-if="Object.keys(filteredApiGroups).length === 0" class="empty-state">
            暂无匹配接口
          </div>
        </el-scrollbar>
      </el-aside>

      <!-- 右侧详情与测试 -->
      <el-main class="api-content">
        <div v-if="currentApi" class="api-detail">
          <!-- 接口头部信息 -->
          <div class="detail-header">
            <div class="title-row">
              <el-tag :type="getMethodType(currentApi.method)" effect="dark" size="large">
                {{ currentApi.method.toUpperCase() }}
              </el-tag>
              <h2 class="api-path-title">{{ currentApi.path }}</h2>
            </div>
            <p class="api-summary-text">{{ currentApi.summary }}</p>
            <p class="api-description" v-if="currentApi.description">{{ currentApi.description }}</p>
          </div>

          <el-divider />

          <!-- 请求参数区域 -->
          <div class="request-section">
            <h3>请求参数 (Request Parameters)</h3>
            
            <!-- Path & Query Params -->
            <div v-if="currentApi.parameters && currentApi.parameters.length > 0">
              <h4>Query / Path</h4>
              <el-table :data="currentApi.parameters" border style="width: 100%">
                <el-table-column prop="name" label="参数名" width="180">
                  <template #default="{ row }">
                    <span class="param-name">{{ row.name }}</span>
                    <span v-if="row.required" class="required-mark">*</span>
                  </template>
                </el-table-column>
                <el-table-column prop="in" label="位置" width="100">
                  <template #default="{ row }">
                    <el-tag size="small">{{ row.in }}</el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="值" min-width="200">
                  <template #default="{ row }">
                    <el-input v-model="requestParams[row.name]" :placeholder="row.description || '请输入值'" />
                  </template>
                </el-table-column>
                <el-table-column prop="description" label="描述" />
              </el-table>
            </div>

            <!-- Body Params -->
            <div v-if="currentApi.requestBody" class="body-params">
              <h4>Body (JSON)</h4>
              <el-input
                v-model="requestBody"
                type="textarea"
                :rows="6"
                placeholder="请输入 JSON 请求体"
                class="json-editor"
              />
              <div class="json-tools">
                <el-button link type="primary" @click="formatJson">格式化 JSON</el-button>
              </div>
            </div>
          </div>

          <!-- 发送按钮 -->
          <div class="action-bar">
            <el-button type="primary" :loading="loading" @click="sendRequest" size="large" icon="Position">
              发送请求 (Send)
            </el-button>
          </div>

          <el-divider />

          <!-- 响应结果区域 -->
          <div class="response-section" ref="responseSection">
            <h3>响应结果 (Response)</h3>
            <div v-if="response" class="response-box" :class="{ error: response.status >= 400 }">
              <div class="response-meta">
                <el-tag :type="response.status < 300 ? 'success' : 'danger'">
                  Status: {{ response.status }} {{ response.statusText }}
                </el-tag>
                <span class="response-time">耗时: {{ responseTime }}ms</span>
              </div>
              <el-tabs v-model="activeResponseTab">
                <el-tab-pane label="Body" name="body">
                  <pre class="code-block">{{ response.data }}</pre>
                </el-tab-pane>
                <el-tab-pane label="Headers" name="headers">
                  <pre class="code-block">{{ response.headers }}</pre>
                </el-tab-pane>
              </el-tabs>
            </div>
            <div v-else class="empty-response">
              <el-empty description="点击发送请求查看结果" :image-size="100" />
            </div>
          </div>
        </div>

        <div v-else class="welcome-screen">
          <el-empty description="请从左侧选择一个接口开始调试" />
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, reactive } from 'vue';
import axios from 'axios';
import { ElMessage } from 'element-plus';
import { Search, Position } from '@element-plus/icons-vue';
import { getToken } from '@/utils/myCookie';
import request from '@/utils/request';

// 状态定义
const allApis = ref([]); // 扁平化的接口列表
const apiGroups = ref({}); // 按 Tag 分组的接口
const filteredApiGroups = ref({}); // 搜索过滤后的分组
const activeNames = ref([]); // 展开的手风琴面板
const searchKeyword = ref('');
const currentApi = ref(null);
const loading = ref(false);

// 请求相关
const requestParams = reactive({});
const requestBody = ref('');
const response = ref(null);
const responseTime = ref(0);
const activeResponseTab = ref('body');

// 初始化：获取 Swagger JSON
onMounted(async () => {
  try {
    const { data } = await axios.get('http://ithui.cloud:3000/api-docs-json');
    parseSwaggerData(data);
  } catch (error) {
    ElMessage.error('获取接口定义失败: ' + error.message);
  }
});

// 解析 Swagger 数据
const parseSwaggerData = (data) => {
  const apis = [];
  const groups = {};

  // 遍历 paths
  for (const [path, methods] of Object.entries(data.paths)) {
    for (const [method, detail] of Object.entries(methods)) {
      const api = {
        id: `${method}:${path}`,
        path,
        method,
        summary: detail.summary || '无描述',
        description: detail.description,
        tags: detail.tags || ['Default'],
        parameters: detail.parameters || [],
        requestBody: detail.requestBody,
        // 预处理 Body 示例
        bodyExample: getBodyExample(detail.requestBody)
      };

      apis.push(api);

      // 分组
      api.tags.forEach(tag => {
        if (!groups[tag]) groups[tag] = [];
        groups[tag].push(api);
      });
    }
  }

  allApis.value = apis;
  apiGroups.value = groups;
  filteredApiGroups.value = groups;
  
  // 默认展开第一个分组
  if (Object.keys(groups).length > 0) {
    activeNames.value = [Object.keys(groups)[0]];
  }
};

// 获取 Body 示例 (简化版)
const getBodyExample = (requestBody) => {
  if (!requestBody || !requestBody.content || !requestBody.content['application/json']) return '';
  const schema = requestBody.content['application/json'].schema;
  if (schema.properties) {
    const example = {};
    for (const key in schema.properties) {
        example[key] = schema.properties[key].example || (schema.properties[key].type === 'integer' ? 0 : "");
    }
    return JSON.stringify(example, null, 2);
  }
  return '{}';
};

// 搜索逻辑
const handleSearch = () => {
  const keyword = searchKeyword.value.toLowerCase();
  if (!keyword) {
    filteredApiGroups.value = apiGroups.value;
    return;
  }

  const newGroups = {};
  for (const [tag, apis] of Object.entries(apiGroups.value)) {
    const filteredApis = apis.filter(api => 
      api.path.toLowerCase().includes(keyword) || 
      api.summary.toLowerCase().includes(keyword) ||
      (api.description && api.description.toLowerCase().includes(keyword))
    );
    if (filteredApis.length > 0) {
      newGroups[tag] = filteredApis;
    }
  }
  filteredApiGroups.value = newGroups;
  activeNames.value = Object.keys(newGroups);
};

// 选择接口
const selectApi = (api) => {
  currentApi.value = api;
  response.value = null;
  // 重置参数
  Object.keys(requestParams).forEach(key => delete requestParams[key]);
  api.parameters.forEach(p => {
    requestParams[p.name] = ''; 
  });
  // 重置 Body
  requestBody.value = api.bodyExample || '';
};

// 格式化 JSON
const formatJson = () => {
  try {
    const obj = JSON.parse(requestBody.value);
    requestBody.value = JSON.stringify(obj, null, 2);
  } catch (e) {
    ElMessage.warning('JSON 格式错误');
  }
};

// 发送请求
const sendRequest = async () => {
  if (!currentApi.value) return;
  loading.value = true;
  const startTime = Date.now();

  try {
    // 构造 URL (替换 Path 参数)
    let url = currentApi.value.path;
    const queryParams = {};
    
    currentApi.value.parameters.forEach(p => {
      if (p.in === 'path') {
        url = url.replace(`{${p.name}}`, requestParams[p.name]);
      } else if (p.in === 'query') {
        if (requestParams[p.name]) {
          queryParams[p.name] = requestParams[p.name];
        }
      }
    });

    // 构造 Body
    let data = null;
    if (currentApi.value.requestBody && requestBody.value) {
      try {
        data = JSON.parse(requestBody.value);
      } catch (e) {
        ElMessage.error('请求体 JSON 格式错误');
        loading.value = false;
        return;
      }
    }

    const token = getToken();
    const headers = {
        'Content-Type': 'application/json'
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // 复用 request.defaults.baseURL
    const baseURL = request.defaults.baseURL;

    // 移除 baseURL 末尾的 /api (如果存在)，因为 swagger 返回的 url 已经包含 /api 前缀
    // 或者判断 url 是否已经包含 /api 前缀，避免重复拼接
    // 假设 swagger 返回的 path 都是以 /api 开头 (例如 /api/auth/login)
    // 而 request.defaults.baseURL 也配置了 /api (例如 http://host:port/api)
    // 直接拼接会导致 /api/api/auth/login
    
    let finalUrl = url;
    let finalBaseUrl = baseURL;

    if (baseURL.endsWith('/api') && url.startsWith('/api')) {
        finalBaseUrl = baseURL.slice(0, -4); // 去掉 baseURL 末尾的 /api
    }

    const res = await axios({
      method: currentApi.value.method,
      url: `${finalBaseUrl}${finalUrl}`, 
      params: queryParams,
      data,
      headers
    });

    response.value = {
      status: res.status,
      statusText: res.statusText,
      data: res.data,
      headers: res.headers
    };
  } catch (error) {
    if (error.response) {
      response.value = {
        status: error.response.status,
        statusText: error.response.statusText,
        data: error.response.data,
        headers: error.response.headers
      };
    } else {
      ElMessage.error('请求发送失败: ' + error.message);
    }
  } finally {
    responseTime.value = Date.now() - startTime;
    loading.value = false;
  }
};

// 辅助函数
const getMethodType = (method) => {
  const map = {
    get: 'primary',
    post: 'success',
    put: 'warning',
    delete: 'danger',
    patch: 'info'
  };
  return map[method.toLowerCase()] || 'info';
};
</script>

<style scoped lang="scss">
.api-manager-container {
  height: calc(100vh - 100px); /* 适配顶部导航 (60px) + padding (40px) */
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  overflow: hidden; /* 防止外层出现双重滚动条 */
}

.layout-container {
  height: 100%;
}

/* 侧边栏样式 */
.api-sidebar {
  background: #fff;
  border-right: 1px solid #e6e6e6;
  display: flex;
  flex-direction: column;
  
  .sidebar-header {
    padding: 16px;
    border-bottom: 1px solid #ebeef5;
    background: #fff;
    z-index: 1;
  }
  
  .api-list {
    flex: 1;
    padding: 0;
  }
}

.api-item {
  padding: 10px 16px;
  cursor: pointer;
  border-left: 3px solid transparent;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f5f7fa;
  }
  
  &.active {
    background-color: #ecf5ff;
    border-left-color: #409eff;
  }
  
  .api-method {
    font-size: 12px;
    font-weight: bold;
    display: inline-block;
    width: 50px;
    
    &.get { color: #409eff; }
    &.post { color: #67c23a; }
    &.put { color: #e6a23c; }
    &.delete { color: #f56c6c; }
  }
  
  .api-path {
    font-family: monospace;
    font-size: 13px;
    color: #333;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  
  .api-summary {
    font-size: 12px;
    color: #909399;
    margin-top: 4px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

/* 右侧内容样式 */
.api-content {
  padding: 24px;
  background-color: #fff;
  overflow-y: auto;
}

.detail-header {
  .title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 12px;
    
    h2 {
      margin: 0;
      font-family: monospace;
      font-size: 20px;
    }
  }
  
  .api-summary-text {
    font-size: 16px;
    font-weight: 500;
    margin-bottom: 8px;
  }
  
  .api-description {
    color: #606266;
    font-size: 14px;
  }
}

.request-section {
  h3 { margin-bottom: 16px; font-weight: 600; }
  h4 { margin: 16px 0 8px; font-size: 14px; color: #606266; }
  
  .param-name { font-weight: bold; }
  .required-mark { color: red; margin-left: 4px; }
  
  .body-params {
    .json-editor {
      font-family: monospace;
    }
    .json-tools {
      margin-top: 8px;
      text-align: right;
    }
  }
}

.action-bar {
  margin: 24px 0;
  display: flex;
  justify-content: flex-end;
}

.response-section {
  h3 { margin-bottom: 16px; }
  
  .response-box {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    padding: 16px;
    background-color: #fafafa;
    
    &.error {
      border-color: #fde2e2;
      background-color: #fef0f0;
    }
    
    .response-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      
      .response-time {
        font-size: 12px;
        color: #909399;
      }
    }
    
    .code-block {
      background: #282c34;
      color: #abb2bf;
      padding: 12px;
      border-radius: 4px;
      overflow-x: auto;
      font-family: monospace;
      font-size: 13px;
      margin: 0;
      max-height: 500px;
    }
  }
}

.welcome-screen {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #909399;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #909399;
  font-size: 13px;
}
</style>
