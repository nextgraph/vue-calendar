<template>
    <div class="full-calendar-body">
        <div class="weeks">
            <strong class="week" v-for="week in weekNames">{{week}}</strong>
        </div>
        <div class="dates" ref="dates">
            <div class="dates-bg">
                <div class="week-row" v-for="week in currentDates">
                    <div
                        :class="{'today' : day.isToday,
              'not-cur-month' : !day.isCurMonth}"
                        :key="'day_'+index"
                        class="day-cell"
                        v-for="(day, index) in week"
                    >
                        <p
                            :class="{'currDayClick': handleBg(day.date),'disableDay': handleDisableDay(day.date)}"
                            class="day-number"
                        >{{day.monthDay}}</p>
                    </div>
                </div>
            </div>

            <!-- absolute so we can make dynamic td -->
            <div class="dates-events">
                <div class="events-week" v-for="week in currentDates">
                    <div
                        :class="{'today' : day.isToday,
              'not-cur-month' : !day.isCurMonth}"
                        @click.stop="dayClick(day.date, day, $event)"
                        class="events-day"
                        track-by="$index"
                        v-for="day in week"
                    >
                        <p class="day-number">{{day.monthDay}}</p>
                        <div class="event-box">
                            <p
                                :class="[classNames(event.cssClass), {
                  'is-start'   : isStart(event.start, day.date),
                  'is-end'     : isEnd(event.end,day.date),
                  'is-opacity' : !event.isShow
                  }]"
                                @click="eventClick(event,$event)"
                                class="event-item"
                                v-for="event in day.events"
                                v-show="event.isShow && event.cellIndex <= eventLimit"
                            >{{isBegin(event, day.date, day.weekDay)}}</p>
                            <p
                                @click.stop="selectThisDay(day, $event)"
                                class="more-link"
                                v-if="day.events.length > eventLimit"
                            >+ {{day.events[day.events.length -1].cellIndex - eventLimit}} more</p>
                        </div>
                    </div>
                </div>
            </div>

            <!-- full events when click show more -->
            <div
                :style="{left: morePos.left + 'px', top: morePos.top + 'px'}"
                class="more-events"
                v-show="showMore"
            >
                <div class="more-header">
                    <span class="title">{{moreTitle(selectDay.date)}}</span>
                    <span @click.stop="showMore = false" class="close">x</span>
                </div>
                <div class="more-body">
                    <ul class="body-list">
                        <li
                            @click="eventClick(event,$event)"
                            class="body-item"
                            v-for="event in selectDay.events"
                            v-show="event.isShow"
                        >{{event.title}}</li>
                    </ul>
                </div>
            </div>

            <slot name="body-card"></slot>
        </div>
    </div>
</template>
<script type="text/babel">
import dateFunc from './dateFunc'
import dayjs from 'dayjs'

export default {
    inject: ['isDisableDay'],
    props: {
        currentDate: {},
        events: {},
        weekNames: {
            type: Array,
            default() {
                return []
            }
        },
        monthNames: {},
        firstDay: {}
    },
    created() {
        this.events.forEach((item, index) => {
            item._id = item.id || index
            item.end = item.end || item.start
        })
        // this.events = events
    },
    data() {
        return {
            // weekNames : DAY_NAMES,
            weekMask: [1, 2, 3, 4, 5, 6, 7],
            // events : [],
            isLismit: true,
            eventLimit: 3,
            showMore: false,
            morePos: {
                top: 0,
                left: 0
            },
            selectDay: {},
            clickCache: []
        }
    },
    watch: {
        weekNames(val) {
            console.log('watch weekNames', val)
        }
    },
    computed: {
        currentDates() {
            return this.getCalendar()
        }
    },
    methods: {
        isBegin(event, date, index) {
            let st = new Date(event.start)

            if (index == 0 || st.toDateString() == date.toDateString()) {
                return event.title
            }
            return '　'
        },
        moreTitle(date) {
            let dt = new Date(date)
            return (
                this.weekNames[dt.getDay()] +
                ', ' +
                this.monthNames[dt.getMonth()] +
                dt.getDate()
            )
        },
        classNames(cssClass) {
            if (!cssClass) return ''
            // string
            if (typeof cssClass == 'string') return cssClass

            // Array
            if (Array.isArray(cssClass)) return cssClass.join(' ')

            // else
            return ''
        },
        getCalendar() {
            // calculate 2d-array of each month
            // first day of this month
            let now = new Date() // today
            let current = new Date(this.currentDate)

            let startDate = dateFunc.getStartDate(current) // 1st day of this month

            let curWeekDay = startDate.getDay()

            // begin date of this table may be some day of last month
            let diff = parseInt(this.firstDay) - curWeekDay
            diff = diff > 0 ? diff - 7 : diff

            startDate.setDate(startDate.getDate() + diff)
            let calendar = []

            for (let perWeek = 0; perWeek < 6; perWeek++) {
                let week = []

                for (let perDay = 0; perDay < 7; perDay++) {
                    week.push({
                        monthDay: startDate.getDate(),
                        isToday: now.toDateString() == startDate.toDateString(),
                        isCurMonth: startDate.getMonth() == current.getMonth(),
                        weekDay: perDay,
                        date: new Date(startDate),
                        events: this.slotEvents(startDate)
                    })

                    startDate.setDate(startDate.getDate() + 1)
                    // if (startDate.toDateString() == endDate.toDateString()) {
                    //   isFinal = true
                    //   break
                    // }
                }
                calendar.push(week)
                // if (isFinal) break
            }
            return calendar
        },
        slotEvents(date) {
            // find all events start from this date
            let cellIndexArr = []
            let thisDayEvents = this.events.filter(day => {
                let dt = new Date(day.start)
                let st = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate())
                let ed = day.end ? new Date(day.end) : st
                // console.log('slotEvt', st, ed, date)
                return date >= st && date <= ed
            })

            // sort by duration
            thisDayEvents.sort((a, b) => {
                if (!a.cellIndex) return 1
                if (!b.cellIndex) return -1
                return a.cellIndex - b.cellIndex
            })

            // mark cellIndex and place holder
            for (let i = 0; i < thisDayEvents.length; i++) {
                thisDayEvents[i].cellIndex = thisDayEvents[i].cellIndex || i + 1

                if (thisDayEvents[i].title === '') {
                    thisDayEvents[i].isShow = false
                } else {
                    thisDayEvents[i].isShow = true
                }

                if (thisDayEvents[i].cellIndex == i + 1 || i > 2) continue
                thisDayEvents.splice(i, 0, {
                    title: 'holder',
                    cellIndex: i + 1,
                    start: dateFunc.format(date, 'yyyy-MM-dd'),
                    end: dateFunc.format(date, 'yyyy-MM-dd'),
                    isShow: false
                })
            }

            // console.log(thisDayEvents)
            return thisDayEvents
        },
        isStart(eventDate, date) {
            let st = new Date(eventDate)
            return st.toDateString() == date.toDateString()
        },
        isEnd(eventDate, date) {
            let ed = new Date(eventDate)
            return ed.toDateString() == date.toDateString()
        },
        selectThisDay(day, jsEvent) {
            this.selectDay = day
            this.showMore = true
            this.morePos = this.computePos(event.target)
            this.morePos.top -= 100
            let events = day.events.filter(item => {
                return item.isShow == true
            })
            this.$emit('moreclick', day.date, events, jsEvent)
        },
        computePos(target) {
            let eventRect = target.getBoundingClientRect()
            let pageRect = this.$refs.dates.getBoundingClientRect()
            return {
                left: eventRect.left - pageRect.left,
                top: eventRect.top + eventRect.height - pageRect.top
            }
        },
        dayClick(day, item, jsEvent) {
            if (this.isDisableDay(day)) {
                this.$Message.error(
                    `日期"${dayjs(day).format('YYYY-MM-DD')}"不可编辑`
                )
                return
            }

            let date = dayjs(day).format('YYYY-MM-DD')
            if (this.clickCache.includes(date)) {
                let index = this.clickCache.findIndex(ele => ele === date)
                this.clickCache.splice(index, 1)
            } else {
                this.clickCache.push(date)
            }

            this.$emit('dayclick', day, jsEvent)
        },
        handleBg(day) {
            let date = dayjs(day).format('YYYY-MM-DD')
            return this.clickCache.includes(date)
        },
        handleDisableDay(day) {
            return this.isDisableDay(day)
        },
        eventClick(event, jsEvent) {
            if (!event.isShow) {
                return
            }

            jsEvent.stopPropagation()

            if (!this.isDisableDay(event.start)) {
                let pos = this.computePos(jsEvent.target)
                this.$emit('eventclick', event, jsEvent, pos)
            }
        }
    }
}
</script>
<style lang="less">
.full-calendar-body {
    margin-top: 20px;
    .currDayClick {
        background: #0090fe;
        color: #fff;
    }
    .disableDay {
        background: #e8e8e8;
    }
    .weeks {
        display: flex;
        border-top: 1px solid #e0e0e0;
        border-bottom: 1px solid #e0e0e0;
        border-left: 1px solid #e0e0e0;
        .week {
            flex: 1;
            text-align: center;
            border-right: 1px solid #e0e0e0;
        }
    }
    .dates {
        position: relative;
        .week-row {
            // width: 100%;
            // position:absolute;
            border-left: 1px solid #e0e0e0;
            display: flex;
            .day-cell {
                flex: 1;
                min-height: 50px;
                padding: 4px;
                border-right: 1px solid #e0e0e0;
                border-bottom: 1px solid #e0e0e0;
                .day-number {
                    text-align: center;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    margin: 0 auto;
                    line-height: 30px;
                }
                &.today {
                    background-color: #fcf8e3;
                }
                &.not-cur-month {
                    .day-number {
                        color: rgba(0, 0, 0, 0.24);
                    }
                }
            }
        }
        .dates-events {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
            width: 100%;
            .events-week {
                display: flex;
                .events-day {
                    cursor: pointer;
                    flex: 1;
                    min-height: 59px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    .day-number {
                        text-align: center;
                        padding: 4px 5px 4px 4px;
                        width: 30px;
                        height: 30px;
                        border-radius: 50%;
                        opacity: 0;
                        margin: 0 auto;
                        line-height: 30px;
                    }
                    &.not-cur-month {
                        .day-number {
                            color: rgba(0, 0, 0, 0.24);
                        }
                    }
                    .event-box {
                        .event-item {
                            cursor: pointer;
                            font-size: 12px;
                            /*background-color: #c7e6fd;*/
                            margin-bottom: 2px;
                            color: rgba(0, 0, 0, 0.87);
                            padding: 0 0 0 4px;
                            height: 18px;
                            line-height: 18px;
                            white-space: nowrap;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            &.is-start {
                                margin-left: 4px;
                                // border-top-left-radius:4px;
                                // border-bottom-left-radius:4px;
                            }
                            &.is-end {
                                margin-right: 4px;
                                // border-top-right-radius:4px;
                                // border-bottom-right-radius:4px;
                            }
                            &.is-opacity {
                                opacity: 0;
                            }
                        }
                        .more-link {
                            cursor: pointer;
                            // text-align: right;
                            padding-left: 8px;
                            padding-right: 2px;
                            color: rgba(0, 0, 0, 0.38);
                            font-size: 14px;
                        }
                    }
                }
            }
        }
        .more-events {
            position: absolute;
            width: 150px;
            z-index: 2;
            border: 1px solid #eee;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
            .more-header {
                background-color: #eee;
                padding: 5px;
                display: flex;
                align-items: center;
                font-size: 14px;
                .title {
                    flex: 1;
                }
                .close {
                    margin-right: 2px;
                    cursor: pointer;
                    font-size: 16px;
                }
            }
            .more-body {
                height: 140px;
                overflow: hidden;
                .body-list {
                    height: 120px;
                    padding: 5px;
                    overflow: auto;
                    background-color: #fff;
                    .body-item {
                        cursor: pointer;
                        font-size: 12px;
                        background-color: #c7e6fd;
                        margin-bottom: 2px;
                        color: rgba(0, 0, 0, 0.87);
                        padding: 0 0 0 4px;
                        height: 18px;
                        line-height: 18px;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }
                }
            }
        }
    }
}
</style>
