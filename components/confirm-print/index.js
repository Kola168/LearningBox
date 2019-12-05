import storage from '../../utils/storage'

/**
 * confrimModal组件
 *
 * 组件属性列表
 * @param {Object} modal               弹窗填充数据
 *    @param {Boolean} isShow 是否显示modal
 *    @param {String} title 标题
 *    @param {String} image 确认图
 *    @param {String} content 内容
 *    @param {Boolean} hasCancel 是否显示取消按钮
 *    @param {String} cancelText 取消按钮文案
 *    @param {String} confirmText 确认按钮文案
 */


Component({
  properties: {
    modal: {
      type: Object,
      value: null
    },
  },
  data: {
    hideConfirmPrintBox: false
  },
  ready() {
    let hideConfirmPrintBox = storage.get('hideConfirmPrintBox')
    this.setData({
      hideConfirmPrintBox: hideConfirmPrintBox ? true : false
    })
  },
  methods: {
    handleConfirmPrintBox() {
      this.setData({
        hideConfirmPrintBox: !this.data.hideConfirmPrintBox
      })
      storage.put('hideConfirmPrintBox', hideConfirmPrintBox)
    },
    tapModal() {
      return
    },
    hideModal() {
      this.setData({
        ['modal.isShow']: false
      })
    },
    clickConfirm() {
      this.setData({
        ['modal.isShow']: false
      })
      this.triggerEvent('confirm')
    },
    clickCancel() {
      this.setData({
        ['modal.isShow']: false
      })
      this.triggerEvent('cancel')
    }
  }
})