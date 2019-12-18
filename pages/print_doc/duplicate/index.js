// pages/print_doc/duplicate/index.js
const app = getApp();
import router from '../../../utils/nav'
Page({
  data: {
    cardList: [{
        name: '户口本复印',
        key: 'n_hr',
        src: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_copy_household.png'
      },
      {
        name: '银行卡复印',
        key: 'bc',
        src: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_bank_card.png'
      },
      {
        name: '营业执照',
        key: 'bl',
        src: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_copy_license.png'
      },
      {
        name: '驾驶证/行驶证复印',
        key: 'dl',
        src: 'https://cdn-h.gongfudou.com/LearningBox/main/doc_copy_driverlicense.png'
      }
    ]
  },

  toNavCard () {
    router.navigateTo('/pages/print_doc/duplicate_idcard/duplicate_idcard', {
      type: "id"
    })
  },
  
  toNav ({currentTarget: {dataset: {item}}}) {
    router.navigateTo('/pages/print_doc/duplicate_idcard/duplicate_idcard', {
      type: item.key
    })
  },
  onShareAppMessage() {
    return app.share
  }
})