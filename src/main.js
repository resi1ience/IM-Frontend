import { createApp } from 'vue';
import { createRouter, createWebHistory, createWebHashHistory } from 'vue-router';
import App from './App.vue'
import './style.css';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import ChatList from './components/ChatList.vue';
import ChatRoom from './components/ChatRoom.vue';
import Login from './components/Login.vue';
import Register from'./components/Register.vue';
import IllegalAccess from'./components/IllegalAccess.vue';
import Self from './components/Self.vue';
const routes = [
  { path: '/', redirect: '/into/' },
  { path: '/into/', component: Login },
  { path: '/index/', component: ChatRoom },
  { path: '/chat', component: ChatList },
  { path: '/register', component: Register },
  { path: '/illegal', component: IllegalAccess },
  { path: '/self', component: Self},
];

// const router = createRouter({
//   history: createWebHistory(),
//   routes
// });

const router = createRouter({
  history: createWebHashHistory(),
  routes
});

router.beforeEach((to, from, next) => {
  if (to.matched.length === 0) {  // 如果未匹配到路由
    from.name ? next({ name: from.name }) : next('/illegal')
  } else {
    next()  // 如果匹配到正确跳转
  }
});

const app = createApp(App);

app.use(ElementPlus);
app.use(router);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}

app.mount('#app');
