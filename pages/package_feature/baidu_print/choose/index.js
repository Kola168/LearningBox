"use strict"
const app = getApp()
const event = require('../../../../lib/event/event')
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
import graphql from '../../../../network/graphql_request'
import api from '../../../../network/restful_request'
// const MAX_LENGTH = 18
Page({
  data: {
    fileList: [],
    fileIds: [],
    type: '', //文档类型
    modalObj: {
      isShow: false,
      title: '重要提醒',
      content: '',
      hasCancel: false
    }
  },
  onLoad(options) {
    this.weToast = new app.weToast()
    this.isEnd = false
    this.gapNum = 50
    if (options.path) {
      this.path = options.path
    } else {
      this.path = '/'
      let pages = getCurrentPages(),
        toBdNetPath = [pages.length - 2].route
      storage.put('toBdNetPath', toBdNetPath, 60 * 24)
    }
    this.keyword = ''
    this.setData({
      type: options.type,
      isFullScreen: app.isFullScreen
    })

    // this.media_type = options.media_type
    // if (options.type === 'img') {
    //   this.storageImages = this.getStorageImages()
    //   let imgLen = this.storageImages.allCount
    //   this.usableLen = MAX_LENGTH - imgLen
    // }
    this.getFileList()
  },
  getFileList: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      const resp = yield graphql.getBaiduNetList(this.path, this.data.type, this.keyword)
      this.weToast.hide()
      let allData = resp.fileList,
        len = allData.length
      this.allData = allData
      if (len > this.gapNum) {
        this.startIndex = 0
        this.setPageData()
      } else {
        this.isEnd = true
        this.setData({
          ['fileList[0]']: allData
        })
      }
    } catch (e) {
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
      ['fileList[' + len + ']']: tempData
    })
  },
  onReachBottom() {
    if (!this.isEnd) {
      this.setPageData()
    } else {
      return
    }
  },
  toSearch() {
    wxNav.navigateTo(`../search/index`, {
      type: this.data.type,
      path: this.path
    })
  },

  // 选择文件
  checkFile: co.wrap(function*(e) {
    try {
      let index = e.currentTarget.id,
        tempData = this.data.fileList,
        currentFile = tempData[index],
        fileIds = this.data.fileIds

      if (currentFile.isChecked) {
        fileIds.push(Number(currentFile.fsId))
        let tempSet = new Set(fileIds)
        tempSet.delete(Number(currentFile.fsId))
        fileIds = Array.from(tempSet)
        tempData[index].isChecked = false
      } else {
        let tempText = '',
          fileLimt = 0
        if (this.type == 'imagelist') {
          fileLimt = this.usableLen > 5 ? 5 : this.usableLen
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
          tempData[index].isChecked = true
        }
      }
      this.setData({
        fileList: tempData,
        fileIds: fileIds
      })
    } catch (error) {
      console.log(error)
    }
  }),

  // 请求下载code
  chooseDone: co.wrap(function*() {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield api.getBdFilesSn(this.data.fileIds)
      console.log(resp)
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
      event.emit('chooseBaiduFileDone', cdnFiles)
      let delta = this.findLastUrlAndQueryDelta()
      wxNav.navigateBack(delta, () => {
        this.weToast.hide()
      })
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
    let path = e.currentTarget.dataset.path
    wxNav.navigateTo('../choose/index', {
      type: this.data.type,
      path
    })
  },

})