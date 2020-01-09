"use strict"
const app = getApp()

import api from '../../../network/api'
import {
  regeneratorRuntime,
  co,
  util,
  _,
  common_util
} from '../../../utils/common_import'

const getUserInfo = util.promisify(wx.getUserInfo)
const event = require('../../../lib/event/event')
import api from '../../../network/restful_request'
import graphql from '../../../network/graphql/feature'
Page({
  data: {
    time: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20', '21', '22', '23'],
    num: 0,
    content: '',
    from_temp: false,
    mediumRecommend: '',
    fontType: 'kt',
    iosModal: false,
    text: '当日智能字帖生成次数已经用完，升级会员可以畅享使用'
  },
  onLoad: co.wrap(function* (options) {
    this.longToast = new app.WeToast()

    if (options.share_user_id) {
      console.log('options.share_user_id======', options.share_user_id)
      this.share_user_id = options.share_user_id,
        this.way = 5
      this.setData({
        from_temp: true
      })
    }
    if (options.scene) {
      let fromScene = decodeURIComponent(options.scene)
      let scene = fromScene.split('_')
      this.from = scene[0]
      if (this.from == 'application') {
        this.share_user_id = scene[1]
        this.way = 5
        this.setData({
          from_temp: true
        })

      }
    }

    let refer = wx.getLaunchOptionsSync()
    if (refer.scene === 1014) {
      this.setData({
        from_temp: true
      })

    }
    event.on('Authorize', this, function (data) {
      this.loopOpenId()
    })

    let unionId = wx.getStorageSync('unionId')
    console.log('get unionId', unionId)
    if (unionId) {
      yield this.loopOpenId()
    }
    let media_type = 'copy_book'
    this.setData({
      mediumRecommend: media_type
    })
    let getSupplyBefore = commonRequest.getSupplyBefore(media_type)
    let that = this
    getSupplyBefore.then(function (res) {
      const supply_types = res.supply_types
      console.log(supply_types)
      that.setData({
        supply_types: supply_types
      })
		})

		try {
			app.gio('track', 'copyBook', {})
		} catch (e) {}
  }),
  onShow: function () {
    let unionId = wx.getStorageSync('unionId')
    if (!unionId) {
      let url = this.share_user_id ? `/pages/authorize/index?url=${url}&share_user_id=${this.share_user_id}&way=${this.way}` : `/pages/authorize/index`
      wx.navigateTo({
        url: url,
      })
    }
  },

  copybookSets: co.wrap(function* (e) {
    this.longToast.toast({
      img: '/images/loading.gif',
      title: '请稍候',
      duration: 0
    })
    try {
      const resp = yield api.copybooksets(app.openId)
      if (resp.code != 0) {
        throw (resp)
      }
      this.setData({
        copybookSets: resp.res.copy_book_sets,
        user_selected_grade: resp.res.user_selected_grade,
        copybookSets: resp.res.copy_book_sets,
        word_count: resp.res.statistics.word_count,
        day_count: resp.res.statistics.day_count,
        print_count: resp.res.statistics.print_count,
        user_share_qrcode: resp.res.user_share_qrcode,
        reminder_at: resp.res.reminder_at ? resp.res.reminder_at : '',
        user_selected_grade: resp.res.user_selected_grade
      })
      if (this.data.reminder_at != '') {
        this.setData({
          remind: true,
          showNotice: true,
          clock: this.data.reminder_at
        })
      } else {
        this.setData({
          clock: "16:00"
        })
      }
      if (this.data.word_count > 99999) {
        let word = (this.data.word / 10000).toFixed(2)
        this.setData({
          word_count: word
        })
      }
      if (this.data.day_count > 99999) {
        let day = (this.data.day_count / 10000).toFixed(2)
        this.setData({
          day_count: day
        })
      }
      if (this.data.print_count > 99999) {
        let print = (this.data.print_count / 10000).toFixed(2)
        this.setData({
          print_count: print
        })
      }
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  setNotice: co.wrap(function* (e) {
    this.longToast.toast({
      img: '/images/loading.gif',
      title: '请稍候',
      duration: 0
    })
    this.data.remind = !this.data.remind
    this.setData({
      remind: this.data.remind
    })
    this.setData({
      showNotice: this.data.remind ? true : false
    })
    try {
      const resp = yield api.reminders(app.openId, 'copy_book', this.data.clock, this.data.remind)
      if (resp.code != 0) {
        throw (resp)
      }
      if (resp.code != 0) {
        this.data.remind = !this.data.remind
        this.setData({
          remind: this.data.remind,
        })
        this.setData({
          showNotice: this.data.remind ? true : false
        })
      }
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  bindPickerChange: co.wrap(function* (e) {
    let time
    if (e.detail.value >= 0 && e.detail.value < 10) {
      time = '0' + e.detail.value
    } else {
      time = e.detail.value
    }
    let clock = time + ':00'
    this.setData({
      clock: clock
    })
    try {
      const resp = yield api.reminders(app.openId, 'copy_book', this.data.clock, this.data.remind)
      if (resp.code != 0) {
        throw (resp)
      }
    } catch (e) {
      util.showErr(e)
    }
  }),

  contentinput: function (e) {
    let con = e.detail.value;
    this.setData({
      content: con,
      num: con.length
    })
  },

  // 选择字体
  chooseFont(e) {
    let fontType = e.currentTarget.id
    this.setData({
      fontType
    })
  },

  toDetail: co.wrap(function* (e) {
    let content = this.data.content.trim()
    if (content == '') {
      wx.showModal({
        title: '提示',
        content: '请输入内容',
        confirmColor: '#FFE27A',
        showCancel: false
      })
      return
    }
    this.longToast.toast({
      img: '/images/loading.gif',
      title: '请稍候',
      duration: 0
    })
    let type = e.currentTarget.id
    try {
      let params = {
        openid: app.openId,
        type: type,
        content: content,
        version:true
      }
      if (this.data.fontType === 'lmsxk') {
        params.font = 'lmsxk'
      }

      const resp = yield api.customCopybook(params)
      if (resp.code == 80000) {
        this.longToast.toast()
        return this.setData({
          iosModal: true,
        })
      } else if (resp.code != 0) {
        throw (resp)
      }
      let sn = resp.res.sn
      let word_count = resp.res.word_count
      let images = resp.res.images
      let pdf_url = resp.res.pdf_url
      this.longToast.toast()
      wx.navigateTo({
        url: `detail?title=自定义练习&sn=${sn}&word_count=${word_count}&images=${common_util.encodeLongParams(images)}&custom=true&user_share_qrcode=${common_util.encodeLongParams(this.data.user_share_qrcode)}&pdf_url=${common_util.encodeLongParams(pdf_url)}`,
      })
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  toList: co.wrap(function* (e) {
    let title = this.data.copybookSets[e.currentTarget.id].name
    let sn = this.data.copybookSets[e.currentTarget.id].sn
    let choose_grade = this.data.copybookSets[e.currentTarget.id].choose_grade
    let price = this.data.copybookSets[e.currentTarget.id].price_yuan

    if (choose_grade == true) {
      wx.navigateTo({
        url: `subject?title=${title}&sn=${sn}&user_share_qrcode=${common_util.encodeLongParams(this.data.user_share_qrcode)}&user_selected_grade=${this.data.user_selected_grade}&price=${price}`,
      })
    } else {
      wx.navigateTo({
        url: `list?title=${title}&sn=${sn}&choose_grade=${choose_grade}&price=${price}&user_share_qrcode=${common_util.encodeLongParams(this.data.user_share_qrcode)}`,
      })
    }

  }),

  toCommonSense: co.wrap(function* (e) {

    wx.navigateTo({
      url: `commonSense`,
    })
  }),

  toShare: co.wrap(function* (e) {
    const info = yield getUserInfo()
    this.setData({
      avatarUrl: info.userInfo.avatarUrl,
      nickName: info.userInfo.nickName
    })
    wx.navigateTo({
      url: `post?user_share_qrcode=${common_util.encodeLongParams(this.data.user_share_qrcode)}&word_count=${this.data.word_count}&day_count=${this.data.day_count}&print_count=${this.data.print_count}&avatarUrl=${this.data.avatarUrl}&nickName=${this.data.nickName}`,
    })
  }),

  loopOpenId: co.wrap(function* () {
    let loopCount = 0
    let _this = this
    if (app.openId) {
      console.log('openId++++++++++++----', app.openId)
      _this.copybookSets()
    } else {
      setTimeout(function () {
        loopCount++
        if (loopCount <= 100) {
          console.log('openId not found loop getting...')
          _this.loopOpenId()
        } else {
          console.log('loop too long, stop')
        }
      }, 1000)
    }
  }),
  backToHome: function () {
    try {
      wx.switchTab({
        url: '/pages/index/index'
      })
    } catch (e) {
      console.log(e)
    }
  },
  onUnload: function () {
    event.remove('Authorize', this)
  },
  closeIosTip: function () {
    if (this.data.iosModal) {
      this.setData({
        iosModal: false
      })
    }
  }


})
