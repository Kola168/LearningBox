// pages/print_doc/duplicate/index.js
const app = getApp();

Page({
  data: {
    cardList: [{
        name: '户口本复印',
        key: 'n_hr',
        src: 'https://cdn.gongfudou.com/miniapp/ec/doc_copy_household.png'
      },
      {
        name: '银行卡复印',
        key: 'bc',
        src: 'https://cdn.gongfudou.com/miniapp/ec/doc_bank_card.png'
      },
      {
        name: '营业执照',
        key: 'bl',
        src: 'https://cdn.gongfudou.com/miniapp/ec/doc_copy_license.png'
      },
      {
        name: '驾驶证/行驶证复印',
        key: 'dl',
        src: 'https://cdn.gongfudou.com/miniapp/ec/doc_copy_driverlicense.png'
      }
    ]
  },
  onShareAppMessage() {
    return app.share
  }
})