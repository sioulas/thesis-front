import { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('pages/IndexPage.vue') },
      { path: 'greece-map', name: 'Greece Map', component: () => import('pages/GreeceMap.vue') },
      { path: 'air-quality', name: 'Air Quality', component: () => import('pages/AirQuality.vue') },
      { path: 'future-predictions', name: 'Future Predictions', component: () => import('pages/FuturePredictions.vue') }
    ],
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
]

export default routes
