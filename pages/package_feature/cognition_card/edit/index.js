const app = getApp()
import { regeneratorRuntime, co, util, wxNav, storage } from '../../../../utils/common_import'
const getImageInfo = util.promisify(wx.getImageInfo)
const getSystemInfo = util.promisify(wx.getSystemInfo)
const showModal = util.promisify(wx.showModal)
const getFileInfo = util.promisify(wx.getFileInfo)
import api from '../../../../network/restful_request'
const MAXSIZE = 20000000
const MAX_NAME_BYTE = 8
Page({
  data: {
    area: {},
    showModal: false,
    stepView: false,
    showGuide: false,
    printModal: false,
    type: '',
    localImgPath: '',
    originalUrl: '',
    imgInfo: null,
    cardName: '',
    loadReady: false,
    printerAlias: '3nfe8xk3b6vew',
    appId: 'wxde848be28728999c',
    shopId: 24056376,
    hasAuthPhoneNum: false,
    confirmModal: {
      isShow: false,
      hasCancel: true,
      cancelText: '选购相纸',
      confirmText: '开始制作',
      title: '打印前请选择LOMO相纸',
      image: 'https://cdn.gongfudou.com/miniapp/ec/confirm_print_lomo.png'
    }
  },
  onLoad: co.wrap(function*(query) {
    let type = query.type,
      id = query.templateId,
      hasEdit = query.hasEdit == 1 ? true : false //是否已编辑
    this.hasEdit = hasEdit
    this.templateId = id
    this.path = query.editUrl
    if (hasEdit) {
      this.index = query.index
    }
    yield this.getTemplateInfo(id, type)
    yield this.initArea(type)
      // 半自定义
    if (type === 'template') {
      let hasViewTplEdit = storage.get('hasViewTplEdit')
      if (!hasViewTplEdit) {
        this.drawGuideView()
      }
      // 自定义
    } else if (type === 'custom') {
      if (hasEdit) {
        this.setData({
          cardName: query.cardName
        })
      }
      let hasViewCustomEdit = storage.get('hasViewCustomEdit')
      if (!hasViewCustomEdit) {
        this.setData({
          showModal: true,
          stepView: true
        })
      }
    }
  }),
  onShow: function() {
    let hasAuthPhoneNum = Boolean(storage.get('hasAuthPhoneNum'))
    this.hasAuthPhoneNum = hasAuthPhoneNum
    this.setData({
      hasAuthPhoneNum: app.hasPhoneNum || hasAuthPhoneNum
    })
  },
  drawGuideView() {
    let query = wx.createSelectorQuery()
    query.select('#guide-view').boundingClientRect()
    query.exec(res => {
      let temp = res[0]
      let guidePosition = {
        width: temp.width,
        height: temp.height,
        left: temp.left - 12,
        top: temp.top - 12
      }
      this.setData({
        guidePosition: guidePosition,
        showGuide: true,
        showModal: true
      })
    })
  },

  toShopping: function(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    wxNav.navigateTo(`/pages/cart/transit/transit?pageType=goodsDetail&goodsId=${this.data.printerAlias}&openId=${app.openId}&shopId=${this.data.shopId}&appId=${this.data.appId}`)
  },

  // 初始化整体模板布局
  initArea: co.wrap(function*(type) {
    const res = yield getSystemInfo()
      // 计算模板宽高位置
    const avaWidth = res.windowWidth
      // 可用高度=窗口高度-底部导航栏高度
    const avaHeight = res.windowHeight - 500 * (avaWidth / 750)
    let areaHeight, areaWidth
    let margin = avaWidth * 0.035
    let designAreaMaxWidth = avaWidth - 2 * margin
    let designAreaMaxHeight = avaHeight - 2 * margin
    let scale = this.data.area.width / this.data.area.height
    if (this.data.area.width <= this.data.area.height) {
      areaHeight = designAreaMaxHeight
      areaWidth = designAreaMaxHeight * scale
        // 修正
      if (areaWidth > designAreaMaxWidth) {
        areaHeight = areaHeight * (designAreaMaxWidth / areaWidth)
        areaWidth = designAreaMaxWidth
      }
    } else {
      areaWidth = designAreaMaxWidth
      areaHeight = designAreaMaxWidth / scale
        // 修正
      if (areaHeight > designAreaMaxHeight) {
        areaWidth = areaWidth * (designAreaMaxHeight / areaHeight)
        areaHeight = designAreaMaxHeight
      }
    }
    const areaPosition = {
      width: areaWidth,
      height: areaHeight,
      top: (designAreaMaxHeight - areaHeight) / 2 + margin + 100 * (avaWidth / 750),
      left: (designAreaMaxWidth - areaWidth) / 2 + margin,
      scale: areaWidth / this.data.area.width
    }
    this.setData({
      areaPosition: areaPosition
    })
    try {
      if (type === 'template' || this.hasEdit) {
        let path = this.path
        let imgInfo = yield getImageInfo({
          src: path
        })

        this.setData({
          imgInfo: imgInfo,
          localImgPath: path
        })
        this.originalUrl = path
      }
      this.setData({
        loadReady: true
      })
    } catch (err) {
      console.error(err)
    }
  }),
  // 初始化编辑器
  initDesign: co.wrap(function*(e) {
    wx.hideLoading()
    if (e != undefined) {
      // 获取图片信息bug，这里通过load重新获取长宽信息
      if (this.data.imgInfo.width != e.detail.width) {
        this.setData({
          imgInfo: {
            width: e.detail.width,
            height: e.detail.height
          }
        })
      }
    }
    // 显示、实际缩放比
    this.editorScale = this.data.areaPosition.width / this.data.area.width
      // 初始化位置
    let sv
    let imgX
    let imgY
    sv = util._getSuiteValues(
      this.data.imgInfo.width,
      this.data.imgInfo.height,
      this.data.area.area_width * this.editorScale,
      this.data.area.area_height * this.editorScale
    )

    imgX = this.data.area.area_x * this.editorScale + sv.left - (this.data.imgInfo.width - sv.width) / 2
    imgY = this.data.area.area_y * this.editorScale + sv.top - (this.data.imgInfo.height - sv.height) / 2
    let imgScale = sv.scale.toFixed(3)
    let imgRotate = 0
    this.moveX = imgX
    this.moveY = imgY
    this.scale = imgScale
    this.rotate = imgRotate
    this.twoPoint = false
    this.currentPoint = 0
    const userImgPosition = {
      x: imgX,
      y: imgY,
      scale: imgScale,
      rotate: imgRotate,
    }
    this.setData({
      userImgPosition: userImgPosition,
      realScale: imgScale,
      realRotate: imgRotate
    })
  }),
  // 合成认知卡
  cognitionCompound: co.wrap(function*() {
    wx.showLoading({
      title: '请稍等',
      mask: true
    })
    try {
      let redressInfo = yield this.redress()
      let params = {
        openid: app.openId,
        template_id: this.templateId,
        image_url: this.originalUrl,
        x: redressInfo.x,
        y: redressInfo.y,
        rotate: redressInfo.rotate,
        scale: redressInfo.scale,
        editor_scale: this.editorScale,
        image_width: this.data.imgInfo.width,
        account: 'wechat_miniapp',
      }
      if (this.data.type === 'custom') {
        params.text = this.data.cardName
      }
      let resp = yield api.cognitionCompound(params)
      if (resp.code !== 0) {
        throw (resp)
      }
      wx.hideLoading()
      let result = resp.res,
        type = this.data.type
      this.compoundUrl = result.url
      if (type === 'custom') {
        let storageImgs = wx.getStorageSync('literacy_card') || []
        let currentImg = {
          previewUrl: result.preview_url,
          url: result.url,
          editUrl: this.originalUrl,
          templateId: this.templateId,
          type: type,
          cardName: this.data.cardName
        }
        if (this.hasEdit) {
          storageImgs.splice(this.index, 1, currentImg)
        } else {
          storageImgs.push(currentImg)
        }
        storage.put('literacy_card', storageImgs)
        wxNav.redirectTo(`../list/list`, {
          isFull: 0,
          id: this.templateId
        })
      } else {
        let hideConfirmPrintBox = Boolean(storage.get("hideConfirmPrintBox"))
        if (hideConfirmPrintBox) {
          this.print()
        } else {
          this.setData({
            ['confirmModal.isShow']: true
          })
        }
      }
    } catch (error) {
      wx.hideLoading()
      util.showErr(error)
    }
  }),
  // 检查提交参数
  preCheck: co.wrap(function*(e) {
    if (app.preventMoreTap(e)) {
      return
    }
    if (!this.hasAuthPhoneNum && !app.hasPhoneNum) {
      return
    }
    let type = this.data.type,
      tipFlag = null,
      contentText = ''
      // 自定义
    if (type === 'custom') {
      let noImg = !Boolean(this.data.localImgPath),
        cardName = this.data.cardName.trim(),
        stringByte = util.getStringByte(cardName)
      tipFlag = noImg || cardName === '' || stringByte > MAX_NAME_BYTE
      if (noImg && cardName === '') {
        contentText = '没有内容的认知卡无法打印哦'
      } else if (noImg) {
        contentText = '没有图片的认知卡无法打印哦'
      } else if (cardName === '') {
        contentText = '没有文字的认知卡无法打印哦'
      } else if (stringByte > MAX_NAME_BYTE) {
        contentText = '内容过长，超出部分不显示哦'
      }
      // 模版
    } else {
      tipFlag = !Boolean(this.data.localImgPath)
      contentText = '请上传照片才能打印哦'
    }
    if (tipFlag) {
      wx.hideLoading()
      yield showModal({
        title: '重要提示',
        content: contentText,
        showCancel: false,
        confirmText: '确认',
        confirmColor: '#FFE27A'
      })
      return false
    }
    this.cognitionCompound()
  }),
  getPhoneNumber: co.wrap(function*(e) {
    yield app.getPhoneNum(e)
    wx.setStorageSync("hasAuthPhoneNum", true)
    this.hasAuthPhoneNum = true
    this.setData({
      hasAuthPhoneNum: true
    })
    this.preCheck()
  }),
  print: co.wrap(function*() {
    wx.showLoading({
      title: '请稍等',
      mask: true
    })
    try {
      let imgs = [{
        url: this.compoundUrl,
        pre_convert_url: this.compoundUrl,
        number: 1
      }]
      let resp = yield api.printInvoice(app.openId, 'literacy_card', imgs)
      if (resp.code !== 0) {
        throw (resp)
      }
      wx.hideLoading()
      wxNav.redirectTo(`../../../../finish/index`, {
        type: 'sticker',
        media_type: 'literacy_card',
        state: resp.order.state,
        type: 'literacy_card'
      })
    } catch (error) {
      wx.hideLoading()
      util.showErr(error)
    }
  }),
  // 删除选择的图片
  deleteImg: co.wrap(function*() {
    let result = yield showModal({
      title: '提示',
      content: '确认删除？',
      confirmColor: '#FFE27A'
    })
    if (result.confirm) {
      this.setData({
        image: null,
        localImgPath: null
      })
    }
  }),
  // 显示上传图片方式
  showImgChooseWay() {
    this.selectComponent("#checkComponent").showPop()
      // let imgs = yield chooseImgWay()
      // let path = imgs[0].path || imgs[0]
      // let imageInfo = yield this.checkImgSize(path)
      // yield this.uploadImage(path, imageInfo)
  },

  // 选择图片回调
  chooseImg: co.wrap(function*(e) {
    let tempFiles = e.detail.tempFiles
    let imageInfo = yield this.checkImgSize(tempFiles[0])
    yield this.uploadImage(tempFiles[0], imageInfo)
  }),

  checkImgSize: co.wrap(function*(path) {
    let imageInfo = yield getImageInfo({
      src: path
    })
    let file = yield getFileInfo({
      filePath: path
    })
    const codition1 = (file && file.size > MAXSIZE)
    const codition2 = (imageInfo.width / imageInfo.height > 5) || (imageInfo.height / imageInfo.width > 5)
    if (codition1) {
      yield showModal({
        title: '照片上传失败',
        content: '照片不能大于20M',
        showCancel: false,
        confirmColor: '#2086ee'
      })
      return
    } else if (codition2) {
      yield showModal({
        title: '照片上传失败',
        content: '照片长宽比不能大于5',
        showCancel: false,
        confirmColor: '#2086ee'
      })
      return
    } else {
      return imageInfo
    }
  }),
  getTemplateInfo: co.wrap(function*(id, type) {
    wx.showLoading({
      title: '请稍等',
      mask: true
    })
    try {
      let resp = yield api.getCognitionTplInfo(app.openId, id)
      if (resp.code !== 0) {
        throw (resp)
      }
      this.setData({
        area: resp.res,
        type: type
      })
      wx.hideLoading()
    } catch (error) {
      wx.hideLoading()
      util.showErr(error)
    }
  }),
  // 上传照片
  uploadImage: co.wrap(function*(path, imageInfo) {
    wx.showLoading({
      title: '上传中...',
      mask: true
    })
    try {
      let imageURL = yield app.newUploadImage(path)
      let imgPath = yield imginit.imgInit(imageURL, 'vertical')
      wx.hideLoading()
      this.showImage(imgPath.imageInfo, imgPath.imgNetPath)

    } catch (e) {
      yield showModal({
        title: '上传失败',
        content: '请检查您的网络，请稍后重试',
        showCancel: false,
        confirmColor: '#FFE27A'
      })
    }
  }),

  showImage: co.wrap(function*(imageInfo, url) {
    wx.showLoading({
      title: "图片加载中",
      mask: true
    })
    try {
      this.originalUrl = url
      this.setData({
        localImgPath: url,
        imgInfo: imageInfo
      })
      yield this.initDesign()
    } catch (error) {
      wx.hideLoading()
      util.showErr(error)
    }
  }),
  imageLoadError: co.wrap(function*(event) {
    wx.hideLoading()
    wx.showModal({
      title: '照片加载失败',
      content: '请重新选择',
      showCancel: false,
      confirmColor: '#fae100'
    })
  }),
  getCardName(e) {
    let cardName = e.detail.value
    this.setData({
      cardName
    })
  },
  hideModal() {
    this.setData({
      showModal: false,
      showGuide: false,
      stepView: false
    })
    if (this.data.type === 'custom') {
      storage.put('hasViewCustomEdit', true)
    } else {
      storage.put('hasViewTplEdit', true)
    }
  },
  onTouch: function(e) {
    if (this.data.localImgPath === '') return
    this.lastMoveX = 0
    this.lastMoveY = 0
    if (e.touches.length == 2) {
      // 双指操作
      this.twoPoint = true
      let xLen = Math.abs(e.touches[1].pageX - e.touches[0].pageX)
      let yLen = Math.abs(e.touches[1].pageY - e.touches[0].pageY)
      this.touchDistance = util._getDistance(xLen, yLen)
      this.touchVector = {
        x: e.touches[1].pageX - e.touches[0].pageX,
        y: e.touches[1].pageY - e.touches[0].pageY
      }
    } else {
      // 单指操作
      this.twoPoint = false
      this.touchX = e.touches[0].pageX
      this.touchY = e.touches[0].pageY
    }
  },
  onTouchMove: function(e) {
    if (this.data.localImgPath === '') return
      // 显示编辑区域边框
    this.setData({
      showAreaBorder: true
    })
    try {
      if (this.twoPoint === true) {
        // 缩放
        let xMove = Math.abs(e.touches[0].pageX - e.touches[1].pageX);
        let yMove = Math.abs(e.touches[0].pageY - e.touches[1].pageY);
        let changedDistance = util._getDistance(xMove, yMove);
        let scale = (this.data.userImgPosition.scale * changedDistance / this.touchDistance).toFixed(3)
          // 缩放最大边4096
        if (scale * this.data.imgInfo.width / this.editorScale <= 4000 && scale * this.data.imgInfo.height / this.editorScale <= 4000) {
          this.scale = scale
        }

        // 旋转
        this.changedVector = {
          x: e.touches[1].pageX - e.touches[0].pageX,
          y: e.touches[1].pageY - e.touches[0].pageY
        }
        let angel = util._getRotateAngle(this.changedVector, this.touchVector);
        this.rotate = util._snapToAngle(this.data.userImgPosition.rotate + angel, 90, 5);
        this.setData({
          realScale: this.scale,
          realRotate: this.rotate
        })
      } else {
        // 移动
        this.moveX = this.data.userImgPosition.x + e.touches[0].pageX - this.touchX - this.lastMoveX
        this.moveY = this.data.userImgPosition.y + e.touches[0].pageY - this.touchY - this.lastMoveY
        this.lastMoveX = e.touches[0].pageX - this.touchX
        this.lastMoveY = e.touches[0].pageY - this.touchY
        this.setData({
          userImgPosition: {
            x: this.moveX,
            y: this.moveY,
            scale: this.scale,
            rotate: this.rotate
          },
        })
      }
    } catch (error) {
      util.showError(error)
    }
  },
  onTouchEnd: function() {
    if (this.data.localImgPath === '') return
    this.setData({
      showAreaBorder: false,
      userImgPosition: {
        x: this.moveX,
        y: this.moveY,
        scale: this.scale,
        rotate: this.rotate
      }
    })
  },
  getResult: co.wrap(function*() {
    return {
      x: parseInt(this.data.userImgPosition.x - this.data.area.area_x * this.editorScale),
      y: parseInt(this.data.userImgPosition.y - this.data.area.area_y * this.editorScale),
      scale: parseFloat(this.data.userImgPosition.scale),
      rotate: parseInt(this.data.userImgPosition.rotate),
    }
  }),
  redress: co.wrap(function*() {
    const result = yield this.getResult()
      // 旋转修正0-360
    let rotate = result.rotate,
      imgInfo = this.data.imgInfo
    if (rotate < 0) {
      rotate = rotate + 360
    }

    // 坐标系修正
    let mp
    if (rotate == 0 || rotate == 180) {
      mp = 0
    } else if (rotate <= 90) {
      mp = Math.PI / (180 / rotate)
    } else if (rotate > 90 && rotate < 180) {
      mp = Math.PI / (180 / (180 - rotate))
    } else if (rotate > 180 && rotate < 270) {
      mp = Math.PI / (180 / (rotate - 180))
    } else if (rotate >= 270 && rotate <= 360) {
      mp = Math.PI / (180 / (360 - rotate))
    }
    // 旋转纠偏
    let svw = (imgInfo.width - result.scale * (imgInfo.width * Math.cos(mp) + imgInfo.height * Math.sin(mp))) / 2
    let svh = (imgInfo.height - result.scale * (imgInfo.width * Math.sin(mp) + imgInfo.height * Math.cos(mp))) / 2
    return {
      x: result.x + svw,
      y: result.y + svh,
      scale: result.scale,
      rotate: rotate
    }
  })
})