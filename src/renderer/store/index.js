import Vue from 'vue'
import Vuex from 'vuex'
import { createSharedMutations, createPersistedState } from 'vuex-electron'
import modules from './modules'
import BootstrapVue from 'bootstrap-vue';

Vue.use(BootstrapVue, {
  BTooltip: {
    delay: {
      show: 1000
    },
  },
  BPopover: {
    delay: 1000,
  },
});

Vue.use(Vuex)

export default new Vuex.Store({
  modules,
  plugins: [
    createSharedMutations()
  ],
  strict: process.env.NODE_ENV !== 'production'
})
