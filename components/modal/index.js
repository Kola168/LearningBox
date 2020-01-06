/**
 * 自定义弹出框组件
 *
 * 组件属性列表
 *
 * @param {Object} modal             { 配置对象
 *                                     isShow: false, 是否显示
 *                                     title: '', 弹窗标题
 *                                     hasCancel: false, 是否显示取消按钮
 *                                     image: '', 弹窗内容图片
 *                                     content: '', 弹窗内容文字
 *                                     slotContent: false, 是否自定义弹窗内容
 *                                     slotBottom: false, 是否自定义底部按钮
 *                                     confirmText: '', 确认按钮文字
 *                                     cancelText: '' 取消按钮文字
 *                                   }
 * @param {eventhandler} bindconfirm 点击确认按钮响应函数
 * @param {eventhandler} bindcancel  点击取消响应函数
 *
 */


Component({
  options: {
    multipleSlots: true
  },
  properties: {
    modal: {
      type: Object,
      value: null
    },
  },
  data: {
  },
  methods: {
    tapModal() {
      return;
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