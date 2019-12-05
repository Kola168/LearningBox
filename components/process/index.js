// components/process/index.js
const _ = require('../../lib/underscore/we-underscore')

Component({

  properties: {
    completeCount: {
      type: Number,
      observer: function(newVal, oldVal) {
        console.log(newVal)
        if (_.isEqual(newVal, oldVal)) {
          return
        }
        if (_.isNotEmpty(newVal)) {
          this.setData({
            completeCount: newVal
          })
        }
      }
    },
    count: {
      type: Number,
      observer: function(newVal, oldVal) {
        console.log(newVal)
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
        console.log(newVal)
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
        console.log(newVal)
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
    cancelprocess:function(){
      this.triggerEvent('cancelprocess')
    },
  }
})
