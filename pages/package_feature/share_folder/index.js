"use strict"
const app = getApp()
import api from '../../../network/restful_request.js'
import {
  co,
  util
} from '../../../utils/common_import'
import commonRequest from '../../../utils/common_request.js'
const regeneratorRuntime = require('../../../lib/co/runtime')

Page({
  data: {
    tabId: 0,
    checked: false,
    showConfirmModal: null, //文件协议弹窗
    fileModal: false, //新建/修改文件夹名称弹窗
    content: '',
    inputContent: '',
    showShareModel: false, //分享弹窗
    popWindow: false, //底部弹窗
  },

  onLoad: function (options) {
    this.longToast = new app.weToast()
    this.setData({
      tabId: options.tabId ? options.tabId : 0
    })
    this.page = 1
    this.pageEnd = false
    this.firstShare()
    if (this.data.tabId == 0) {
      this.getFoldersList()
    } else if (this.data.tabId == 1) {
      this.page = 1
      this.pageEnd = false
      this.getShareFoldersList()
    }
  },

  onShow: co.wrap(function* () {

  }),

  checkProtocolSeivice: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      duration: 0
    })
    try {
      const resp = yield api.checkProtocol(app.openId)
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('是否同意服务协议', resp)
      if (!resp.res) { //没有同意
        this.setData({
          showConfirmModal: {
            title: `共享文件夹用户使用协议`,
            intro: `在使用小白智慧打印小程序的共享文件夹功能前，您需要同意以下协议，请您务必仔细阅读、充分理解协议中的条款内容后再点击同意`,
            choose: `我已阅读并同意上述条款`,
            link: `《共享文件夹用户使用协议》`
          }
        })
      } else {
        wx.setStorageSync('protocol', true)
        this.newFile()
      }
      this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  setProtocol: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      duration: 0
    })
    try {
      const resp = yield api.setProtocol(app.openId)
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('设置服务协议', resp)
      wx.setStorageSync('protocol', true)
      this.longToast.toast()
      this.newFile()
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  getFoldersList: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      duration: 0
    })
    if (this.page == 1) {
      this.setData({
        fileList: []
      })
      this.pageEnd = false
    }
    try {
      const resp = yield api.getFoldersList(app.openId, this.page)
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('获取文件夹列表', resp)
      this.longToast.toast()
      if (resp.res.length < 20) {
        this.pageEnd = true
      }
      if (resp.res.length == 0) {
        return
      }

      this.setData({
        fileList: this.data.fileList.concat(resp.res),
      })
      console.log("22222", this.data.fileList)
      this.page++

    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  getShareFoldersList: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      duration: 0
    })
    if (this.page == 1) {
      this.setData({
        shareFileList: []
      })
      this.pageEnd = false
    }
    try {
      const resp = yield api.getShareFoldersList(app.openId, this.page)
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('获取分享文件夹列表', resp)
      this.longToast.toast()

      if (resp.res.length < 20) {
        this.pageEnd = true
      }
      if (resp.res.length == 0) {
        return
      }

      this.setData({
        shareFileList: this.data.shareFileList.concat(resp.res),
      })
      console.log("111111", this.data.shareFileList)
      this.page++

    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  onReachBottom: function () {
    console.log('分页加载')
    console.log('this.pageEnd', this.pageEnd)
    if (this.pageEnd) {
      return
    }
    if (this.data.tabId == 0) {
      this.getFoldersList()
    } else {
      this.getShareFoldersList()
    }
  },

  confirmProtocol: co.wrap(function* () {
    this.setData({
      showConfirmModal: false,
    })
    yield this.setProtocol()
  }),

  cancelProtocol: co.wrap(function* () {
    wx.showToast({
      title: '请先勾选同意条款',
      icon: 'none',
      mask: true,
    })
  }),

  checkProtocol: co.wrap(function* () {
    this.setData({
      checked: !this.data.checked,
    })
  }),

  newFile: co.wrap(function* () {
    console.log("qqq")
    let protocol = wx.getStorageSync('protocol')
    if (!protocol) {
      yield this.checkProtocolSeivice()
      return
    }
    console.log("111111")
    if (this.data.fileList.length < 20) {
      this.setData({
        fileModal: true,
        showNewFileModal: true,
        changeFileModal: false
      })
    } else {
      wx.showToast({
        title: '每个人最多只能创建20个文件夹哦',
        icon: 'none',
        mask: true,
      })
    }
  }),

  toUrl: co.wrap(function* () {
    let url = 'http://cdn.gongfudou.com/epbox/backend/shared_folder_agreement.pdf'
    yield commonRequest.previewDocument(url)
  }),

  changeTab: function (e) {
    let id = e.currentTarget.id
    this.page = 1
    this.pageEnd = false
    this.setData({
      fileList: [],
      shareFileList: [],
      tabId: id
    })
    if (id == 0) {
      this.getFoldersList()
    } else {
      this.getShareFoldersList()
    }
  },

  endInput: function (event) {
    console.log(event.detail.value)
    this.setData({
      inputContent: event.detail.value
    })
  },

  confirmNewFile: co.wrap(function* () {
    if ((this.data.inputContent).trim() == '') {
      this.setData({
        content: '文件夹名称不能为空'
      })
      return
    } else {
      this.setData({
        content: '',
        fileModal: false,
      })
      this.longToast.toast({
        type: 'loading',
        duration: 0
      })
      try {
        const resp = yield api.createFolders(app.openId, this.data.inputContent)
        if (resp.code != 0) {
          throw (resp)
        }
        console.log('创建文件夹成功', resp)
        this.setData({
          inputContent: ''
        })
        this.page = 1
        this.getFoldersList()
        // this.longToast.toast()
      } catch (e) {
        this.longToast.toast()
        util.showErr(e)
      }
    }
  }),

  cancelNewFile: function () {
    this.setData({
      fileModal: false,
      showConfirmModal: false,
      content: ''
    })
  },

  a: function () {
    return
  },

  toMore: function (e) {
    this.sn = this.data.fileList[e.currentTarget.id].sn
    this.file_name = this.data.fileList[e.currentTarget.id].name
    this.setData({
      popWindow: true
    })
  },

  rename: function () {
    this.setData({
      fileModal: true,
      changeFileModal: true,
      showNewFileModal: false
    })
  },

  cancelFile: function () {
    this.setData({
      fileModal: false,
      content: '',
      inputContent: ''
    })
  },

  changeFoldersName: co.wrap(function* () {
    if ((this.data.inputContent).trim() == '') {
      this.setData({
        content: '文件夹名称不能为空'
      })
      return
    } else {
      this.setData({
        content: '',
        fileModal: false,
      })
      this.longToast.toast({
        type: 'loading',
        duration: 0
      })
      try {
        const resp = yield api.changeFoldersName(app.openId, this.data.inputContent, this.sn)
        if (resp.code != 0) {
          throw (resp)
        }
        console.log('修改文件夹名称成功', resp)
        this.setData({
          inputContent: ''
        })
        this.longToast.toast()
        this.page = 1
        this.getFoldersList()
      } catch (e) {
        this.longToast.toast()
        util.showErr(e)
      }
    }
  }),

  closePopWindow: function () {
    this.setData({
      popWindow: false
    })
  },

  deleteFile: co.wrap(function* () {
    let that = this
    wx.showModal({
      content: '删除后该文件夹包含文件也将一并删除，是否确认',
      success(res) {
        if (res.confirm) {
          console.log('用户点击确定')
          that.confirmDeleteFile()
        } else if (res.cancel) {
          console.log('用户点击取消')
        }
      }
    })
  }),

  confirmDeleteFile: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      duration: 0
    })
    try {
      const resp = yield api.deleteFolders(app.openId, this.sn)
      if (resp.code != 0) {
        throw (resp)
      }
      console.log('删除文件夹成功', resp)
      this.page = 1
      this.getFoldersList()
      // this.longToast.toast()
    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),

  manageGroup: function () {
    wx.navigateTo({
      url: `share_manage?file_name=${this.file_name}&sn=${this.sn}`,
    })
  },

  showShare: function (e) {
    this.setData({
      showShareModel: true,
      share_file_name: this.data.fileList[e.currentTarget.id].name,
      share_sn: this.data.fileList[e.currentTarget.id].sn,
      share_users_count: this.data.fileList[e.currentTarget.id].users_count
    })
    wx.setStorageSync('firstTouchIndex', '1')
    this.firstShare()
  },

  cancelShare: function () {
    this.setData({
      showShareModel: false
    })
  },

  toDocuments: function (e) {
    console.log(e.currentTarget.id)
    if (this.data.tabId == 0) {
      let file_name = this.data.fileList[e.currentTarget.id].name
      let sn = this.data.fileList[e.currentTarget.id].sn
      let users_count = this.data.fileList[e.currentTarget.id].users_count
      wx.navigateTo({
        url: `content?file_name=${file_name}&sn=${sn}&role=creator&users_count=${users_count}`,
      })
    } else {
      let file_name = this.data.shareFileList[e.currentTarget.id].name
      let sn = this.data.shareFileList[e.currentTarget.id].sn
      let time = this.data.shareFileList[e.currentTarget.id].created_at
      wx.navigateTo({
        url: `content?file_name=${file_name}&sn=${sn}&role=user&time=${time}`,
      })
    }

  },
  firstShare: function () {
    let firstTouch = wx.getStorageSync('firstTouchIndex')
    console.log('firstTouch', firstTouch)
    if (firstTouch) {
      this.setData({
        firstShare: true
      })
    } else {
      this.setData({
        firstShare: false
      })
    }
  },

  onShareAppMessage: function (e) {
    console.log(e)
    let userId = wx.getStorageSync("userId")
    console.log("aaaaaaaa----", userId)
    if (e.target.id != '') {
      this.setData({
        share_file_name: this.data.fileList[e.target.id].name,
        share_sn: this.data.fileList[e.target.id].sn,
        share_users_count: this.data.fileList[e.target.id].users_count
      })
    }
    return {
      title: `这些资料很不错哦，点击加入${this.data.share_file_name}`,
      path: `/pages/error_book/pages/share_folder/content?sn=${this.data.share_sn}&file_name=${this.data.share_file_name}&share=true&users_count=${this.data.share_users_count}&userId=${userId}`,
      imageUrl: `../../images/folder_share_img.jpg`
    }
  },

})