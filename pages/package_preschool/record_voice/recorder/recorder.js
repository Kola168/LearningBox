// pages/package_common/record_voice/recorder/recorder.js
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage
} from '../../../../utils/common_import'
var app = getApp()
const event = require('../../../../lib/event/event')
import graphql from '../../../../network/graphql_request'
import upload from '../../../../utils/upload'
import Logger from '../../../../utils/logger'
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
    players: null,
    recordSource: [1,2], //录制的资源
    voiceSource: null, //原声资源
    showToast: false, //通知弹窗
    kidInfo: null, // 宝宝信息
  },

  onLoad: co.wrap(function *(options) {
    if (options.scene) {
      var scene = decodeURIComponent(options.scene)
      var params = {} 
      scene.split('&').forEach(str => {
        params[`${str.split('=')[0]}`] =  str.split('=')[1]
      })
      console.log(params,'params==')
      this.sn = params.content
      this.userId = params.user
      this.longToast = new app.weToast()
      this.initViewInfo()
      this.initRecorderManager()
      this.setData({
        showToast: !storage.get('showRecordToast')
      })
      var unionId = storage.get('unionId')
      if (unionId) {
        yield this.getContent()
        yield this.getUserInfo()
      }
    }
    
   
	  //授权成功后回调
		event.on('Authorize', this, co.wrap(function*(){
      yield this.getContent()
      yield this.getUserInfo()
    }))
  }),

  onShow: function () {
    var unionId = storage.get('unionId')
    if (!unionId) {
      return wxNav.navigateTo('/pages/authorize/index')
    }

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
  	/**
	 * 获取宝宝信息
	 */
	getUserInfo: co.wrap(function* () {
    this.longToast.toast({
      type: "loading",
      duration: 0
    })
    try {
      let resp = yield graphql.getUser()
      this.setData({
        kidInfo: resp.currentUser.selectedKid,
      })
      this.longToast.hide()
    } catch (e) {
      this.longToast.hide()
      util.showError(e)
    }
	}),

  /**
   * 获取内容详情
   */
  getContent: co.wrap(function*(){
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      var resp = yield graphql.getRecordInfo(this.sn, Number(this.userId))
      var userAudio = resp.userContentAudio && resp.userContentAudio.audioUrl || null
      this.setData({
        content: resp.content,
        title: resp.content && resp.content.name,
        userAudio: userAudio,
        players: {  // 播放控制属性
          record: {
            isPlaying: false,
            isPause: false,
            audioCtx: null,
            currentProgressWidth: 0,
            src: userAudio
          },
          source: {
            isPlaying: false,
            isPause: false,
            count: 0,
            audioCtx: null,
            currentProgressWidth: 0,
            src: resp.content.audio || ''
          }
        }
      })
      
			this.longToast.hide()
    } catch(err) {
      util.showError(err)
      this.longToast.hide()
    }
  }),

  /**
   * 初始化进度及顶部位置
   */
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
        this.uploadRecord(res) // 上传录音资源
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

  /**
   * 初始化播放器
   * @param {String} key 当前事件key 
   */
  initAudioContext: function (key) {
    this.destroyAudioCtx() //销毁音频
    this.data.players[key].audioCtx = wx.createInnerAudioContext()

    this.data.players[key].audioCtx.src = this.data.players[key].src
    this.data.players[key].audioCtx.onPlay(()=> {
      this.longToast.toast({
        type: 'loading',
        title: '初始化...'
      })
      logger.info('监听了播放',  this.data.players[key].audioCtx.duration)
      this.sendPlayStatus()
      this.setData({
        [`players.${key}.isPlaying`]: true
      })
    })

    this.data.players[key].audioCtx.onTimeUpdate(()=>{
      this.longToast.hide()
      this.duration = this.data.players[key].audioCtx && this.data.players[key].audioCtx.duration
      this.duration && this.progressEvent(this.state, this.duration)
      logger.info('监听了更新',this.duration)
    })

    this.data.players[key].audioCtx.onPause((res)=> {
      this.sendPlayStatus()
      this.setData({
        [`players.${key}.isPause`]: true
      })
      logger.info(res, '监听了暂停')
    })

    this.data.players[key].audioCtx.onStop((res)=>{
      this.resetPlayer()
      this.sendPlayStatus()
      logger.info(res, '监听了停止')
    })

    this.data.players[key].audioCtx.onEnded((res)=> {
      this.data.players[key].audioCtx.destroy()
      this.resetPlayer()
      this.clearPlayers()
      this.sendPlayStatus()
      logger.info(res, '监听了自然暂停')
    })

    this.data.players[key].audioCtx.onError((err)=>{
      this.data.players[key].audioCtx.destroy()
      this.sendPlayStatus()
      logger.info('监听了错误', err)
    })
  },

  /**
   * 设置播放状态
   */
  sendPlayStatus: function(){
    var source = []
    for(var key in this.data.players) {
      if (this.data.players[key].isPlaying && !this.data.players[key].isPause) {
        source.push(this.data.players[key])
      }
    }
    this.setData({
      isPlaying: source.length ? true : false
    })
  },

  /**
   * 录制
   */
  recordVoice: function () {
    if (this.data.isRecording) { //是否正在录制中
      return this.stopRecord()
    }

    if (this.data.isPlaying) { //是否正在播放
      console.log()
      this.clearPlayers()
      this.destroyAudioCtx()    
    }

    this.getSetting().then(()=>{
      this.recorderManager.start({
        duration: 600000
      })
    })
  },

  /**
   * 停止录制
   */
  stopRecord: function () {
    this.recorderManager.stop() //停止录音
  },
  
  /**
   * 授权
   */
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

  /**
   * 播放录音
   */
  startPlayRecord: function () {
    this.onPlayer({
      key: 'record',
      btnState: 'isPlayingRecord'
    })

  },

  /**
   * 播放原声
   */
  startPlayVoice: function () {
    this.onPlayer({
      key: 'source',
      btnState: 'isPlayingSource' 
    })
  },

  /**
   * 初始化当前控制信息
   */
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
      totalTime: '00:00',
      [this.state.btnState]: false
    })
  },

  /**
   * 监听播放状态
   */ 
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
        player.audioCtx && player.audioCtx.pause()
        logger.info('暂停播放')
      } else if (player.isPause) { //暂停状态
        this.setData({
          [`players.${state.key}.isPause`]: false
        })
        player.audioCtx && player.audioCtx.play()
        logger.info('接着播放')
      } else { //首次播放
        this.initAudioContext(state.key)
        player.audioCtx && player.audioCtx.play()
        logger.info('开始播放')
      }   

      this.state = state //存下默认标志对象

    } catch(err) {
      logger.info(err)
    }
  }),

  /**
   * 复位播放状态
   */
  resetPlayer: function() {
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

  /**
   * 计算进度器
   * @param {*} state 
   * @param {*} totalTime 
   */
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

  /**
   * 通知弹窗
   */
  receivedInform: function() {
    this.setData({
      showToast: false
    })
    storage.put('showRecordToast', true)
  },

  /**
   * 计算播放时间
   * @param {NUmber} totalTimeStamp 
   */
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
  
  /**
   * 销毁Audio
   */
  destroyAudioCtx: function () {
    for(var key in this.data.players) {
      if(this.data.players[key].audioCtx) {
        this.data.players[key].audioCtx.stop()
        this.data.players[key].audioCtx.destroy()
      }
    }
  },

  /**
   * 上传录音
   */
  uploadRecord: co.wrap(function*(res){
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      var audioUrl = yield upload.uploadFile(res.tempFilePath, true)
      yield graphql.createAudio({
        audioUrl,
        sn: this.sn
      })
      this.longToast.hide()
      this.getContent()
    } catch(err) {
      util.showError(err)
      this.longToast.hide()
    }
  }),

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