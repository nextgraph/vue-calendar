<template>
    <div id="app">
        <map-base ref="map">
            <l-geo-json
                ref="geoJson"
                :geojson="geoJson"
                :options-style="styleFunction"
                :options="options"
                @add="tileload"
                @remove="remove"
                @layeradd="layeradd"
                @layerremove="layerremove"
            />

            <l-layer-group>
                <l-marker
                    v-for="(m,i) in markers"
                    :key="i"
                    :lat-lng="m.center"
                    :options="m.options"
                >
                    <l-icon class-name="x">
                        <div class="m">
                            <div class="y">{{m.html}}</div>
                        </div>
                    </l-icon>
                </l-marker>
            </l-layer-group>
        </map-base>
    </div>
</template>
<script>
import dayjs from 'dayjs'
import {
    LControl,
    LMarker,
    LPopup,
    LGeoJson,
    LLayerGroup,
    LIcon
} from 'vue2-leaflet'
delete L.Icon.Default.prototype._getIconUrl
// ItekCore.HTTP.setToken('eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ0ZW5hbnRfaWQiOjEwMCwiaXNfc3VwZXJfdXNlciI6dHJ1ZSwiZW1wX2d1aWQiOiI0MSIsImRlcHRfZ3VpZCI6IjEifQ.nQqBCflIzbG57doddYVdI9fjV80sEcMx4hmPdXVLoRk')

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

export default {
    name: 'app',
    provide: {
        disableDays: ['2020-07-01', '2020-07-03']
    },
    components: {
        MapBase: () => import('./components/map'),
        LLayerGroup,
        LMarker,
        LIcon,
        LGeoJson //http://121.199.44.59/itek/540400.json
    },
    computed: {
        markers() {
            if (!this.geoJson.features) {
                return []
            }

            let markers = this.geoJson.features
                .filter(element => {
                    return !!element.properties.center
                })
                .map(element => {
                    return {
                        center: L.GeoJSON.coordsToLatLng(
                            element.properties.center
                        ),
                        html: element.properties.name
                    }
                })

            return markers
        },
        options() {
            return {
                onEachFeature: this.onEachFeatureFunction,
                filter: feature => {
                    if (!feature.properties.level) {
                        //不显示中国底图 100000
                        return false
                    }

                    // if (feature.properties.level === 'province') {
                    //     return (
                    //         feature.properties.adcode === '510000' ||
                    //         feature.properties.name === '湖南省'
                    //     )
                    // } else {
                    //     return true
                    // }

                    return true
                }
            }
        },
        onEachFeatureFunction() {
            return (feature, layer) => {
                layer.on({
                    mouseover: this.highlightFeature,
                    mouseout: this.resetHighlight,
                    click: this.zoomToFeature
                })

                // const properties = feature.properties
                // if (properties.center) {
                //     this.marks.push({
                //         center: L.GeoJSON.coordsToLatLng(properties.center),
                //         html: properties.name
                //     })
                // }

                // console.log(properties.adcode)
                // console.log(properties.name)
                // console.log(properties.center)
                // const myIcon = L.divIcon({html: properties.name});
                // you can set .my-div-icon styles in CSS
                // L.marker(layer,properties.center, {icon: myIcon});
                // layer.bindTooltip('<div>我的测试</div>', {
                //     direction: 'auto',
                //     offset: [-0, -0]
                // })
                // console.log(this.marks)
            }
        }
    },
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
    async created() {
        let m = await fetch('http://localhost:8080/itek/100000_full.json')
        m.json().then(json => {
            this.geoJson = json
            this.$nextTick(_ => {
                this.$refs.map.fitBounds(this.$refs.geoJson.getBounds())
            })
        })
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
        layeradd(m) {
            console.log('layeradd')
        },
        layerremove() {
            console.log('layerremove')
        },
        remove() {
            console.log('remove title')
        },
        tileload() {
            console.log('add title')
        },
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
        highlightFeature(e) {
            let layer = e.target
            layer.setStyle({
                weight: 3,
                fillOpacity: 0.8
            })
            // console.log(layer)
            let tenantid = layer.feature.properties.tenantid
            this.tenantid = tenantid ? tenantid : this.tenantid
            // this.loadInfo(this.covermapData, layer.feature.properties)
            // cosole.log
        },

        resetHighlight(e) {
            this.$refs.geoJson.mapObject.resetStyle(e.target)
        },

        zoomToFeature(e) {
            let layer = e.target

            const adcode = layer.feature.properties.adcode
            if (layer.feature.properties.level === 'district') {
                return
            }
            let url = `http://localhost:8080/itek/${adcode}_full.json`
            fetch(url).then(res => {
                res.json().then(json => {
                    this.geoJson = json
                    this.$nextTick(_ => {
                        this.$refs.map.fitBounds(this.$refs.geoJson.getBounds())
                    })
                })
            })
            // // this.org_code =
            // //     layer.feature.properties.orgCode ||
            // //     layer.feature.properties.code
            // // this.org_codes.push(this.org_code)
            // let tenantid = layer.feature.properties.tenantid
            // if (tenantid !== undefined) {
            //     // this.tenantid = tenantid
            //     // this.tenantids.push(this.tenantid)
            // }
            // if (this.levels.length === 1) {
            //     /* 第二级 */
            //     // this.levels.push('rd/' + layer.feature.properties.code)
            //     // this.queryCoverLonAndLat(this.levels[this.levels.length - 1])
            // } else {
            //     /* 第三级 */
            //     // this.levels.push('dt/' + layer.feature.properties.code)
            // }
            // let url = this.baseUrl + this.url
            // let params = {
            //     org_code: this.org_code,
            //     yearmonth: this.yearmonth,
            //     storetype: this.storetype,
            //     channel: this.channel
            // }
            // this.getMapcover(url, params)
            // this.$refs.map.fitBounds(layer.getBounds())

            // let m = await fetch('http://localhost:8080/itek/100000_full.json')
            // m.json().then(json => {
            //     this.geoJson = json
            //     setTimeout(() => {
            //         this.$refs.map.fitBounds(this.$refs.geoJson.getBounds())
            //     }, 1000)
            //     // this.$nextTick(_ => {
            //     //     this.$refs.map.fitBounds(this.$refs.geoJson.getBounds())
            //     //     console.log(this.$refs.geoJson.getBounds())
            //     // })
            // })
        },
        /* 加載地圖所需要的方法 */
        styleFunction(feature) {
            // let tenantid =
            //     feature.properties.tenantid || feature.properties.orgCode
            return {
                weight: 1,
                // opacity: 1,
                // // color: 'white',
                // dashArray: '1',
                // fillOpacity: 0.55
                // fillColor: this.colorObj[this.geoJsons[tenantid]] || 'gray'
                // fillColor: feature.properties.color || '#00b9f1'
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
    position: relative;
    overflow: hidden;
}

.x {
    position: relative;
}

.m {
    display: block;
    position: absolute;
}

.y {
    /* margin-left: -50% !important;
    margin-top: -50% !important; */
    margin-left: -30%;
    margin-top: -5px;
    font-weight: bold;
    color: #d84315;
    text-decoration: underline;
    word-break: keep-all;
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