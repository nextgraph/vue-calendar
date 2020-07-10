<template>
    <div id="app">
        <calendar currentMonth="2020-07"
            :events="fcEvents"
            @dayClick="dayClick"
            ></calendar>
    </div>
</template>
<script>
import Calendar from './components'
import dayjs from 'dayjs'
export default {
    name: 'app',
    provide: {
        disableDays: ['2020-07-01', '2020-07-03']
    },
    components: {
        Calendar
    },
    data() {
        return {
            fcEvents: [
                {
                    title: '',
                    start: dayjs(new Date()).format('YYYY-MM-DD'),
                    end: dayjs(new Date()).format('YYYY-MM-DD'),
                    cssClass: 'selectedDay'
                }
            ]
        }
    },
    mounted() {
        this.fcEvents = [
            {
                title: '已排班',
                start: '2020-07-08',
                end: '2020-07-08',
                cssClass: 'plan'
            }
        ]
    },
    methods: {
        dayClick(day, event) {
            // this.fcEvents.shift()
            // this.fcEvents.unshift({
            //     title: '',
            //     start: dayjs(day).format('YYYY-MM-DD'),
            //     end: dayjs(day).format('YYYY-MM-DD'),
            //     cssClass: 'planClassName'
            // })
            // this.$emit('dayClick', dayjs(day).format('YYYY-MM-DD'))
        }
    }
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
 .plan {
     background-color: transparent!important;
     text-align: center;
 }

/*.full-calendar-body .dates .week-row .day-cell {
    min-height: 0 !important;
}
.full-calendar-body .dates .dates-events .events-week .events-day {
    height: 30px !important;
    min-height: 0 !important;
    position: relative;
}
.planClassName {
    display: block !important;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: calc(100% - 2px) !important;
    padding: 0 !important;
    margin: 0 !important;
    opacity: 0.5;
    background-color: #2b85e4!important;
}
.selectedDay {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100% !important;
    padding: 0 !important;
    margin: 0 !important;
    opacity: 0.5;
} */
</style>