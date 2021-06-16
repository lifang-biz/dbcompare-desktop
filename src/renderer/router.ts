import { createRouter, createMemoryHistory } from 'vue-router'
import BasicLayout from '/@/components/BasicLayout.vue'
import Home from '/@/components/Home.vue'
import NodeList from '/@/components/NodeList.vue'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    {
      path: '/',
      name: 'base',
      component: BasicLayout,
      children: [
        {
          path: '',
          name: 'home',
          component: Home
        },
        {
          path: '/node',
          name: 'node',
          component: NodeList
        }
      ]
    }
  ]
})

export default router
