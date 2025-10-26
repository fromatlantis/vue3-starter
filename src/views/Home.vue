<template>
  <div class="home">
    <el-card shadow="hover" class="welcome-card">
      <template #header>
        <div class="card-header">
          <span>欢迎使用管理系统</span>
        </div>
      </template>
      <div class="welcome-content">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-statistic title="用户总数" :value="1234" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="今日访问" :value="567" />
          </el-col>
          <el-col :span="8">
            <el-statistic title="系统运行天数" :value="89" />
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>快速操作</span>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="goToUserTable">用户管理</el-button>
            <el-button type="success">数据统计</el-button>
            <el-button type="warning">系统设置</el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card shadow="hover">
          <template #header>
            <span>系统通知</span>
          </template>
          <div class="notifications">
            <p>• 系统将于今晚进行维护</p>
            <p>• 新版本功能已上线</p>
            <p>• 请及时更新个人信息</p>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const goToUserTable = () => {
  router.push('/user-table')
}
</script>

<style scoped>
.home {
  padding: 20px;
}

.welcome-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
}

.welcome-content {
  padding: 20px 0;
}

.quick-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.notifications p {
  margin: 8px 0;
  color: #666;
}
</style>