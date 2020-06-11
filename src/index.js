import VxCalendar from './components'

const install = function(Vue, opts = {}) {
    Vue.component(VxCalendar.name, VxCalendar);
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    install
};