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
    title: '', //默认顶栏标题
    navBarHeight: 0,
    dotX: 0, //进度点进度数
    isPlaying: false,  //是否播放
    currentProgressWidth: 0,
    totalTime: 0, //总播放时长
    curryTime: 0, //当前播放进度时长
    usedTimeStamp: 0,//当前播放进度时长
    players: null,
    recordSource: [1,2], //录制的资源
    voiceSource: null, //原声资源
    showToast: false, //通知弹窗
    showTips: false,
    userContentAudio: null, //用户录制者信息
    isRecording: false,
  },

  onLoad: co.wrap(function *(options) {
    if (options.scene) {
      var showToast = !storage.get('showRecordToast')
      var scene = decodeURIComponent(options.scene)
      
      var params = {} 
      scene.split('&').forEach(str => {
        params[`${str.split('=')[0]}`] =  str.split('=')[1]
      })
      this.sn = params.content
      this.userId = params.user
    
      this.longToast = new app.weToast()
      this.initViewInfo()
      this.initRecorderManager()
      this.setData({
        showToast
      })
      if (app.isScope()) { // 授权完成执行
        this.getPageInfo(showToast)
      }
    }
    
   
	  //授权成功后回调
		event.on('Authorize', this, co.wrap(function*(){
      this.getPageInfo(showToast)
    }))
  }),

  onShow: function () {
    if (!app.isScope()) {
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

  getPageInfo: co.wrap(function*(showToast){
    try {
      yield this.getContent()
      if (!showToast) { //弹窗确认过 自动播放
        yield this.startPlayVoice()
      }
    } catch(err) {
      util.showError(err)
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
        userContentAudio: resp.userContentAudio,
        title: resp.content && resp.content.name,
        userAudio: userAudio,
        players: {  // 播放控制属性
          record: {
            isPlaying: false,
            isPause: false,
            audioCtx: null,
            currentProgressWidth: 0,
            src: userAudio || resp.content.audioUrl
          },
          source: {
            isPlaying: false,
            isPause: false,
            count: 0,
            audioCtx: null,
            currentProgressWidth: 0,
            src: resp.content.audioUrl || ''
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
    logger.info(err)
   }
  },

  /**
   * 初始化录音
   */ 
  initRecorderManager: function () {
    try {
      this.isPause = false // 默认不是暂停状态
      this.recorderManager = wx.getRecorderManager()

      this.recorderManager.onInterruptionBegin(()=>{ //微信语音 微信视频触发中断回调
        this.recorderManager.pause() //手动暂停
        this.isPause = true //状态暂停
        this.setData({isRecording: false})
        logger.info('===onInterruptionBegin====触发微信语音 微信视频触发暂停的：onInterruptionBegin')
      })

      this.recorderManager.onStart(()=>{
        this.setData({isRecording: true})
        logger.info('===onStart====触发开始录音')
      })

      this.recorderManager.onResume(()=>{
        this.setData({isRecording: true})
        logger.info('===onResume====触发继续录音')
      })

      this.recorderManager.onStop((res)=>{
        var playSource = res.tempFilePath
        this.setData({
          isRecording: false,
          showTips: !storage.get('showRecordTip') //录音完成后判断是否显示提醒卡片
        })
        storage.put('showRecordTip', true) //记录提示tips状态
        wx.showModal({
          title: '提示',
          content: '是否保存录音',
          success: (res) => {
            if (res.confirm) {
              this.uploadRecord(playSource) // 上传录音资源
            }
          }
        })
        logger.info(res, '===onStop====触发录音停止')
      })

      this.recorderManager.onError((errMsg)=>{
        this.setData({isRecording: false})
        util.showError({message: errMsg})
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
    // 判断是否是本人进入 默认权限者打印者本人
    if (this.data.userContentAudio && !this.data.userContentAudio.isOwner) {
      return wx.showModal({
        title: '提示',
        content: '分享暂不可录音，请至“童音录制”打印扫码录音',
        showCancel: false
      })
    }
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
  startPlayRecord: co.wrap(function *() {
    this.onPlayer({
      key: 'record',
      btnState: 'isPlayingRecord'
    })

  }),

  /**
   * 播放原声
   */
  startPlayVoice: co.wrap(function *() {
    this.onPlayer({
      key: 'source',
      btnState: 'isPlayingSource' 
    })
  }),

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
      isPlaying: false, //关闭播放状态
      currentProgressWidth: 0, //播放进度清零
      dotX: 0, //播放标点清零
      curryTime: '00:00', //播放时间清零
      totalTime: '00:00', //资源时长清零
      [this.state.btnState]: false //播放按钮状态重置
    })
  },

  /**
   * 监听播放状态
   */ 
  onPlayer: co.wrap(function *(state) {
    try {
      var player = this.data.players[state.key]
      if (this.data.isRecording) { //是否正在录制中
        return wx.showToast({
          icon: 'none',
          title: '录音完成可播放'
        })
       }

      // 判断是否点击了不同类型的btn 初始化上一个播放源控制状态
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

      this.state = state //存下默认标示对象

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
    this.startPlayVoice() //开始播放原声音频

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
    var minute = Math.floor(totalTimeStamp / 60)
    var second = Math.floor(totalTimeStamp % 60)
    data.totalTime = `${this.formatTime(minute)}:${this.formatTime(second)}`
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
  uploadRecord: co.wrap(function*(src){
    this.longToast.toast({
      type: 'loading',
      title: '请稍候'
    })
    try {
      var audioUrl = yield upload.uploadFile(src, true)
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
    this.clearPlayers()
  },

  onUnload: function() {
    this.recorderManager.pause() //暂停录音
    this.destroyAudioCtx()
    this.clearPlayers()
  }
})