// components/process/index.js
const _ = require('../../lib/underscore/we-underscore')

Component({
  observers: {
    'completeCount, count, percent': function() {
      // 在 numberA 或者 numberB 被设置时，执行这个函数
      this.setData({
        errTip: ''
      })
    }
  },
  properties: {
    completeCount: {
      type: Number,
      observer: function(newVal, oldVal) {
        if (_.isEqual(newVal, oldVal)) {
          return
        }
        if (_.isNotEmpty(newVal)) {
          if(newVal>this.data.count){
            return
          }
          this.setData({
            completeCount: newVal
          })
        }
      }
    },
    count: {
      type: Number,
      observer: function(newVal, oldVal) {
        if (_.isEqual(newVal, oldVal)) {
          return
        }
        if (_.isNotEmpty(newVal)) {
          this.setData({
            count: newVal
          })
        }
      }
    },
    percent: {
      type: Number,
      observer: function(newVal, oldVal) {
        if (_.isNotEmpty(newVal)) {
          this.setData({
            percent: newVal
          })
        }
      }
    },
    errTip: {
      type: String,
      observer: function(newVal, oldVal) {
        if (_.isNotEmpty(newVal)) {
          this.setData({
            errTip: newVal
          })
        }
      }
    },
  },

  data: {
    showModal: false,
    completeCount: null,
    count: null,
    percent: 0,
    errTip: '',
  },

  methods: {
    cancelprocess: function() {
      this.triggerEvent('cancelprocess')
    },
  }
})
