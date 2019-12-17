import Vue from 'vue'

import App from './App'
import store from './store'

import BootstrapVue from 'bootstrap-vue'
import '../../node_modules/bootstrap/dist/css/bootstrap.min.css'
import '../../node_modules/bootstrap-vue/dist/bootstrap-vue.css'
import '../../static/style.css'
import '../../node_modules/focus-visible/dist/focus-visible.min.js'

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.config.productionTip = false

Vue.use(BootstrapVue)
/* eslint-disable no-new */
new Vue({
  components: { App },
  store,
  template: '<App/>'
}).$mount('#app')
