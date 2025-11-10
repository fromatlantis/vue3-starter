<template>
  <div class="user-table">
    <!-- 新增用户对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="handleDialogClose"
    >
      <el-form
        ref="formRef"
        :model="userForm"
        :rules="formRules"
        label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="userForm.username"
            placeholder="请输入用户名"
            clearable
          />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="userForm.email"
            placeholder="请输入邮箱"
            clearable
          />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input
            v-model="userForm.phone"
            placeholder="请输入手机号"
            clearable
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="userForm.status">
            <el-radio value="active">激活</el-radio>
            <el-radio value="disabled">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit" :loading="submitLoading">
          确定
        </el-button>
      </template>
    </el-dialog>

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
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import { Search, Refresh, Plus, Delete, Download } from '@element-plus/icons-vue'
import { supabase } from '@/utils/supabase'

// 定义用户数据类型
interface UserData {
  id: number
  username: string
  email: string
  phone: string
  status: 'active' | 'disabled'
  createTime: string
  lastLoginTime: string | null
}

// 定义用户表单类型
interface UserForm {
  username: string
  email: string
  phone: string
  status: 'active' | 'disabled'
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

// 对话框相关
const dialogVisible = ref(false)
const dialogTitle = ref('新增用户')
const submitLoading = ref(false)
const formRef = ref<FormInstance>()

// 用户表单
const userForm = reactive<UserForm>({
  username: '',
  email: '',
  phone: '',
  status: 'active'
})

// 表单验证规则
const formRules: FormRules<UserForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在 3 到 20 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 将Supabase数据转换为前端格式
const transformUserData = (user: any): UserData => {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    phone: user.phone,
    status: user.status,
    createTime: new Date(user.created_at).toLocaleString('zh-CN'),
    lastLoginTime: user.last_login_at ? new Date(user.last_login_at).toLocaleString('zh-CN') : '-'
  }
}

// 加载数据
const loadData = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      ElMessage.error('加载数据失败: ' + error.message)
      return
    }

    if (data) {
      tableData.value = data.map((user: any) => transformUserData(user))
      pagination.total = data.length
    }
  } catch (err) {
    ElMessage.error('加载数据异常')
    console.error(err)
  } finally {
    loading.value = false
  }
}

// 查询
const handleSearch = () => {
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
  dialogTitle.value = '新增用户'
  dialogVisible.value = true
}

// 关闭对话框
const handleDialogClose = () => {
  formRef.value?.resetFields()
  Object.assign(userForm, {
    username: '',
    email: '',
    phone: '',
    status: 'active'
  })
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return

  await formRef.value.validate(async (valid) => {
    if (valid) {
      submitLoading.value = true

      try {
        const { error } = await supabase
          .from('users')
          .insert([
            {
              username: userForm.username,
              email: userForm.email,
              phone: userForm.phone,
              status: userForm.status
            }
          ])

        if (error) {
          ElMessage.error('新增用户失败: ' + error.message)
          submitLoading.value = false
          return
        }

        submitLoading.value = false
        dialogVisible.value = false
        ElMessage.success('新增用户成功')
        await loadData()
      } catch (err) {
        submitLoading.value = false
        ElMessage.error('新增用户异常')
        console.error(err)
      }
    }
  })
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
  }).then(async () => {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', row.id)

      if (error) {
        ElMessage.error('删除失败: ' + error.message)
        return
      }

      ElMessage.success('删除成功')
      await loadData()
    } catch (err) {
      ElMessage.error('删除异常')
      console.error(err)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

// 切换状态
const handleToggleStatus = (row: UserData) => {
  const action = row.status === 'active' ? '禁用' : '启用'
  const newStatus = row.status === 'active' ? 'disabled' : 'active'

  ElMessageBox.confirm(`确定要${action}用户 "${row.username}" 吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ status: newStatus })
        .eq('id', row.id)

      if (error) {
        ElMessage.error(`${action}失败: ` + error.message)
        return
      }

      row.status = newStatus as 'active' | 'disabled'
      ElMessage.success(`${action}成功`)
    } catch (err) {
      ElMessage.error(`${action}异常`)
      console.error(err)
    }
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的 ${selectedRows.value.length} 个用户吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(async () => {
    try {
      const ids = selectedRows.value.map(row => row.id)
      const { error } = await supabase
        .from('users')
        .delete()
        .in('id', ids)

      if (error) {
        ElMessage.error('批量删除失败: ' + error.message)
        return
      }

      ElMessage.success('批量删除成功')
      selectedRows.value = []
      await loadData()
    } catch (err) {
      ElMessage.error('批量删除异常')
      console.error(err)
    }
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
