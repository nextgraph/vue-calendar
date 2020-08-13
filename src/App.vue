<template>
    <div id="app">
        <china-map
            ref="map"
            globalName="花冠酒业"
            @select-region="selectRegion"
            @over-region="overRegion"
            :filter-func="filter"
        ></china-map>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import ChinaMap from './components/china-map'

export default {
    name: 'app',
    provide: {
        disableDays: ['2020-07-01', '2020-07-03']
    },
    components: {
        ChinaMap
    },
    computed: {},
    data() {
        return {
            geoJson: [],
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

        // console.log(this.$refs.geoJson.mapObject)
        //                     console.log(this.$refs.geoJson.mapObject.getBounds())
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
        },

        selectRegion(region) {
            console.log(JSON.stringify(region))
        },
        overRegion(region) {
            console.log(JSON.stringify(region))
        },
        filter(feature) {
            if (!feature.properties.level) {
                //不显示中国底图 100000
                return false
            }

            if (feature.properties.level === 'province') {
                return (
                    // feature.properties.adcode === '510000'
                    feature.properties.name === '湖南省',
                    feature.properties.name === '北京市'
                )
                // return false
            } else {
                return true
            }
        }
    }
}
</script>
<style>
* {
    padding: 0;
    margin: 0;
}
html,
body {
    width: 100%;
    height: 100%;
}

#app {
    width: 100%;
    height: 100%;
    /* position: relative;
    overflow: hidden; */
}
</style>
