<template>
    <div class="vx-china-map">
        <LMap :center="center" :options="mapOptions" :zoom="4" class="vx-china-map__map" ref="map">
            <LTileLayer :minZoom="4" :subdomains="provider.Subdomains" :url="provider.layer1"></LTileLayer>
            <LTileLayer
                :minZoom="4"
                :subdomains="provider.Subdomains"
                :url="provider.layer2"
                v-if="provider.layer2"
            ></LTileLayer>
            <LLayerGroup>
                <LGeoJson
                    ref="region"
                    :geojson="regionJson"
                    :options-style="regionStyleFunc"
                    :options="regionOptions"
                />
                <LMarker
                    v-for="(name,index) in regionNames"
                    :key="index"
                    :lat-lng="name.center"
                    :options="name.options"
                >
                    <LIcon class-name="vx-china-map__region-name" :icon-size="[100,18]">
                        <div>{{name.html}}</div>
                    </LIcon>
                </LMarker>
            </LLayerGroup>
            <LControlScale :imperial="false" position="bottomleft"></LControlScale>
            <LControlZoom position="topleft" />
            <LControl :position="'topleft'">
                <div style="margin-left: 44px;margin-top: -60px;">
                    <Navi @go-region="goRegion" :items="items"></Navi>
                    <slot name="topleft-extra"></slot>
                </div>
            </LControl>
            <LControlAttribution position="bottomright" prefix="iTek-china" />
            <LControl position="topright">
                <slot name="info"></slot>
                <div @dblclick.stop class="layer_switch">
                    <Icon
                        @click="showLayerPanel = !showLayerPanel"
                        color="blue"
                        size="22"
                        type="md-globe"
                    />
                </div>
                <div :style="paneStyle" @dblclick.stop class="layer_panel" v-show="showLayerPanel">
                    <Icon @click="showLayerPanel=false" class="close" size="18" type="md-close" />
                    <h3 class>选择底图</h3>
                    <div class="layer-items">
                        <a
                            :class="{'active':mapClass==1}"
                            @click="setMapClass(1)"
                            href="javascript:void(0);"
                        >
                            <img :src="vec" />地图
                        </a>
                        <a
                            :class="{'active':mapClass==2}"
                            :style="styleSatellite"
                            @click="setMapClass(2)"
                            href="javascript:void(0);"
                        >
                            <img :src="sat" />影像
                        </a>
                        <a
                            :class="{'active':mapClass==3}"
                            @click="setMapClass(3)"
                            href="javascript:void(0);"
                            v-show="mapType==='天地图'"
                        >
                            <img :src="ter" />地形
                        </a>
                    </div>
                    <div class="map-type">
                        <RadioGroup
                            @on-change="changeMapType"
                            style="width: 100%; text-align: center;"
                            v-model="mapType"
                        >
                            <Radio label="谷歌"></Radio>
                            <Radio label="高德"></Radio>
                            <Radio label="天地图"></Radio>
                        </RadioGroup>
                    </div>
                </div>
            </LControl>
            <slot></slot>
        </LMap>
    </div>
</template>
<script type="text/javascript">
import 'leaflet/dist/leaflet.css'
import {
    LMap,
    LTileLayer,
    LGeoJson,
    LControlScale,
    LControlAttribution,
    LControlZoom,
    LControl,
    LMarker,
    LLayerGroup,
    LIcon
} from 'vue2-leaflet'

import PROVIDER from './provider'
import Navi from './navigator'
import vec from '@/assets/images/map/vec.jpg'
import ter from '@/assets/images/map/ter.jpg'
import sat from '@/assets/images/map/sat.jpg'
import _ from 'lodash'

export default {
    name: 'VxChinaMap',
    data() {
        return {
            provider: PROVIDER['高德1'],
            mapType: '高德',
            regionJson: [],
            mapClass: 1,
            mapOptions: {
                zoomControl: false,
                attributionControl: false,
                zoomSnap: true
            },
            center: L.latLng(38, 110),
            showLayerPanel: false,
            vec,
            ter,
            sat,
            items: []
        }
    },
    props: {
        /* 服务地址 */
        serverUrl: {
            type: String,
            default: 'http://localhost:8080/itek'
        }
    },
    components: {
        LMap,
        LTileLayer,
        LGeoJson,
        LControlScale,
        LControl,
        LControlAttribution,
        LControlZoom,
        LLayerGroup,
        LMarker,
        LIcon,
        Navi
    },
    computed: {
        regionOptions() {
            return {
                onEachFeature: this.onEachFeatureFunction
                // filter: feature => {
                //     if (!feature.properties.level) {
                //         //不显示中国底图 100000
                //         return false
                //     }

                //     // if (feature.properties.level === 'province') {
                //     //     return (
                //     //         feature.properties.adcode === '510000' ||
                //     //         feature.properties.name === '湖南省'
                //     //     )
                //     // } else {
                //     //     return true
                //     // }

                //     return true
                // }
            }
        },
        regionNames() {
            if (!this.regionJson.features) {
                return []
            }

            let regionNames = this.regionJson.features
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

            return regionNames
        },
        onEachFeatureFunction() {
            return (feature, layer) => {
                layer.on({
                    mouseover: this.overFeature,
                    mouseout: this.outFeature,
                    click: _.throttle(this.gotoFeature, 1000)
                })
            }
        },
        styleSatellite() {
            if (this.mapType === '天地图') {
                return {
                    margin: '0 16px'
                }
            } else {
                return {
                    'margin-left': '16px'
                }
            }
        },
        paneStyle() {
            if (this.mapType === '天地图') {
                return {
                    left: '-322px'
                }
            } else {
                return {
                    left: '-232px'
                }
            }
        }
    },
    methods: {
        changeMapType(mapType) {
            this.setMapClass(1)
        },
        setMapClass(clazz) {
            this.mapClass = clazz
            this.provider = PROVIDER[this.mapType + this.mapClass]
        },

        /* 跳转到指定区域 */
        goRegion(item) {
            this.showFeature(item.code, item.name, item.level)
        },

        /* 填充行政区划样式 */
        regionStyleFunc(feature) {
            return {
                weight: 1
            }
        },

        /* 初始化中国地图 */
        initMap() {
            this.showFeature('100000', '全国', 'country')
        },

        /*
         * 显示Feature
         */
        showFeature(code, name, level) {
            const url = `${this.serverUrl}/${code}_full.json`
            fetch(url).then(res => {
                res.json().then(json => {
                    this.regionJson = json

                    const index = this.items.findIndex(item => {
                        return item.code === code
                    })

                    let item
                    if (index === -1) {
                        item = {
                            code: code,
                            name: name,
                            level: level
                        }
                        this.items.push(item)
                    } else {
                        item = this.items[index]

                        // 删除指定项后面的元素
                        this.items.splice(index + 1)
                    }

                    this.$nextTick(_ => {
                        this.$refs.map.fitBounds(this.$refs.region.getBounds())
                    })

                    this.$emit('select-region', item)
                })
            })
        },

        /* 鼠标移到Feature上 */
        overFeature(e) {
            const layer = e.target
            layer.setStyle({
                weight: 3,
                fillOpacity: 0.8
            })

            const properties = layer.feature.properties
            this.$emit('over-region', {
                code: properties.adcode,
                name: properties.name,
                level: properties.level
            })
        },
        /* 鼠标离开Feature */
        outFeature(e) {
            this.$refs.region.mapObject.resetStyle(e.target)
        },
        /* 跳转Feature */
        gotoFeature(e) {
            const layer = e.target
            if (layer.feature.properties.level === 'district') {
                return
            }

            const adcode = layer.feature.properties.adcode
            const name = layer.feature.properties.name
            const level = layer.feature.properties.level

            this.showFeature(adcode, name, level)
        }
    },

    created() {
        this.initMap()
    }
}
</script>
<style lang="less">
.vx-china-map {
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;

    .leaflet-control-attribution {
        opacity: 0.5;
    }

    &__map {
        margin: 0;
        padding: 0;
        height: 100%;
        width: 100%;

        .layer_switch {
            position: absolute;
            top: 0;
            left: -40px;
            padding: 5px;
            background: #fff;
            cursor: pointer;
            background-color: #ffffff;
            box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
            border-radius: 4px;
            user-select: none;
        }
        .layer_panel {
            position: absolute;
            background: #fff;
            top: 0;
            box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
            border-radius: 4px;
            padding: 10px;
            display: block;
            user-select: none;

            i.close {
                float: right;
                cursor: pointer;
                opacity: 1;
            }

            h3 {
                margin: 0;
                padding-bottom: 4px;
                border-bottom: 1px solid #e1e1e1;
                font-size: 10px;
                font-weight: 700;
            }

            .layer-items {
                text-align: center;
                margin-top: 10px;

                a {
                    display: inline-block;
                    width: 74px;
                    text-align: center;
                    text-decoration: none;
                    padding-left: 0;
                    -webkit-box-shadow: none;
                    box-shadow: none;
                    color: #0078a8;
                }

                img {
                    width: 74px;
                    height: 54px;
                }

                a.active img {
                    border: 2px solid #4185d0;
                }
            }

            .map-type {
                margin: 2px 0 0 0;
                padding: 2px 0 0 0;
                border-top: 1px solid #e1e1e1;
                font-size: 13px;
            }
        }
    }

    &__region-name {
        text-align: center;
        font-weight: bold;
        color: #d84315;
        text-decoration: underline;
        pointer-events: none !important;
    }
}
</style>