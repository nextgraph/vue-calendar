<template>
    <div class="full-calendar-header">
        <div class="header-left">
            <slot name="header-left"></slot>
        </div>
        <div class="header-center">
<!--            <span class="prev-month" @click.stop="goPrev">{{leftArrow}}</span>-->
            <span class="title">{{title}}</span>
<!--            <span class="next-month" @click.stop="goNext">{{rightArrow}}</span>-->
        </div>
        <div class="header-right">
            <slot name="header-right"></slot>
        </div>
    </div>
</template>
<script type="text/babel">
import dateFunc from './dateFunc'
import dayjs from 'dayjs'

export default {
    created() {
        console.log(this.currentMonth + '-02')
        console.log(dayjs(this.currentMonth + '-02').month() ,dayjs().month())
        this.dispatchEvent()
    },
    props: {
        currentMonth: '',
        currentDate: {},
        titleFormat: {},
        firstDay: {},
        monthNames: {},
        canChangeMonth: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            title: '',
            leftArrow: '<',
            rightArrow: '>',
            headDate: this.changeMonth(this.currentMonth, dayjs(this.currentMonth + '-02').month() - dayjs().month())
        }
    },
    watch: {
        currentDate(val) {
            if (!val) return
            this.headDate = val
            console.log('currentDate', val)
        }
    },

    methods: {
        // goPrev() {
        //     if (!this.canChangeMonth) return
        //     this.headDate = this.changeMonth(this.headDate, -1)
        //     this.dispatchEvent()
        // },
        // goNext() {
        //     if (!this.canChangeMonth) return
        //     this.headDate = this.changeMonth(this.headDate, 1)
        //     this.dispatchEvent()
        // },
        changeMonth(date) {
            return dayjs(date).add(0, 'month').toDate()
        },
        dispatchEvent() {
            this.title = dateFunc.format(
                this.headDate,
                this.titleFormat,
                this.monthNames
            )

            let startDate = dateFunc.getStartDate(this.headDate)
            let curWeekDay = startDate.getDay()

            // 1st day of this monthView
            let diff = parseInt(this.firstDay) - curWeekDay
            if (diff) diff -= 7
            startDate.setDate(startDate.getDate() + diff)

            // the month view is 6*7
            let endDate = dateFunc.changeDay(startDate, 41)

            // 1st day of current month
            let currentDate = dateFunc.getStartDate(this.headDate)

            this.$emit(
                'change',
                dateFunc.format(startDate, 'yyyy-MM-dd'),
                dateFunc.format(endDate, 'yyyy-MM-dd'),
                dateFunc.format(currentDate, 'yyyy-MM-dd'),
                this.headDate
            )
        }
    }
}
</script>
<style lang="less">
.full-calendar-header {
    display: flex;
    align-items: center;
    .header-left,
    .header-right {
        flex: 1;
    }
    .header-center {
        flex: 3;
        text-align: center;
        .title {
            margin: 0 10px;
        }
        .prev-month,
        .next-month {
            cursor: pointer;
        }
    }
}
</style>
