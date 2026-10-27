import { createRouter, createWebHistory } from 'vue-router'
import { buildRoutes } from './buildRoutes'
import { authNavigationGuard } from '@/app/auth/guards'

export const router = createRouter({
  history: createWebHistory(),
  routes: buildRoutes(),
})

router.beforeEach(authNavigationGuard)

export default router
