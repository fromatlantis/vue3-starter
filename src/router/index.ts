import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

// 导入布局和页面组件
import Layout from '../components/Layout.vue'
import Home from '../views/Home.vue'
import UserTable from '../views/UserTable.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: Layout,
    redirect: '/home',
    children: [
      {
        path: '/home',
        name: 'Home',
        component: Home,
        meta: {
          title: '首页'
        }
      },
      {
        path: '/user-table',
        name: 'UserTable',
        component: UserTable,
        meta: {
          title: '用户管理'
        }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router