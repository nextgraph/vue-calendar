<template>
    <div id="app">
        <calendar currentMonth="2020-10"></calendar>
    </div>
</template>
<script>
import Calendar from './components'
export default {
    name: 'app',
    components: {
        Calendar
    },
    data() {
        return {}
    },
    methods: {}
}
</script>
<style>
html,
body {
    width: 100%;
    height: 100%;
}

#app {
    width: 100%;
    height: 100%;
}
</style>