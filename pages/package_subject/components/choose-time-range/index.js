// pages/package_subject/components/choose-time-range/index.js

import config from './config'
import computedTime from './computedTime'
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    timeRange: {
      type: Object,
      value: {
        appoint: [config.appointList.yesterday.key],
        dayRange: [1,2,3]
      }
    }
  },

  data: {
    startDate: '',
    endDate: '',
    currentIndex: 0,
  },

  attached: function() {
    this.initConfig()
  },

  methods: {
    initConfig: function() {
      var btnList = []
      var timeRange = this.data.timeRange
      var appoint = timeRange.appoint
      var dayRange = timeRange.dayRange
      // 初始化指定点的日期
      if (appoint && appoint.length) {
        appoint.forEach(key=> {
          var current = config.appointList[key]
          if (current) {
            btnList.push({
              name: current.name,
              ...computedTime.getAssignDate(current.key)
            })
          }
        })
      }
      // 初始化指定范围的日期
      if (dayRange && dayRange.length) {
        dayRange.forEach(range=> {
          btnList.push({
            name: range + '日内',
            ...computedTime.getCurrentDayToDayFn(range)
          })
        })
      }
      var [selected] = btnList
      this.setData({
        btnList,
        startDate: selected && selected.startDate,
        endDate: selected && selected.endDate
      })
    },

    checkDate: function({currentTarget: {dataset: {index}}}) {
      var currentDate = this.data.btnList[index]
      this.setData({
        startDate: currentDate.startDate,
        endDate: currentDate.endDate,
        currentIndex: index,
      })
    },
    /**
     * 选择开始时间
     * @param {*} e 
     */
    chooseStartDate: function(e){
      this.setData({
        startDate: e.detail.value
      })
    },

    /**
     * 选择结束时间
     * @param {*} e 
     */
    chooseEndDate: function(e) {
      this.setData({
        endDate: e.detail.value
      })
    },

    /**
     * 提交
     */
    submit: function() {
      this.triggerEvent('chooseDate', {
        startDate: this.data.startDate,
        endDate: this.data.endDate
      })
    }
  }
})
