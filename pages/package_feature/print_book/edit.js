// pages/package_feature/print_book/edit.js
const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const _ = require('../../../lib/underscore/we-underscore')
const util = require('../../../utils/util')
const upload = require('../../../utils/upload')
const imginit = require('../../../utils/imginit')

const showModal = util.promisify(wx.showModal)

import wxNav from '../../../utils/nav.js'
let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({

  data: {
    photoPath: '', //组件图片地址
    imageInfo: {}, //图片信息
    paperSize: {
      width: 1500,
      height: 1000,
      minLeftHeight: 385,
      sider: 95,
    },
    templateInfo: {
      modeSize: {
        x: 0,
        y: 0,
        width: 1500,
        height: 1000,
        areaWidth: 1500,
        areaHeight: 1000,
      }
    },
    imgList: [], //用户上传图片列表
    selectedIndex: 0,
    totalCount: 0, //进度总数量
    errTip: '', //进度条错误提示
    percent: 0, //进度条进度数值
    completeCount: 0, //进度条当前上传目标值
    showProcess: false, //是否展示进度条
  },

  limitCount: 9, //最大上传数量

  onLoad: co.wrap(function*(options) {

  }),

  tapTemplate: function(e) {
    let index = e.currentTarget.dataset.index
    let storageArr = _.deepClone(this.selectComponent("#mymulti").data.imgArr)
    let previousIdnex = _.clone(this.data.selectedIndex)
    this.setData({
      selectedIndex: index,
      [`imgList[${previousIdnex}].storage`]: storageArr,
    })
    //临时方法用于存储和切换编辑过的图片信息
    let that = this
    if (_.isNotEmpty(this.data.imgList[index].storage)) {
      this.selectComponent("#mymulti").setData({
        imgArr: that.data.imgList[index].storage
      })
    } else {
      this.showEdit(index)
    }
  },

  confBut: co.wrap(function*() {
    try {
      let that = this
      let pointArr = []
      _.each(this.data.imgList, function(value, index, list) {
        console.log(value)
        let pointItem = {}
        if (index == that.data.selectedIndex) {
          pointItem = that.selectComponent("#mymulti").getImgPoint()
        } else if (value.storage) {
          pointItem = that.selectComponent("#mymulti").getImgPoint(value.storage)
        } else {
          pointItem = that.selectComponent("#mymulti").getImgsPoints([{
            templateSize: that.data.templateInfo.modeSize,
            imgInfo: {
              path: value.imgNetPath,
              width: value.imageInfo.width,
              height: value.imageInfo.height,
            }
          }])
        }
        console.log(pointItem)
        pointArr.push(pointItem[0])
      })
      console.log(pointArr)
    } catch (e) {
      console.log(e)
    }
  }),

  showEdit: function(index) {
    this.setData({
      photoPath: this.data.imgList[index].imgNetPath,
      imageInfo: this.data.imgList[index].imageInfo,
    })
  },

  addImg: function() {
    let restCount = this.limitCount - this.data.imgList.length
    let count = restCount > 9 ? 9 : restCount
    if (restCount <= 0) {
      return
    }
    this.setData({
      chooseCount: count
    })
    this.selectComponent("#checkComponent").showPop()
  },

  chooseImgs: co.wrap(function*(e) {
    let imgs = e.detail.tempFiles
    let that = this
    let paths = []
    //去除大于20兆的
    try {
      _.each(imgs, function(value, index) {
        if (value.size < 20000000) {
          paths.push(value.path)
        }
      })
      Loger(paths)
      //没有可用图片列表时提示
      if (paths.length == 0) {
        this.setData({
          showProcess: true,
          errTip: '已为您过滤部分不适合打印的照片（大于20M)'
        })
        setTimeout(function() {
          that.setData({
            showProcess: false,
          })
        }, 5000)
      } else {
        app.cancelUpload = false
        this.setData({
          showProcess: true,
          count: paths.length
        })
        upload.uploadFiles(paths, function(index, path) {
          if (_.isNotEmpty(index) && _.isNotEmpty(path)) {
            that.setData({
              completeCount: index
            })
            that.showImage(path, index)
          } else {
            if (app.cancelUpload == true) {
              return
            }
            that.setData({
              showProcess: false
            })
            wx.showModal({
              title: '照片上传失败',
              content: '请检查网络或稍候再试',
              showCancel: false,
              confirmColor: '#FFE27A'
            })
          }
        }, function(process) {
          that.setData({
            percent: process
          })
        })
      }
    } catch (e) { Loger(e) }
  }),
  //展示图片
  showImage: co.wrap(function*(url, index) {
    try {
      let that = this
      let imaPath = yield imginit.imgInit(url)
      if (_.isNotEmpty(imaPath)) {
        this.data.imgList.push(imaPath)
      }
      this.setData({
        imgList: this.data.imgList
      })
      //最后一张图结束清空隐藏进度条
      if (index == that.data.count) {
        this.showEdit(0)
        that.setData({
          showProcess: false
        })
        Loger('***图片处理结束，所有照片：***', that.data.imgList)
      }
    } catch (e) {
      Loger(e)
    }
  }),

  deleteImg: co.wrap(function*(e) {
    let index = e.currentTarget.dataset.index
    let del = yield showModal({
      title: '确认删除',
      content: '确定删除这张照片吗',
      confirmColor: '#FFE27A'
    })
    if (!del.confirm) {
      return
    }
    this.data.imgList.splice(index, 1)
    this.setData({
      imgList: this.data.imgList
    })
    let choosedIndex = this.data.selectedIndex > index ? this.data.selectedIndex - 1 : (index == 0 ? 0 : this.data.selectedIndex)
    this.setData({
      selectedIndex: choosedIndex
    })
    this.showEdit(choosedIndex)
  }),
  //取消照片上传
  cancelImg: co.wrap(function*() {
    app.cancelUpload = true
    this.setData({
      showProcess: false
    })
  }),
})
