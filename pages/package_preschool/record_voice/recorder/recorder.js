// pages/package_common/record_voice/recorder/recorder.js
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../../../utils/common_import'
var app = getApp()
Page({
  data: {
    title: '',
    navBarHeight: 0,
    dotX: 0, 
    isPlayingRecord: false, //是否播放录音
    isPlayingSource: false,  //是否播放原音
    currentProgressWidth: 0,
    players: {  // 播放控制属性
      record: {
        isPlaying: false,
        isPause: false,
        count: 0,
        currentProgressWidth: 0,
      },
      source: {
        isPlaying: false,
        isPause: false,
        count: 0,
        currentProgressWidth: 0,
      }
    },
    recordSource: null, //录制的资源
    voiceSource: null, //原声资源
    showToast: false, //通知弹窗
  },

  onLoad: function (options) {
    this.timer = {}
    this.longToast = new app.weToast()
    this.initViewInfo()
    this.initAudioContext()
    this.initRecorderManager()
    this.setData({
      showToast: storage.get('showRecordToast')
    })
  },

  initViewInfo: function () {
   try {
    var systemInfo = wx.getSystemInfoSync()
    var scale = 375 / 288 //默认宽度比  （总宽度 ／ 进度条宽度）
    this.setData({
      processWidth: systemInfo.screenWidth / scale,
      navBarHeight: 40 + systemInfo.statusBarHeight
    })
    
   } catch(err) {

   }
  },

  //初始化录音 
  initRecorderManager: function () {
    try {
      this.recorderManager = wx.getRecorderManager()
      this.isPause = false // 默认不是暂停状态
      this.recorderManager.onInterruptionBegin((res)=>{ //微信语音 微信视频触发中断回调
        console.log(res, '===触发暂停的：onInterruptionBegin====')
        this.recorderManager.pause() //手动暂停
        this.isPause = true //状态暂停
      })

      this.recorderManager.onStop((res)=>{
        this.playSource = res
        console.log(res, '===触发停止的：onStop====')
      })

      this.recorderManager.onError((errMsg)=>{
        console.log(errMsg, '===触发停止的：onError====')
        util.showError({message: errMsg})
      })
    } catch(err) {
      util.showError({message: err})
    }
  },

  // 初始化播放器
  initAudioContext: function () {
    this.audioCtx = wx.createInnerAudioContext()

    this.audioCtx.onPlay(function(res) {
      console.log(res, '监听了播放')
    })

    this.audioCtx.onPause(function(res) {
      console.log(res, '监听了暂停')
    })

    this.audioCtx.onError(function(err) {
      console.log(err, '监听了错误')
    })
  },

  onShow: function () {
    if (this.isPause) { //发生暂停
      wx.showModal({
        title: '提示',
        content: '录音发生暂停是否继续？',
        confirmColor: '#FFDC5E',
        success: (res)=> {
          if (res.confirm) {
            this.recorderManager.resume() //继续进行录音
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  recordVoice: function () {
    this.clearEvent()
    this.clearPlayers()
    if (this.data.isRecording) {
      return this.stopRecord()
    }
    this.getSetting().then(()=>{
      this.setData({
        isRecording: true
      })
      this.recorderManager.start({
        duration: 600000
      })
    })
  },

  stopRecord: function () {
    this.setData({
      isRecording: false
    })
    this.recorderManager.stop() //停止录音
  },
  
  getSetting: function () {
    var scope = 'scope.record'
    return new Promise((resolve, reject)=>{
      wx.getSetting({
        success: (res)=>{
          if (res.authSetting[scope] == false) { //scope 存在 但是拒绝了授权
            wx.openSetting({
              success: (res)=>{
                if (res.authSetting[scope]) {
                  resolve()
                }
              }
            })
          } else if (!res.authSetting[scope]) { //不存在scope 提前授权scope
            wx.authorize({
              scope: scope,
              success: ()=> {
                resolve()
              },
              fail: () => {
                wx.openSetting({
                  success: (res)=>{
                    if (res.authSetting[scope]) {
                      resolve()
                    }
                  }
                })
              }
            })
          } else { //授权成功
            resolve()
          }
        }
      })
    })
    
  },

  // 播放录制
  startPlayRecord: function () {
    this.audioCtx.src = this.data.recordSource.tempFilePath
    console.log(this.audioCtx,'==this.audioCtx==')
    this.onPlayer({
      key: 'record',
      btnState: 'isPlayingRecord'
    })

  },

  // 播放原声
  startPlayVoice: function () {
    this.onPlayer({
      key: 'source',
      btnState: 'isPlayingSource' 
    })
  },

  // 清除定时进度器
  clearEvent: function () {
    this.timer && Object.keys(this.timer).forEach(currentKey=>{ //清空所有定时服务
      clearInterval(this.timer[currentKey])
      this.timer[currentKey] = null
    })
  },

  // 初始化当前控制信息
  clearPlayers: function () {
    this.state && this.setData({
      [`players.${this.state.key}`]: {
        isPlaying: false,
        isPause: false,
        count: 0,
        currentProgressWidth: 0
      },
      currentProgressWidth: 0,
      dotX: 0,
      [this.state.btnState]: false
    })
  },

  //监听播放状态 
  onPlayer: co.wrap(function *(state) {
    var player = this.data.players[state.key]
    // 判断是否切换了播放类型  原声播放 || 同音录制播放 判断队列中是否存在一个播放 
    if (Object.keys(this.timer).some(stateKey=>  stateKey != state.key && this.timer[stateKey])) {
      this.clearEvent()
      this.clearPlayers()
    }

    if (this.state && this.state.key != state.key) {
      this.clearPlayers()
    }
 
    this.state = state //存下默认标志对象

    if (!player.isPause && player.isPlaying) {  //正在播放中
      this.setData({
        [`players.${state.key}.isPause`]: true
      })
      this.audioCtx && this.audioCtx.pause()
      console.log('暂停播放')

    } else if (player.isPause) { //暂停状态
      this.setData({
        [`players.${state.key}.isPause`]: false
      })
      this.audioCtx && this.audioCtx.play()
      console.log('接着播放')
    } else { //首次播放
      this.setData({
        [`players.${state.key}.isPlaying`]: true
      })
      this.audioCtx && this.audioCtx.play()
      console.log('开始播放')
    }

    this.setData({
      [state.btnState]: !this.data.players[state.key].isPause && this.data.players[state.key].isPlaying
    })
    this.computedProgress(state.key, 17, ()=>{
      this.setData({
        [state.btnState]: false,
        [`players.${state.key}.isPlaying`]: false,
        [`players.${state.key}.isPause`]: false,
        [`players.${state.key}.count`]: 0,
      })
    })
  }),

  computedProgress: function (key, totalTime, callSuccessBack) {
    var currentPlay = this.data.players[key]

    if (this.timer[key]) {
       clearInterval(this.timer[key])
      this.timer[key] = null
      return
    }

    this.timer[key] = setInterval(()=>{
      if (currentPlay.count >= totalTime) {
        this.setData({
          currentProgressWidth: 0,
          dotX: 0
        })
        clearInterval(this.timer[key])
        this.timer[key] = null
        return callSuccessBack()
      }
      
      this.data.players[key].count+=1
      this.setData({
        currentProgressWidth:  (this.data.processWidth / totalTime) * this.data.players[key].count,
        dotX: ((this.data.processWidth / totalTime) * this.data.players[key].count ) - 10
      })
    }, 1000)
   
  },

  // 通知弹窗
  receivedInform: function () {
    this.setData({
      showToast: false
    })
    storage.put('showRecordToast', true)
  },

  onHide: function () {
    this.recorderManager.pause() //暂停录音
  },

  onShareAppMessage: function () {

  }
})