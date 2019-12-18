const app = getApp()
const regeneratorRuntime = require('../../../lib/co/runtime')
const co = require('../../../lib/co/co')
const util = require('../../../utils/util')
const _ = require('../../../lib/underscore/we-underscore')
const event = require('../../../lib/event/event')
const imginit = require('../../../utils/imginit')

const chooseImage = util.promisify(wx.chooseImage)
const getImageInfo = util.promisify(wx.getImageInfo)
const showModal = util.promisify(wx.showModal)
const chooseMessageFile = util.promisify(wx.chooseMessageFile)
import router from '../../../utils/nav'
import storage from '../../../utils/storage'
import getLoopsEvent from '../../../utils/worker'
Page({
  data: {
    isFullScreen: false,
    title: '',
    tipsWindow: false,
    idType: {
      //身份证
      id: [{
        key: 'id',
        width: 1027.2,
        height: 648,
        areaWidth: 2520,
        areaHeight: 3564,
        tipText: '添加身份证正面照',
        url: null,
        name: '身份证复印',
      }, {
        key: 'id',
        width: 1027.2,
        height: 648,
        areaWidth: 2520,
        areaHeight: 3564,
        tipText: '添加身份证背面照',
        url: null,
        name: '身份证复印',
      }],
      //驾驶证
      dl: [{
        key: 'dl',
        width: 1056,
        height: 720,
        areaWidth: 2520,
        areaHeight: 3564,
        tipText: '添加行驶证或驾驶证正面',
        url: null,
        name: '驾驶证/行驶证复印',
      }, {
        key: 'dl',
        width: 1056,
        height: 720,
        areaWidth: 2520,
        areaHeight: 3564,
        tipText: '添加行驶证或驾驶证反面',
        url: null,
        name: '驾驶证/行驶证复印',
      }],
      //户口本
      n_hr: [{
        key: 'n_hr',
        width: 1056,
        height: 720,
        areaWidth: 2520,
        areaHeight: 3564,
        tipText: '添加户口本内页',
        url: null,
        name: '户口本复印',
      }, {
        key: 'n_hr',
        width: 1056,
        height: 720,
        areaWidth: 2520,
        areaHeight: 3564,
        tipText: '添加户口本内页',
        url: null,
        name: '户口本复印',
      }],
      //营业执照
      bl: [{
        key: 'bl',
        width: 2520,
        height: 3564,
        areaWidth: 2520,
        areaHeight: 3564,
        tipText: '添加营业执照',
        url: null,
        name: '营业执照',
      }],
      //身份证
      bc: [{
        key: 'bc',
        width: 1056,
        height: 720,
        areaWidth: 2520,
        areaHeight: 3564,
        tipText: '添加银行卡正面照',
        url: null,
        name: '银行卡复印',
      }, {
        key: 'bc',
        width: 1056,
        height: 720,
        areaWidth: 2520,
        areaHeight: 3564,
        tipText: '添加银行卡背面照',
        url: null,
        name: '银行卡复印',
      }]
    },
    select_icon: '/images/radio_on.png',
    no_select_icon: '/images/radio_off.png',
    watermark: [{
        key: 'define',
        is_select: false,
        mark_k: 'only_for'
      },
      {
        key: 'default',
        is_select: false,
        mark_k: 'only_time'
      }
    ],
    type: '', //选择的证件照type
    typeInfo: [], //选择的证件照尺寸信息
    checkedIndex: 0, //选择中的下标
  },

  checkedIndex: 0, //选中的上传图片下标
  onLoad: co.wrap(function* (options) {
    var _this = this
    _this.longToast = new app.weToast()
    let opt_types = options.type;
    _this.setData({
      isFullScreen: app.isFullScreen,
      type: opt_types,
      typeInfo: _this.data.idType[opt_types],
      title: _this.data.idType[opt_types][0].name
    })

    event.on('card_url_data', _this, (data) => {
      data && _this.synthesis(data);
    })
  }),

  chooseImage: co.wrap(function* (e) {
    this.checkedIndex = Number(e.currentTarget.dataset.index)
    this.setData({
      checkedIndex: this.checkedIndex
    })

    if (this.data.type == 'id') {
      var showIdTip = storage.get('showIdTip' + this.checkedIndex)
      
      if (showIdTip == 'showed') {
        this.setData({
          tipsWindow: false
        })
        this.selectComponent("#checkComponent").showPop()
      } else {
        this.setData({
          tipsWindow: true
        })
      }
    } else {
      this.selectComponent("#checkComponent").showPop()
    }
  }),

  chooseImg: co.wrap(function*(e) {
    let res = e.detail
    let tempFiles = res.tempFiles
    this.toEditImg([tempFiles[0].path || tempFilePaths[0] || tempFilePaths])
  }),

  selectIndex(e) {
    try {
      let params = ['img_top', 'img_bottom']
      let {
        index
      } = e.currentTarget.dataset;
      let imgArr = _.pluck(this.data.typeInfo, 'url')
      params = Object.assign({}, _.object(params, imgArr));
      if (_.isEmpty(params.img_top) && _.isEmpty(params.img_bottom)) {
        return wx.showModal({
          title: '提示',
          content: '请先上传照片',
          showCancel: false,
          confirmColor: '#fae100'
        })
      }
      this.setData({
        [`watermark[${index}].is_select`]: !this.data.watermark[index].is_select
      })
    } catch (err) {
      throw err
    }

  },

  toChooseImg() {
    storage.put('showIdTip' + this.checkedIndex, 'showed')
    this.setData({
      tipsWindow: false,
    })
    this.selectComponent("#checkComponent").showPop()
  },

  toEditImg(tempFilePaths) {
    const images = encodeURIComponent(JSON.stringify(tempFilePaths))
    router.navigateTo('/pages/print_doc/duplicate_edit/duplicate_edit', {
      images: images,
      type: 'upload'
    })
    
    this.setData({
      toEdit: true,
    })
  },

  deleteImg({
    currentTarget: {
      dataset: {
        index
      }
    }
  }) {
    this.data.typeInfo[index].url = null
    this.data.typeInfo[index].params = null
    this.setData({
      typeInfo: this.data.typeInfo
    })
  },

  toEdit({
    currentTarget: {
      dataset: {
        index
      }
    }
  }) {
    this.checkedIndex = index;
    this.data.toEdit = true;
    const images = encodeURIComponent(JSON.stringify(this.data.typeInfo[index]))

    router.navigateTo('/pages/print_doc/duplicate_edit/duplicate_edit', {
      images: images,
      type: 'edit'
    })
  },

  // 选择百度
  chooseBaiduImg ({detail}) {
    const images = encodeURIComponent(JSON.stringify({
      localUrl: detail[0].url
    }))
    router.navigateTo('/pages/print_doc/duplicate_edit/duplicate_edit', {
      images,
      type: 'edit'
    })
  },

  synthesis: co.wrap(function* (param) {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后'
    })
    let img = param.url
    try {
      let imageInfo = yield getImageInfo({
        src: img
      })
      let modeWidth = this.data.typeInfo[this.checkedIndex].width
      let modeHeight = this.data.typeInfo[this.checkedIndex].height
      if (modeWidth > modeHeight) {
        if (imageInfo.width < imageInfo.height) {
          img = imginit.addProcess(img, '/rotate,270')
        }
      } else {
        if (imageInfo.width > imageInfo.height) {
          img = imginit.addProcess(img, '/rotate,90')
        }
      }

      var editImg = `typeInfo[${this.checkedIndex}].url`;
      var originUrl = `typeInfo[${this.checkedIndex}].originUrl`;
      var localUrl = `typeInfo[${this.checkedIndex}].localUrl`; //原始上传图片
      this.setData({
        [editImg]: img,
        [originUrl]: param.originUrl,
        [localUrl]: param.localUrl,
      })
      this.longToast.hide()
    } catch (e) {
      logger.info(e)
      this.longToast.hide()
      wx.showModal({
        title: '提示',
        content: '图片合成失败',
        showCancel: false,
        confirmColor: '#fae100'
      })
    }

  }),

  //两个图片进行合成
  confirm: co.wrap(function* (e) {
    if (app.preventMoreTap(e)) {
      return
    }
    try {
      let params = ['img_top', 'img_bottom'];
      let imgArr = _.pluck(this.data.typeInfo, 'url')
      _.each(imgArr, function (value, index, list) {
        if (value) {
          list[index] = imginit.mediaResize(value, 'copy')
        }
      })
      const newWaterMark = this.data.watermark.filter(item => item.is_select);
      const all_checked = (newWaterMark.length > 1) && {
        watermark_type: 'time_for'
      };
      const watermark_type = newWaterMark.length ? (all_checked || {
        watermark_type: newWaterMark[0]['mark_k']
      }) : {};

      params = Object.assign({}, _.object(params, imgArr), {
        id_type: this.data.type
      }, watermark_type);

      if (_.isEmpty(params.img_top) && _.isEmpty(params.img_bottom)) {
        return  wx.showModal({
          title: '提示',
          content: '至少选择一张照片哦',
          showCancel: false,
          confirmColor: '#fae100'
        })
      }
      let del = yield showModal({
        title: '确认打印',
        content: '为了防止图片被过度裁剪（例如头部被裁剪），请确认您已经预览过所有图片',
        confirmColor: '#fae100',
        confirmText: "确认打印",
        cancelText: "返回预览",
      })
      if (!del.confirm) return
      this.longToast.toast({
        type: 'loading',
        title: '请稍后',
      })
      try {
        getLoopsEvent({
          feature_key: 'reprography',
          worker_data: params
        }, (resp)=>{
          if (resp.status == 'finished') {
            this.longToast.hide()
            let url = encodeURIComponent(imginit.addProcess(resp.data.url, '/resize,h_600'))
            router.redirectTo('/pages/print_doc/duplicate_preview/duplicate_preview', {
              preUrl: url,
              url: encodeURIComponent(resp.data.url)
            })
          }
        }, ()=>{
          this.longToast.hide()
        })
      } catch (err) {
        logger.info(err)
        this.longToast.hide()
        util.showError(err)
      }
    } catch (err) {
      logger.info(err)
    }
  }),

  onShareAppMessage: function () {
    return app.share
  }
})