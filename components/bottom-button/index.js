// components/bottom-button/index.js
const app = getApp()

Component({

  properties: {
    textLeft: {
      type: String,
      observer: function(newval) {
        this.setData({
          textLeft: newval
        })
      }
    },
    textRight: {
      type: String,
      observer: function(newval) {
        this.setData({
          textRight: newval
        })
      }
    },
  },

  attached:function() {
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    }else if(app.isFullScreen==undefined){
      let that=this
      setTimeout(function(){
        that.setData({
          butHigh: app.isFullScreen
        })
      },500)

    }
  },

  data: {
    textLeft: '',
    textRight: '',
    butHigh:false, //是否全面屏
  },

  methods: {
    leftTap: function() {
      this.triggerEvent('lefttap')
    },
    rightTap: function() {
      this.triggerEvent('righttap')
    }
  }
})
