<template>
  <div class="user-table">
    <!-- 查询条件区域 -->
    <el-card shadow="never" class="search-card">
      <template #header>
        <span>查询条件</span>
      </template>
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="用户名">
          <el-input 
            v-model="searchForm.username" 
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input 
            v-model="searchForm.email" 
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item label="创建时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            查询
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作按钮区域 -->
    <el-card shadow="never" class="action-card">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>
      <el-button type="danger" @click="handleBatchDelete" :disabled="!selectedRows.length">
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
      <el-button type="success" @click="handleExport">
        <el-icon><Download /></el-icon>
        导出数据
      </el-button>
    </el-card>

    <!-- 表格区域 -->
    <el-card shadow="never" class="table-card">
      <el-table 
        :data="tableData" 
        v-loading="loading"
        @selection-change="handleSelectionChange"
        stripe
        border
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="username" label="用户名" width="120" />
        <el-table-column prop="email" label="邮箱" width="200" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 'active' ? 'success' : 'danger'">
              {{ row.status === 'active' ? '激活' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column prop="lastLoginTime" label="最后登录" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleEdit(row)">
              编辑
            </el-button>
            <el-button 
              :type="row.status === 'active' ? 'warning' : 'success'" 
              size="small" 
              @click="handleToggleStatus(row)"
            >
              {{ row.status === 'active' ? '禁用' : '启用' }}
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Refresh, Plus, Delete, Download } from '@element-plus/icons-vue'

// 定义用户数据类型
interface UserData {
  id: number
  username: string
  email: string
  phone: string
  status: 'active' | 'disabled'
  createTime: string
  lastLoginTime: string
}

// 查询表单
const searchForm = reactive({
  username: '',
  email: '',
  status: '',
  dateRange: [] as string[]
})

// 表格数据
const tableData = ref<UserData[]>([])
const loading = ref(false)
const selectedRows = ref<UserData[]>([])

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

// 模拟数据
const mockData: UserData[] = [
  {
    id: 1,
    username: 'admin',
    email: 'admin@example.com',
    phone: '13800138001',
    status: 'active',
    createTime: '2024-01-01 10:00:00',
    lastLoginTime: '2024-01-26 09:30:00'
  },
  {
    id: 2,
    username: 'user1',
    email: 'user1@example.com',
    phone: '13800138002',
    status: 'active',
    createTime: '2024-01-02 11:00:00',
    lastLoginTime: '2024-01-25 14:20:00'
  },
  {
    id: 3,
    username: 'user2',
    email: 'user2@example.com',
    phone: '13800138003',
    status: 'disabled',
    createTime: '2024-01-03 12:00:00',
    lastLoginTime: '2024-01-20 16:45:00'
  },
  {
    id: 4,
    username: 'testuser',
    email: 'test@example.com',
    phone: '13800138004',
    status: 'active',
    createTime: '2024-01-04 13:00:00',
    lastLoginTime: '2024-01-24 10:15:00'
  }
]

// 加载数据
const loadData = () => {
  loading.value = true
  setTimeout(() => {
    // 模拟API调用
    tableData.value = mockData
    pagination.total = mockData.length
    loading.value = false
  }, 500)
}

// 查询
const handleSearch = () => {
  console.log('查询条件:', searchForm)
  loadData()
  ElMessage.success('查询完成')
}

// 重置
const handleReset = () => {
  Object.assign(searchForm, {
    username: '',
    email: '',
    status: '',
    dateRange: []
  })
  loadData()
}

// 新增用户
const handleAdd = () => {
  ElMessage.info('新增用户功能待实现')
}

// 编辑用户
const handleEdit = (row: UserData) => {
  ElMessage.info(`编辑用户: ${row.username}`)
}

// 删除用户
const handleDelete = (row: UserData) => {
  ElMessageBox.confirm(`确定要删除用户 "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    loadData()
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 切换状态
const handleToggleStatus = (row: UserData) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    row.status = row.status === 'active' ? 'disabled' : 'active'
    ElMessage.success(`${action}成功`)
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('批量删除成功')
    selectedRows.value = []
    loadData()
  })
}

// 导出数据
const handleExport = () => {
  ElMessage.info('导出功能待实现')
}

// 选择变化
const handleSelectionChange = (selection: UserData[]) => {
  selectedRows.value = selection
}

// 分页大小变化
const handleSizeChange = (size: number) => {
  pagination.pageSize = size
  loadData()
}

// 当前页变化
const handleCurrentChange = (page: number) => {
  pagination.currentPage = page
  loadData()
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-table {
  padding: 20px;
}

.search-card,
.action-card,
.table-card {
  margin-bottom: 20px;
}

.search-form {
  margin-bottom: 0;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>