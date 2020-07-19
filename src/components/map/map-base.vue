<template>
    <div class="vx-map">
        <LMap :center="center" :options="mapOptions" :zoom="zoom" class="map" ref="map">
            <LTileLayer :minZoom="4" :subdomains="provider.Subdomains" :url="provider.layer1"></LTileLayer>
            <LTileLayer
                :minZoom="4"
                :subdomains="provider.Subdomains"
                :url="provider.layer2"
                v-if="provider.layer2"
            ></LTileLayer>
            <LControlScale :imperial="false" position="bottomleft"></LControlScale>
            <LControlZoom position="topleft" />
            <LControl :position="'topleft'">
                <div style="margin-left: 44px;margin-top: -74px;">
                    <slot name="topleft-extra"></slot>
                </div>
            </LControl>
            <LControlAttribution position="bottomright" prefix="iTek-china" />
            <slot></slot>
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
        </LMap>
    </div>
</template>
<script type="text/javascript">
import 'leaflet/dist/leaflet.css'
import {
    LMap,
    LTileLayer,
    LControlScale,
    LControlAttribution,
    LControlZoom,
    LControl
} from 'vue2-leaflet'

import PROVIDER from './provider'
import vec from '@/assets/images/map/vec.jpg'
import ter from '@/assets/images/map/ter.jpg'
import sat from '@/assets/images/map/sat.jpg'
export default {
    name: 'VxMap',
    data() {
        return {
            provider: '',
            mapType: '谷歌',
            mapClass: 1,
            mapOptions: {
                zoomControl: false,
                attributionControl: false,
                zoomSnap: true
            },
            zoom: 4,
            center: L.latLng(38, 110),
            showLayerPanel: false,
            vec,
            ter,
            sat
        }
    },
    components: {
        LMap,
        LTileLayer,
        LControlScale,
        LControl,
        LControlAttribution,
        LControlZoom
    },
    computed: {
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
        resetLayerStyle(layer) {
            this.$refs.map.mapObject.resetStyle(layer)
        },
        fitBounds(bounds){
            this.$refs.map.mapObject.fitBounds(bounds)
        }
    },

    created() {
        this.provider = PROVIDER['高德1']
        this.mapType = '高德'
    }
}
</script>
<style lang="less">
.vx-map {
    padding: 0;
    margin: 0;
    height: 100%;
    width: 100%;
    // position: relative;
    // overflow: hidden;

    .map {
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
            -webkit-box-shadow: rgba(0, 0, 0, 0.2) 0 2px 4px,
                rgba(0, 0, 0, 0.02) 0 -1px 0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2),
                0 -1px 0 rgba(0, 0, 0, 0.02);
            border-radius: 4px;
        }
        .layer_panel {
            position: absolute;
            background: #fff;
            top: 0;
            border-radius: 4px;
            padding: 10px;
            display: block;

            i.close {
                float: right;
                display: inline-block;
                cursor: pointer;
                opacity: 1;
            }

            h3 {
                margin: 0;
                padding-bottom: 4px;
                border-bottom: 1px solid #e1e1e1;
                font-size: 14px;
                font-weight: 700;
            }

            .layer-items {
                margin-top: 10px;
                text-align: center;

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
                margin: 10px 0 0 0;
                padding: 10px 0 0 0;
                border-top: 1px solid #e1e1e1;
                font-size: 14px;
            }
        }
    }
}
</style>