// pages/print_photo_doc/choose.js
"use strict"
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav,
  storage,
  logger
} from '../../utils/common_import'
import {
  uploadFiles
} from '../../utils/upload'
const imginit = require('../../utils/imginit')

const showModal = util.promisify(wx.showModal)
const request = util.promisify(wx.request)
import event from '../../lib/event/event'

const chooseCtx = {
  data: {
    showArea: false,
    showIndex: true,
    popWindow: false,
    mediumRecommend: '',
    share: app.galleryShare,
    images: [],
    canUseProgressBar: true, //判断进度条是否可用
    uploadImg: false, //上传进度条显示、隐藏
    percent: 0, //进度条百分比
    count: 0, //每次上传张数
    chooseCount: 0, // 用户选择的数量
    realCount: 0, //图片渲染前计数
    completeCount: 0, //每次上传完成数
    allCount: 0, //当前可打印图片总数
    maxCount: 8, //最大数量限制
    preAllCount: 0, //上一次所选图片数量
    //是否过滤掉了大/小图
    //显示图片过滤提示
    showInterceptModal: false,
    //图片选择器
    popWindow: false,
    media_size: {
      pic2doc: { //a4尺寸
        width: 2520,
        height: 3564,
        noRotateMin: '/resize,h_800/auto-orient,1/resize,m_mfit,h_282,w_200/quality,Q_85/format,jpg'
      }
    },
    showConfirmModal: null,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      title: '请正确放置A4打印纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_a4_new.png'
    }
  },
  onLoad: function(options) {
    this.longToast = new app.weToast()
    this.query = options || {}
    this.initUseArea()
    event.on('setPreData', this, (postData) => {
      this.setPostData(postData)
    })
  },
  onShow: function() {
    let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
    this.needToDelete = [] //长宽比大于5，最后统一删除
  },
  // 初始化当前区域信息
  initUseArea: function() {
    this.media_type = 'pic2doc'
    var isNoUse = storage.get('picToDocUSeStatus') || null
    if (isNoUse) {
      this.setData({
        showArea: true,
        showIndex: false
      })
      this.initSingleArea()
      this.getStorageImages(this.media_type)
    } else {
      this.setData({
        showArea: true,
        mediumRecommend: this.media_type,
        showIndex: true
      })
      this.getSupplyBefore(this.media_type)
    }
  },
  //初始化视图区域信息
  initSingleArea: function() {
    try {
      let res = wx.getSystemInfoSync()
      let width = (res.windowWidth - 35) / 2
      let height = width / this.data.media_size[this.media_type].width * this.data.media_size[this.media_type].height
      this.setData({
        width,
        height
      })
    } catch (e) {
      console.log(e)
    }
  },
  getStorageImages: function(media_type) {
    try {
      let galleryImages = storage.get(media_type) || {
        images: [],
        allCount: 0
      }
      if (galleryImages) {
        this.setData({
          images: galleryImages.images,
          allCount: galleryImages.allCount
        })
      }
    } catch (e) {
      console.log('getStorageImages == 获取本地图片失败')
    }
  },

  toMoreEdit: function({
    currentTarget: {
      id,
      flag = false
    }
  }) {
    let image = this.data.images[id]
      // let params = {
      //   url: image.localUrl,
      //   mode: "quadrectangle",
      //   from: "pic2doc",
      //   index: id,
      //   media_type: this.media_type,
      //   isSingle: !flag,
      //   currentCount: Math.max(this.data.images.length - this.data.preAllCount, 0) //当前选择的图片总数
      // }
    wxNav.navigateTo(`/pages/print_photo_doc/edit`, {
      url: encodeURIComponent(JSON.stringify(image.localUrl)),
      mode: "quadrectangle",
      from: "pic2doc",
      index: id,
      media_type: this.media_type,
      isSingle: !flag,
      currentCount: Math.max(this.data.images.length - this.data.preAllCount, 0)
    })
  },
  previewImg: function({
    currentTarget: {
      id
    }
  }) {
    let image = this.data.images[id]
    wx.previewImage({
      current: image.afterEditUrl || image.url,
      urls: [image.afterEditUrl || image.url]
    })
  },
  changeImage() {
    if (this.data.images.length >= this.data.maxCount) {
      return showModal({
        content: '已选照片达到限定的数量，请重新选择上传',
        confirmColor: '#ffe27a',
        confirmText: "确认",
        showCancel: false
      })

    }
    if (this.data.uploadImg) {
      return
    }
    this.selectComponent("#checkComponent").showPop()
  },
  chooseImg: co.wrap(function*(e) {
    let that = this
    let res = e.detail
    try {
      let tempFiles = res.tempFiles
      let count = tempFiles.length //每次选择的数量
      let paths = [] // 所有选择的临时文件路径
      let maxSize = 20000000
      that.setData({
        count: count,
        preAllCount: that.data.images.length, //上一次所选图片数量
        chooseCount: count, //用户单次选择的数量 不是最终过滤的数量
        realCount: that.data.realCount + count,
        currentStartIndex: that.data.images.length
      })

      //过滤大于20m的图片
      tempFiles.forEach((item, index) => {
          if (item.size < maxSize) {
            paths.push(item.path)
          } else {
            that.needToDelete.push(index)
            that.setData({
              count: that.data.count - 1,
              realCount: this.data.realCount - 1
            })
          }
        })
        //显示进度弹窗
      that.setData({
        uploadImg: true
      })
      app.cancelUpload = false
      that.increaseNum = 0 // 初始化自增数量标识符
      uploadFiles(paths, co.wrap(function*(index, url) { //注意了注意了，这里的index不是下标，是计数。。。。。。。。不是从0开始哒，是从1。。。
        if (index && url) {
          yield that.getImageOrientation(url)
        } else {
          if (app.cancelUpload) {
            return
          }
          that.setData({
            uploadImg: false,
            count: 0,
            completeCount: 0,
          })
          wx.showModal({
            title: '照片上传失败',
            content: '请检查网络或稍候再试',
            showCancel: false,
            confirmColor: '#ffe27a'
          })
        }
      }), function(progress) {
        if (progress !== 'noProgress') {
          that.setData({
            percent: progress
          })
        }
      })
    } catch (e) {
      console.log(e, '-----')
    }
  }),
  cancelUpload: co.wrap(function*() {
    app.cancelUpload = true
    this.setData({
      uploadImg: false,
      count: 0,
      completeCount: 0
    })
    console.log('手动停止上传还可以继续上传张数：', this.data.countLimit)
  }),
  getImageOrientation: co.wrap(function*(url) {
    let that = this
    let imageInfo
    let index = that.data.images.length
    let image = {
      count: 1,
      isSmallImage: false
    }
    that.data.images[index] = image

    that.setData({
      images: that.data.images,
      allCount: that.data.allCount + 1,
      completeCount: that.data.completeCount + 1
    })
    try {
      that.showImage(url, index)
    } catch (e) {
      that.data.images.splice(that.data.images.length - 1, 1)
      that.setData({
        uploadImg: false,
        completeCount: 0,
        //以下，删除信息获取失败图片所占数组、数量空间
        images: that.data.images,
        allCount: that.data.allCount - 1
      })
      wx.showModal({
        title: '照片上传失败',
        content: '请检查网络或稍候再试',
        showCancel: false,
        confirmColor: '#ffe27a'
      })
    }
  }),
  showImage: co.wrap(function*(url, index) {
    let that = this
    let noRotate = this.data.media_size[this.media_type].noRotateMin
    let imaPath = yield imginit.imgInit(url, 'vertical')
    let localUrl = imaPath.imgNetPath
    let imageInfo = imaPath.imageInfo
    that.increaseNum += 1
      //大图过滤
    if (imageInfo.width / imageInfo.height > 5 || imageInfo.height / imageInfo.width > 5) {
      that.needToDelete.push(index) //追加无效图片索引
      that.setData({
        realCount: this.data.realCount - 1
      })
    } else {
      let image = {
          url: imginit.addProcess(localUrl, noRotate),
          localUrl: localUrl,
          count: 1,
          width: imageInfo.width,
          height: imageInfo.height,
          isSmallImage: false
        }
        //小图标记
      if (imageInfo.width < 600 || imageInfo.height < 600) {
        image.isSmallImage = true
      }
      that.data.images[index] = image

      that.setData({
        percent: 0,
        images: that.data.images,
      })
    }
    //最后一张图结束清空隐藏进度条
    if (that.increaseNum == that.data.chooseCount) {
      var delay = 0
      that.setData({
        uploadImg: false,
        count: 0,
        completeCount: 0
      })
      if (that.needToDelete.length) {
        delay = 2000
        var newImages = that.data.images.filter((item, index) => {
          return that.needToDelete.indexOf(index) == -1
        })
        that.setData({
          images: newImages,
          showInterceptModal: '您所上传的照片过大，请重新上传'
        })
        that.needToDelete = []
      }
      setTimeout(() => {
        that.setStorage()
        that.setData({
          showInterceptModal: false
        })
        if (that.data.images.length > that.data.currentStartIndex) { //判断图片过滤后 无新图片不进行跳转
          that.toMoreEdit({
            currentTarget: {
              id: that.data.currentStartIndex,
              flag: true
            }
          })
        }
      }, delay)
    }
  }),
  hideToast: function(e) {
    if (!this.query.gallerySource || this.query.gallerySource == 'localStorage') {
      return
    }
    this.longToast.toast()
    this.setData({
      realCount: 0
    })
  },
  errImage: function(e) {
    if (this.query.gallerySource) {
      return
    }
    let images = this.data.images
    images.splice(images.length - 1, 1)
    this.setData({
      images: images,
      allCount: this.data.allCount - 1
    })
    this.setStorage()
    console.log('某张图片渲染失败后还可以继续上传张数：', this.data.countLimit)
  },
  //减张数
  decrease: function({
    currentTarget: {
      id
    }
  }) {
    let images = this.data.images
    let item = this.data.images[id]
    if (item.count == 0) {
      return wx.showModal({
        title: '提示',
        content: '请先选中该照片',
        showCancel: false,
        confirmColor: '#ffe27a'
      })
    }
    //最少一张
    if (item.count <= 1) {
      return
    }
    this.setData({
      [`images[${id}].count`]: --images[id].count,
      allCount: this.data.allCount - 1
    })
  },
  //加张数
  increase: function({
    currentTarget: {
      id
    }
  }) {
    let images = this.data.images
    let item = this.data.images[id]
    if (item.count == 0) {
      return wx.showModal({
        title: '提示',
        content: '请先选中该照片',
        showCancel: false,
        confirmColor: '#ffe27a'
      })
    }
    //最多49张
    if (item.count > 49) {
      return wx.showModal({
        title: '提示',
        content: '每张数量最50张哦',
        showCancel: false,
        confirmColor: '#ffe27a'
      })
    }
    this.setData({
      [`images[${id}].count`]: ++images[id].count,
      allCount: this.data.allCount + 1,
    })
  },
  //删除照片
  deleteImg: co.wrap(function*({
    currentTarget: {
      id
    }
  }) {
    let images = this.data.images
    let res = yield showModal({
      title: '确认删除',
      content: '确认删除照片？',
      confirmColor: '#ffe27a'
    })
    if (!res.confirm) {
      return
    }
    let count = this.data.images[id].count
    images.splice(id, 1)
    this.setData({
      images: images,
      allCount: this.data.allCount - count,
    })
    this.setStorage()
    console.log('删除后剩余照片：', this.data.images)
  }),
  confirm: co.wrap(function*(e) {
    uploadFormId.dealFormIds(e.detail.formId, `print_${this.media_type}`)
    uploadFormId.upload()
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }
    if (app.preventMoreTap(e)) {
      return
    }

    if (this.data.uploadImg) {
      return
    }

    if (!this.data.images.length) {
      return wx.showModal({
        title: '提示',
        content: '至少选择一张照片哦',
        showCancel: false,
        confirmColor: '#ffe27a'
      })
    }
    let hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
    if (hideConfirmPrintBox) {
      this.userConfirm()
    } else {
      this.setData({
        ['confirmModal.isShow']: true
      })
    }
  }),
  getPhoneNumber: co.wrap(function*(e) {
    yield app.getPhoneNum(e)
    storage.put("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.confirm(e)
  }),
  userConfirm: co.wrap(function*(e) {
    let images = this.data.images
    let newImages = []
    let _this = this
    images.forEach((data, index) => {
      if (data.choose == undefined || data.choose == true) {
        let newImage = {
          url: imginit.mediaResize(data.localUrl, this.media_type), //原图
          number: data.count,
          color: data.color ? data.color : 'Color',
        }
        if (data.afterEditUrl) {
          newImage.pre_convert_url = data.afterEditUrl //编辑之后的图
        }
        newImages.push(newImage)
      }
      if (index === images.length - 1) {
        _this.uploadImg(newImages)
      }
    })
  }),
  uploadImg: co.wrap(function*(images) {
    // if (!app.openId) {
    //   yield this.loopGetOpenId()
    // }
    let params = {
      //   openid: app.openId,
      urls: images,
      media_type: this.media_type,
      from: 'mini_app'
    }

    console.log('订单生成参数', params)
    this.setData({
      showConfirmModal: null,
    })
    this.longToast.toast({
      type: 'loading'
    })
    try {
      const resp = yield request({
        url: app.apiServer + `/ec/v2/orders`,
        method: 'POST',
        dataType: 'json',
        data: params
      })
      console.log(resp)
      if (resp.data.code !== 0) {
        throw (resp.data)
      }

      this.longToast.toast()
      console.log('订单创建成功', resp)
      wx.redirectTo({
        url: `../finish/index?type=photo_doc&media_type=${this.media_type}&state=${resp.data.order.state}`
      })

    } catch (e) {
      this.longToast.toast()
      util.showErr(e)
    }
  }),
  //图片存储至本地
  setStorage: function() {
    try {
      storage.put(this.media_type, {
        media_type: this.media_type,
        images: this.data.images,
        allCount: this.data.images.length
      })
    } catch (e) {
      console.log('图片存储到本地失败')
    }
  },
  onHide: function() {
    this.setStorage()
  },
  onUnload: function() {
    this.setStorage()
    event.remove('setPreData', this)
  },
  /**
   * @methods设置回传参数
   * @param {String} images
   */
  setPostData: function(images) {
    this.setData({
      images
    })
  },
  //   loopGetOpenId: co.wrap(function*() {
  //     let loopCount = 0
  //     let _this = this
  //     if (app.openId) {
  //       console.log('openId++++++++++++----', app.openId)
  //       return
  //     } else {
  //       setTimeout(function() {
  //         loopCount++
  //         if (loopCount <= 100) {
  //           console.log('openId not found loop getting...')
  //           _this.loopGetOpenId()
  //         } else {
  //           console.log('loop too long, stop')
  //         }
  //       }, 2000)
  //     }
  //   }),
  toUse: function() {
    var useStatus = 'picToDocUSeStatus'
    storage.put(useStatus, true)
    this.setData({
      showIndex: false
    })
    this.initSingleArea()
  },
  onShareAppMessage: function() {
    return app.share
  }
}

Page(chooseCtx)