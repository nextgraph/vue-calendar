import Vue from 'vue'
import App from './App.vue'
import iView from 'iview'
import './index.less'

Vue.use(iView)

delete L.Icon.Default.prototype._getIconUrl
    // ItekCore.HTTP.setToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnRfaWQiOjEwMCwiaXNfc3VwZXJfdXNlciI6dHJ1ZSwiZW1wX2d1aWQiOiI0MSIsImRlcHRfZ3VpZCI6IjEifQ.nQqBCflIzbG57doddYVdI9fjV80sEcMx4hmPdXVLoRk')

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

new Vue({
    render: h => h(App),
}).$mount('#app')