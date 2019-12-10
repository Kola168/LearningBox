"use strict"
const app = getApp()
const event = require('../../../../lib/event/event')
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'
import api from '../../../../network/restful_request'
Page({
  data: {
    fileList: [],
    fileIds: [], //文件ids
    type: '', //文件类型
    keywordValue: '',
    isEmpty: false,
    autoFocus: true,
    modalObj: {
      isShow: false,
      title: '重要提醒',
      content: '',
      hasCancel: false
    }
  },
  onLoad(options) {
    this.weToast = new app.weToast()
    this.chooseBaiduFrom = options.from ? options.from : ''
    this.countLimit = options.countLimit ? options.countLimit : 1
    this.isEnd = false
    this.gapNum = 50
    this.path = options.path
    this.setData({
      type: options.type,
      isFullScreen: app.isFullScreen
    })
  },
  getFileList: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      const resp = yield graphql.getBaiduNetList(this.path, this.data.type, this.data.keywordValue)
      this.weToast.hide()
      let allData = resp.fileList,
        len = allData.length
      this.allData = allData
      if (len === 0) {
        this.setData({
          isEmpty: true
        })
        return
      }
      if (len > this.gapNum) {
        this.startIndex = 0
        this.setPageData()
      } else {
        this.isEnd = true
        this.setData({
          ['fileList[0]']: allData,
          isEmpty: false
        })
      }
    } catch (e) {
      this.setData({
        isEmpty: true
      })
      this.weToast.hide()
      util.showGraphqlErr(e)
    }
  }),

  // 模拟分页
  setPageData() {
    let allData = this.allData,
      tempData = allData.slice(this.startIndex, this.startIndex + this.gapNum),
      tempLen = tempData.length
    if (tempLen < this.gapNum) {
      this.isEnd = true
    } else {
      this.isEnd = false
    }
    this.startIndex += this.gapNum
    let len = this.data.fileList.length
    this.setData({
      ['fileList[' + len + ']']: tempData,
      isEmpty: false
    })
  },
  onReachBottom() {
    if (!this.isEnd) {
      this.setPageData()
    } else {
      return
    }
  },

  // 选择文件
  checkFile: co.wrap(function*(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    try {
      let index = e.currentTarget.id,
        arrIndex = e.currentTarget.dataset.arrindex,
        fileList = this.data.fileList,
        currentFile = fileList[index][arrIndex],
        isChecked = currentFile.isChecked,
        dataKey = 'fileList[' + index + '][' + arrIndex + '].isChecked',
        fileIds = this.data.fileIds
      if (currentFile.isChecked) {
        fileIds.push(Number(currentFile.fsId))
        let tempSet = new Set(fileIds)
        tempSet.delete(Number(currentFile.fsId))
        fileIds = Array.from(tempSet)
        isChecked = false
      } else {
        let tempText = '',
          fileLimt = 0
        if (this.data.type === 'img') {
          fileLimt = this.countLimit > 5 ? 5 : this.countLimit
          tempText = fileLimt + '张图片'
        } else {
          fileLimt = 1
          tempText = fileLimt + '个文档'
        }
        if (fileIds.length === fileLimt) {
          this.setData({
            ['modalObj.isShow']: true,
            ['modalObj.title']: "重要提醒",
            ['modalObj.content']: `每次只可选择${tempText}`,
          })
          return
        } else {
          fileIds.push(Number(currentFile.fsId))
          isChecked = true
        }
      }
      this.setData({
        [dataKey]: isChecked,
        fileIds: fileIds
      })
    } catch (error) {
      util.showError(error)
    }
  }),

  // 请求下载code
  chooseDone: co.wrap(function*() {
    if (app.preventMoreTap(e)) {
      return
    }
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield api.getBdFilesSn(this.data.fileIds)
      if (resp.code != 0) {
        throw (resp)
      }
      this.chooseDoneNext(resp.res.sn)
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),

  // 下载
  chooseDoneNext: co.wrap(function*(sn) {
    try {
      let resp = yield api.uploadBdFileToCdn(sn)
      if (resp.code != 0) {
        throw (resp)
      }
      let state = resp.res.state
      if (state === 'send') {
        setTimeout(() => {
          this.chooseDoneNext(sn)
        }, 3000)
        return
      }
      let cdnFiles = resp.res.data
      if (this.chooseBaiduFrom === 'original' && this.data.type === 'doc') {
        wxNav.navigateTo(`/pages/print_doc/doc_list/doc_list`, {
          arrayFile: encodeURIComponent(JSON.stringify(cdnFiles)),
          type: 'baidu'
        })
      } else {
        event.emit('chooseBaiduFileDone', cdnFiles)
        let delta = this.findLastUrlAndQueryDelta()
        wxNav.navigateBack(delta, () => {
          this.weToast.hide()
        })
      }
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 已存在页面的位置
  findLastUrlAndQueryDelta: () => {
    let pages = getCurrentPages(),
      len = pages.length,
      url = storage.get('toBdNetPath')
    for (let i = 0; i < len; i++) {
      let isIn = (pages[i].route === url)
      if (isIn) {
        return len - i - 1
      }
    }
    return false
  },

  // 预览图片
  previewImg(e) {
    let imgSrc = e.currentTarget.id,
      type = e.currentTarget.dataset.type
    if (type !== 'error') {
      wx.previewImage({
        urls: [imgSrc]
      })
    } else {
      return
    }
  },

  // 不支持文件提示
  handleFileTip(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    let file = e.currentTarget.dataset,
      size = file.size,
      type = file.type
    if (type === "error") {
      let content = this.data.type === 'doc' ? `doc,docx,ppt,pptx,pdf,xls,xlsx七种` : 'png,jpg,jpeg三种'
      this.setData({
        ['modalObj.isShow']: true,
        ['modalObj.title']: "格式暂不支持",
        ['modalObj.content']: `目前只支持${content}格式`
      })
    } else if (size > 20000000) {
      this.setData({
        ['modalObj.isShow']: true,
        ['modalObj.title']: "重要提醒",
        ['modalObj.content']: "文件大小不得超过20M"
      })
    }
  },

  // 跳转文件夹
  toNextFolder(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    let path = e.currentTarget.dataset.path
    wxNav.navigateTo('../choose/index', {
      type: this.data.type,
      from: this.chooseBaiduFrom,
      path
    })
  },

  back() {
    wxNav.navigateBack()
  },

  // 获取搜索结果
  search: co.wrap(function*() {
    this.setData({
      isEmpty: false,
      autoFocus: false,
      fileList: []
    })
    this.getFileList()
  }),

  getKeyword: function(e) {
    let tempValue = e.detail.value.trim()
    if (tempValue) {
      this.setData({
        keywordValue: tempValue
      })
    }
  },
  deleteContent: function() {
    this.setData({
      keywordValue: '',
      autoFocus: true,
      fileList: []
    })
  }
})