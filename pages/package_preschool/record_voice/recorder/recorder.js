// pages/package_common/record_voice/recorder/recorder.js
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../../../utils/common_import'
var app = getApp()
import Logger from '../../../../utils/logger.js'
const logger = new Logger.getLogger('pages/package_preschool/record_voice/recorder/recorder')
Page({
  data: {
    title: '',
    navBarHeight: 0,
    dotX: 0, 
    isPlaying: false,  //是否播放
    currentProgressWidth: 0,
    totalTime: 0, //总播放时长
    curryTime: 0, //当前播放进度时长
    usedTimeStamp: 0,//当前播放进度时长
    players: {  // 播放控制属性
      record: {
        isPlaying: false,
        isPause: false,
        audioCtx: null,
        currentProgressWidth: 0,
        src:'http://up_mp4.t57.cn/2018/1/03m/13/396131226156.m4a',
      },
      source: {
        isPlaying: false,
        isPause: false,
        count: 0,
        audioCtx: null,
        currentProgressWidth: 0,
        src:'http://up_mp4.t57.cn/2018/1/03m/13/396131232171.m4a'
      }
    },
    recordSource: [1,2], //录制的资源
    voiceSource: null, //原声资源
    showToast: false, //通知弹窗
  },

  onLoad: function (options) {
    this.timer = {}
    this.longToast = new app.weToast()
    this.initViewInfo()
    this.initRecorderManager()
    this.setData({
      showToast: storage.get('showRecordToast')
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

  initViewInfo: function () {
   try {
    var systemInfo = wx.getSystemInfoSync()
    var scale = 375 / 288 //默认宽度比  （总宽度 ／ 进度条宽度）
    this.setData({
      processWidth: (systemInfo.screenWidth / scale - 10),
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
        logger.info(res, '===触发暂停的：onInterruptionBegin====')
        this.recorderManager.pause() //手动暂停
        this.isPause = true //状态暂停
        this.setData({isRecording: false})
      })

      this.recorderManager.onStart(()=>{
        logger.info('===onStart====')
        this.setData({isRecording: true})
      })

      this.recorderManager.onStop((res)=>{
        this.playSource = res
        this.setData({isRecording: false})
        logger.info(res, '===触发停止的：onStop====')
      })

      this.recorderManager.onError((errMsg)=>{
        util.showError({message: errMsg})
        this.setData({isRecording: false})
        logger.info(errMsg, '===触发停止的：onError====')
      })
    } catch(err) {
      util.showError({message: err})
    }
  },


  // 初始化播放器
  initAudioContext: function (key) {
    this.destroyAudioCtx()
    console.log('==执行了销毁==')
    this.data.players[key].audioCtx = wx.createInnerAudioContext()

    this.data.players[key].audioCtx.src = this.data.players[key].src
    this.data.players[key].audioCtx.onPlay(()=> {
      logger.info('监听了播放',  this.data.players[key].audioCtx.duration)
      this.sendCircleStatus()
    })

    this.data.players[key].audioCtx.onTimeUpdate((res)=>{
      this.duration = this.data.players[key].audioCtx && this.data.players[key].audioCtx.duration
      logger.info('监听了更新',this.duration)
      this.duration && this.progressEvent(this.state, this.duration)
    })

    this.data.players[key].audioCtx.onPause((res)=> {
      logger.info(res, '监听了暂停')
      this.sendCircleStatus()
    })

    this.data.players[key].audioCtx.onStop((res)=>{
      logger.info(res, '监听了停止')
      this.computedPlayer()
      this.sendCircleStatus()
    })

    this.data.players[key].audioCtx.onEnded((res)=> {
      logger.info(res, '监听了自然暂停')
      this.data.players[key].audioCtx.destroy()
      this.computedPlayer()
      this.sendCircleStatus()
    })

    this.data.players[key].audioCtx.onError((err)=>{
      this.data.players[key].audioCtx.destroy()
      this.sendCircleStatus()
      logger.info('监听了错误', err)
    })
  },

  sendCircleStatus: function(){
    var source = Object.keys(this.data.players).filter(key=>{
      return this.data.players[key].isPlaying && !this.data.players[key].isPause
    })
    this.setData({
      isPlaying: source.length ? true : false
    })
  },

  // 录制
  recordVoice: function () {
    if (this.data.isRecording) { //是否正在录制中
      return this.stopRecord()
    }

    if (this.data.isPlaying) { //是否正在播放
      this.clearPlayers()
      this.destroyAudioCtx()    
    }

    this.getSetting().then(()=>{
      this.recorderManager.start({
        duration: 600000
      })
    })
  },

  stopRecord: function () {
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

  // 初始化当前控制信息
  clearPlayers: function () {
    this.state && this.setData({
      [`players.${this.state.key}`]: Object.assign(
        this.data.players[this.state.key], {
          isPlaying: false,
          isPause: false,
          count: 0,
          currentProgressWidth: 0
        }
      ),
      isPlaying: false,
      currentProgressWidth: 0,
      dotX: 0,
      curryTime: '00:00',
      [this.state.btnState]: false
    })
  },

  //监听播放状态 
  onPlayer: co.wrap(function *(state) {
    try {
      var player = this.data.players[state.key]
      if (this.data.isRecording) { //是否正在录制中
        this.stopRecord()
       }

      // 判断是否点击了不同类型的btn 初始化控制状态
      if (this.state && this.state.key != state.key) {
        this.clearPlayers()
      }

      if (!player.isPause && player.isPlaying) {  //正在播放中
        this.setData({
          [`players.${state.key}.isPause`]: true
        })
        player.audioCtx && player.audioCtx.pause()
        logger.info('暂停播放')
      } else if (player.isPause) { //暂停状态
        this.setData({
          [`players.${state.key}.isPause`]: false
        })
        player.audioCtx && player.audioCtx.play()
        logger.info('接着播放')
      } else { //首次播放
        this.setData({
          [`players.${state.key}.isPlaying`]: true
        })
        this.initAudioContext(state.key)
        player.audioCtx && player.audioCtx.play()
        logger.info('开始播放')
      }   

      this.state = state //存下默认标志对象

    } catch(err) {
      logger.info(err)
    }
  }),

  computedPlayer: function() {
    var state = this.state
    this.setData({
      [state.btnState]: false,
      [`players.${state.key}.isPlaying`]: false,
      [`players.${state.key}.isPause`]: false,
      [`players.${state.key}.count`]: 0,
      currentProgressWidth: 0,
      dotX: 0
    })
  },

  // 计算进度器
  progressEvent: function (state, totalTime) {
    var audioCtx = this.data.players[state.key].audioCtx
    // 每次进入清空当前进程
    this.setData({
      [`players.${state.key}.count`]: audioCtx.currentTime,
      currentProgressWidth:  Math.floor((this.data.processWidth / totalTime) * audioCtx.currentTime),
      dotX: Math.floor(((this.data.processWidth / totalTime) * audioCtx.currentTime))
    })
    this.computedPlayTimes(totalTime) // 计算播放时间
  },

  // 通知弹窗
  receivedInform: function() {
    this.setData({
      showToast: false
    })
    storage.put('showRecordToast', true)
  },

  // 计算播放时间
  computedPlayTimes: function(totalTimeStamp) {
    var audioCtx = this.data.players[this.state.key].audioCtx
    var usedTimeStamp = audioCtx.currentTime
    var mm = Math.floor( usedTimeStamp  / 60)
    var ss = Math.floor( usedTimeStamp % 60)
    var curryTime = `${this.formatTime(mm)}:${this.formatTime(ss)}`
    var data = {
      curryTime,
      usedTimeStamp
    }
    var mm = Math.floor(totalTimeStamp / 60)
    var ss = Math.floor(totalTimeStamp % 60)
    data.totalTime = `${this.formatTime(mm)}:${this.formatTime(ss)}`
    this.setData(data)
  },

  formatTime: function (t) {
    return t < 10 ? '0' + t : t
  },
  destroyAudioCtx: function () {
    Object.keys(this.data.players).forEach((key)=>{
      if(this.data.players[key].audioCtx) {
        this.data.players[key].audioCtx.stop()
        this.data.players[key].audioCtx.destroy()
      }
    })
  },
  onHide: function () {
    this.recorderManager.pause() //暂停录音
    this.destroyAudioCtx()
  },

  onUnload: function() {
    this.destroyAudioCtx()
  },

  onShareAppMessage: function () {

  }
})