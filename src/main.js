import Vue from 'vue'
import App from './App.vue'
import iView from 'iview'
import './index.less'

Vue.use(iView)

new Vue({
    render: h => h(App),
}).$mount('#app')