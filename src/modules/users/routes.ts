import type { RouteRecordRaw } from 'vue-router'

export const usersRoutes: RouteRecordRaw = {
  path: '/users',
  name: 'UsersList',
  component: () => import('./views/UserListView.vue'),
  meta: {
    permissions: ['users.view'],
  },
}
