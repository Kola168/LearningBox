// pages/print_photo/photolist.js
const app = getApp()
const regeneratorRuntime = require('../../lib/co/runtime')
const co = require('../../lib/co/co')
const _ = require('../../lib/underscore/we-underscore')
const util = require('../../utils/util')
const upload = require('../../utils/upload')
const imginit = require('../../utils/imginit')
const event = require('../../lib/event/event')

const showModal = util.promisify(wx.showModal)

import wxNav from '../../utils/nav.js'
import storage from '../../utils/storage.js'
import gql from '../../network/graphql_request'
import commonRequest from '../../utils/common_request'


let Loger = (app.apiServer != 'https://epbox.gongfudou.com' || app.deBug) ? console.log : function() {}

Page({


  //介质信息
  mediaInfo: {
    pic_in6: {
      name: '6寸照片',
      size: {
        width: 1300,
        height: 1950,
        shrinksize: '/resize,m_fill,h_300,w_200,limit_0/quality,Q_85/format,jpg',
      }
    },
    pic_in5: {
      name: '5寸照片',
      size: {
        width: 1092,
        height: 1560,
        shrinksize: '/resize,m_fill,h_285,w_200,limit_0/quality,Q_85/format,jpg',
      }
    },
    pic_in7: {
      name: '7寸照片',
      size: {
        width: 1560,
        height: 2184,
        shrinksize: '/resize,m_fill,h_280,w_200,limit_0/quality,Q_85/format,jpg',
      }
    },
    pic_a4: {
      name: 'a4照片',
      size: {
        width: 2520,
        height: 3564,
        shrinksize: '/resize,m_fill,h_282,w_200,limit_0/quality,Q_85/format,jpg',
      }
    },
    lomo: {
      name: 'lomo照片',
      size: {
        width: 874,
        height: 1240,
        shrinksize: '/resize,m_fill,h_310,w_219,limit_0/quality,Q_85/format,jpg',
      }
    }
  },

  data: {
    photoMedia: {},
    photoList: [], //照片列表
    mediaInfo: {}, //尺寸信息
    limitPhoto: 18, //照片限制张数
    addBoxHeight: 0, //最后添加图片方块高度
    completeCount: 0, //单次上传目标个数
    count: 0, //单次上传总个数
    percent: 0, //单次上传进度条进程
    errTip: '',
    butHigh: false,
    showMode: false, //是否展示模板
    showCover: false, //是否展示蒙层
    confirmModal: {},
  },

  smallImgDelete: false,
  onLoad: function(options) {
    Loger(options)
    this.longToast = new app.weToast()
    this.mediaType = options.mediaType
    this.setData({
      photoMedia: this.mediaInfo[this.mediaType],
      showMode: JSON.parse(options.showMode)
    })
    this.initSingleArea()
    this.getStorageImages()
    if (app.isFullScreen) {
      this.setData({
        butHigh: true
      })
    }
    this.checkStorage()
    event.on('setPreData', this, (postData) => {
      this.editPhoto(postData)
    })
  },

  checkStorage() {
    let mediaCover = ''
    try {
      mediaCover = storage.get(`${this.mediaType}_cover`)
    } catch (e) {
      Loger(e)
    }
    if (mediaCover != 'showed' && this.mediaType!='pic_in7' && this.mediaType!='pic_a4') {
      this.setData({
        showCover: true
      })
      storage.put(`${this.mediaType}_cover`, 'showed')
    }
  },

  closeCover: function() {
    this.setData({
      showCover: false
    })
  },

  showImgCheck: function() {
    let restCount = this.data.limitPhoto - this.data.photoList.length
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
    Loger(e)
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
        this.smallImgDelete = false
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

  baiduprint:co.wrap(function*(e){
    Loger(e)
    let that=this
    let files=e.detail
    this.setData({
      showProcess: true,
      count: files.length
    })
    _.each(files,function(value,index,list){
      index+=1
      that.showImage(value.url,index)
      that.setData({
        completeCount: index
      })
    })
  }),

  //展示图片
  showImage: co.wrap(function*(url, index) {
    try {
      let image
      let that = this
      let imaPath = yield imginit.imgInit(url, 'vertical')
      let localUrl = imaPath.imgNetPath
      let imageInfo = imaPath.imageInfo
      //大图过滤
      if (imageInfo.width / imageInfo.height > 5 || imageInfo.height / imageInfo.width > 5) {
        if (index == that.data.count) {
          that.setData({
            errTip: '已为您过滤部分不适合打印的照片（长宽比大于5)'
          })
          setTimeout(function() {
            that.setData({
              showProcess: false
            })
          }, 5000)
        }
        this.smallImgDelete = true
        return
      }

      image = {
        url: localUrl,
        localUrl: localUrl,
        number: 1,
        width: imageInfo.width,
        height: imageInfo.height,
        isSmallImage: false
      }
      //小图标记
      if (imageInfo.width < 600 || imageInfo.height < 600) {
        image.isSmallImage = true
      }
      Loger(image)
      this.data.photoList.push(image)
      Loger(this.data.photoList)
      this.setData({
        photoList: this.data.photoList
      })
      //最后一张图结束清空隐藏进度条
      if (index == that.data.count) {
        that.setData({
          showProcess: false
        })
        this.setStorage()
        if (this.smallImgDelete) {
          that.setData({
            showProcess: true,
            errTip: '已为您过滤部分不适合打印的照片（长宽比大于5)'
          })
          setTimeout(function() {
            that.setData({
              showProcess: false
            })
          }, 5000)
        }
        Loger('***图片处理结束，所有照片：***', that.data.photoList)
      }
    } catch (e) {
      Loger(e)
    }
  }),

  //减少张数
  decrease: function(e) {
    let index = e.currentTarget.dataset.index
    let img = this.data.photoList[index]
    if (img.number < 2) {
      return
    }
    img.number--
    this.setData({
      [`photoList[${index}]`]: img
    })
  },

  increase: function(e) {
    let index = e.currentTarget.dataset.index
    let img = this.data.photoList[index]
    if (img.number > 98) {
      return wx.showModal({
        title: '提示',
        content: '每张数量最多99张哦',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
    }
    img.number++
    this.setData({
      [`photoList[${index}]`]: img
    })
  },

  //取消照片上传
  cancelImg: co.wrap(function*() {
    app.cancelUpload = true
    this.setData({
      showProcess: false
    })
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
    this.data.photoList.splice(index, 1)
    this.setData({
      photoList: this.data.photoList
    })
  }),

  toEdit: function(e) {
    let index = e.currentTarget.dataset.index
    Loger(this.data.photoMedia)
    wxNav.navigateTo('/pages/print_photo/edit', {
      imgInfo: encodeURIComponent(JSON.stringify(this.data.photoList[index])),
      index: index,
      photoMedia: encodeURIComponent(JSON.stringify(this.data.photoMedia.size)),
      mediaType: this.mediaType,
      showMode: JSON.stringify(this.data.showMode)
    })
  },

  confOrder: function() {
    if (this.data.photoList.length == 0) {
      return wx.showModal({
        title: '提示',
        content: '至少选择一张照片哦',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
    }
    this.setData({
      confirmModal: {
        isShow: true,
        title: '请参照下图正确放置照片纸',
        image: 'https://cdn-h.gongfudou.com/LearningBox/main/confirm_print.png'
      },
    })
  },

  makeOrder: co.wrap(function*() {
    try{
      this.longToast.toast({
        type: "loading",
      })
      let that=this
      let imgs = []
      _.each(this.data.photoList,function(value,index,list){
        if(value.editImg){
          imgs[index]={
            originalUrl:value.localUrl,
            printUrl:value.url,
            copies:value.number
          }
        }else{
          imgs[index]={
            originalUrl:value.localUrl,
            printUrl:imginit.mediaResize(value.localUrl,that.mediaType),
            copies:value.number
          }
        }

      })
      let resp = yield commonRequest.createOrder(this.mediaType, imgs)
      wxNav.navigateTo(`pages/finish/index`, {
        media_type: this.mediaType,
        state:resp.createOrder.state
      })
      this.longToast.toast()
      storage.remove(this.mediaType)
    }catch(e){
      Loger(e)
      this.longToast.toast()
      util.showError(e)
    }
  }),



  setStorage: function() {
    //图片存储至本地
    try {
      storage.put(this.mediaType, {
        photoList: this.data.photoList
      })
    } catch (e) {
      Loger('图片存储到本地失败')
    }
  },

  getStorageImages: function() {
    try {
      let galleryImages = storage.get(this.mediaType)
      Loger(galleryImages)
      if (galleryImages) {
        this.setData({
          photoList: galleryImages.photoList,
        })
      }
    } catch (e) {
      Loger('获取本地图片失败')
    }
  },

  editPhoto: function(postData) {
    this.longToast.toast({
      type: "loading",
    })
    this.setData({
      [`photoList[${postData.index}].url`]: postData.url,
      [`photoList[${postData.index}].editImg`]: true,
    })
    this.longToast.toast()
  },

  onUnload: function() {
    event.remove('setPreData', this)
  },

  //计算最后添加照片的高度
  initSingleArea: function() {
    try {
      let width = 340
      let height = width / this.data.photoMedia.size.width * this.data.photoMedia.size.height + 60
      this.setData({
        addBoxHeight: height
      })
    } catch (e) {
      Loger(e)
    }
  },
})
