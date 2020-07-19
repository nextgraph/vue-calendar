<template>
    <div class="_vx-map-navi" v-if="items.length > 0">
        <template v-for="(item, index) in items">
            <a
                class="_vx-map-navi__button"
                @click.stop="go(item)"
                :key="index"
                :disabled="isLast(index)"
            >{{item.name}}</a>
            <span class="_vx-map-navi__seperator" :key="'A' + index" v-if="!isLast(index)">></span>
        </template>
    </div>
</template>
<script>
export default {
    name: 'IVxMapNavi',
    props: {
        items: {
            type: Array,
            default: () => {
                return []
            }
        }
    },
    methods: {
        isLast(index) {
            return index === this.items.length - 1
        },
        go(item) {
            this.$emit('go-region', item)
        }
    }
}
</script>

<style lang="less" scoped>
._vx-map-navi {
    background-color: #ffffff;
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.65);
    border-radius: 4px;
    padding: 6px 10px;
    user-select: none;

    &__button {
        margin: 4px;
    }

    &__seperator {
        margin: 0 8px;
        color: #dcdee2;
        font-size: 14px;
    }
}
</style>