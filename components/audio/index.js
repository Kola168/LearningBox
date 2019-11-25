/**
 * audio组件
 *
 * 组件属性列表
 * @param {Boolean} autoplay               是否自动播放，默认:false
 * @param {String} audioUrl                音频地址 required
 * @param	{String} audioType               组件类型 可选项：circle,controls 默认:circle
 * @param {Number} circleSize              circle类型 播放按钮大小 默认:50px
 * @param	{Number} blockSize               controls类型，滑块大小 默认:15
 * @param	{String} sliderBackgroundColor   进度条背景颜色，默认:#eaeaea
 * @param	{String} sliderActiveColor       controls类型，默认:#ffe27a
 * @param	{String} sliderBlockColor        controls类型，默认:#ffe27a
 *
 */

Component({
  properties: {
    autoplay: {
      type: Boolean,
      value: false
    },
    audioUrl: {
      type: String,
      value: ''
    },
    audioType: {
      type: String,
      value: 'circle'
    },
    circleSize: {
      type: Number,
      value: 50
    },
    blockSize: {
      type: Number,
      value: 15
    },
    sliderBackgroundColor: {
      type: String,
      value: '#eaeaea'
    },
    sliderActiveColor: {
      type: String,
      value: '#ffe27a'
    },
    sliderBlockColor: {
      type: String,
      value: '#ffe27a'
    }
  },
  data: {
    progressMax: 0,
    progressValue: 0,
    allTime: 0,
    currentTime: 0,
    isPlay: false
  },
  ready() {
    this.isEnd = false
    try {
      let innerAudioContext = wx.createInnerAudioContext()
      this.innerAudioContext = innerAudioContext
      innerAudioContext.autoplay = this.data.autoplay
      innerAudioContext.src = this.data.audioUrl

      // innerAudioContext.onCanplay(() => {
      //   wx.hideLoading()
      // })

      innerAudioContext.onPlay(() => {
        this.setData({
          isPlay: true
        })
      })
      innerAudioContext.onPause(() => {
        this.setData({
          isPlay: false
        })
      })
      innerAudioContext.onSeeked(() => {
        if (!this.isEnd) {
          innerAudioContext.pause()
          innerAudioContext.play()
        }
      })
      innerAudioContext.onError((e) => {
        let title = ""
        switch (e.errCode) {
          case 10001:
            title = "系统错误"
            break;
          case 10002:
            title = "网络错误"
            break;
          case 10003:
            title = "文件错误"
            break;
          case 10004:
            title = "格式错误"
            break;
          default:
            title = "未知错误"
            break;
        }
        wx.showToast({
          title: title,
          icon: 'none'
        })
      })
      innerAudioContext.onEnded(() => {
          this.isEnd = true
          this.setData({
            isPlay: false
          })
        })
        // 更新进度条和播放时间
      innerAudioContext.onTimeUpdate(() => {
        let progressValue = innerAudioContext.currentTime
        let currentTime = this.formatTime(innerAudioContext.currentTime)
        let isCircle = this.data.audioType === 'circle' ? true : false
        if (!this.data.allTime) {
          let allDuration = innerAudioContext.duration
          let allTime = this.formatTime(allDuration)

          if (isCircle) {
            this.draw(allDuration, progressValue)
          } else {
            this.setData({
              progressMax: innerAudioContext.duration,
              allTime: allTime,
              progressValue: progressValue,
              currentTime: currentTime
            })
          }
        } else {
          if (isCircle) {
            this.draw(allDuration, progressValue)
          } else {
            this.setData({
              progressValue: progressValue,
              currentTime: currentTime
            })
          }
        }
      })
    } catch (e) {
      console.log(e)
      // wx.hideLoading()
    }
  },
  methods: {
    draw(all, cur) {
      let circleRadius = this.data.circleSize / 2;
      let ctx = wx.createCanvasContext('audioCanvas', this)
      let startAngle = 3 / 2 * Math.PI; //开始位置弧度
      let diffAngle = cur / all * Math.PI * 2; //完成进度弧度值
      ctx.beginPath();
      ctx.arc(circleRadius, circleRadius, circleRadius - 2, startAngle, diffAngle + startAngle, false);
      ctx.setLineWidth(4);
      ctx.setStrokeStyle('#fff');
      ctx.stroke();
      ctx.draw()
    },
    timeSliderChanging(e) {
      this.innerAudioContext.pause()
    },
    timeSliderChanged(e) {
      this.isEnd = false
      setTimeout(() => {
        this.setData({
          progressValue: e.detail.value
        })
        this.innerAudioContext.seek(e.detail.value)
      }, 300)
    },
    formatTime(time) {
      let min = Math.floor(time / 60),
        sec = Math.ceil(time % 60)
      if (min < 10) {
        if (min == 0) {
          min = '00'
        } else {
          min = '0' + min
        }
      }
      if (sec < 10) {
        if (sec == 0) {
          sec = '00'
        } else {
          sec = '0' + sec
        }
      }
      return min + ':' + sec
    },

    playAudio() {
      if (this.data.isPlay) {
        this.innerAudioContext.pause()
      } else {
        this.innerAudioContext.play()
      }
    },
    // 前进30s
    forward() {
      if (!this.isEnd) {
        let tempValue = this.data.progressValue + 30
        if (tempValue >= this.data.progressMax) {
          tempValue = this.data.progressMax
          let currentTime = this.formatTime(this.data.progressMax)
          this.setData({
            isPlay: false,
            currentTime: currentTime
          })
          this.isEnd = true
          this.innerAudioContext.stop()
        } else {
          this.isEnd = false
          this.innerAudioContext.seek(tempValue)
        }
        this.setData({
          progressValue: tempValue
        })
      } else {
        this.isEnd = false
        this.innerAudioContext.play()
      }
    },
    // 后退30s
    back() {
      let tempValue = this.data.progressValue - 30
      if (tempValue <= 0) {
        tempValue = 0
      }
      this.setData({
        progressValue: tempValue
      })
      this.isEnd = false
      this.innerAudioContext.seek(tempValue)
    }
  }
})