import VxCalendar from './components/calendar'
import VxChinaMap from './components/china-map'

const install = function(Vue, opts = {}) {
    Vue.component(VxCalendar.name, VxCalendar)
    Vue.component(VxChinaMap.name, VxChinaMap)
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    install
};