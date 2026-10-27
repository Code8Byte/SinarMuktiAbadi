import type { RouteRecordRaw } from 'vue-router'

export const commonRoutes: RouteRecordRaw[] = [
  {
    path: '/403',
    name: 'Forbidden',
    component: () => import('@/modules/common/views/ForbiddenView.vue'),
    meta: {
      public: true,
      title: 'Akses Ditolak',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/modules/common/views/NotFoundView.vue'),
    meta: {
      public: true,
      title: 'Halaman Tidak Ditemukan',
    },
  },
]
