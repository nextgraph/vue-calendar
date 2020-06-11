const install = function(Vue, opts = {}) {
//    Vue.component(VTable.name, VTable);
}

// auto install
if (typeof window !== 'undefined' && window.Vue) {
    install(window.Vue);
}

export default {
    install};