const app = getApp()
import router from '../../../utils/nav'
Page({
  data: {
    platform: 'ios',
    imgList: [],
    imgArr: {
      qq: [
        [
          'https://cdn.gongfudou.com/miniapp/ec/doc_qq33.jpeg',
          'https://cdn.gongfudou.com/miniapp/ec/doc_qq44.jpeg',
          'https://cdn.gongfudou.com/miniapp/ec/doc_qq55.jpeg'
        ],
        [
          'https://cdn.gongfudou.com/miniapp/ec/doc_qq_android.png'
        ]
      ],
      email: [
        'https://cdn.gongfudou.com/miniapp/ec/doc_email11.png',
        'https://cdn.gongfudou.com/miniapp/ec/doc_email22.png'
      ],
      wps: [
        'https://cdn.gongfudou.com/miniapp/ec/doc_wps11.png',
        'https://cdn.gongfudou.com/miniapp/ec/doc_wps22.png'
      ]
    }
  },

  onLoad: function (query) {
    let type = query.type;
    let platform = this.data.platform;
    let imgArr = this.data.imgArr;
    let imgList = imgArr[type];
    if (type === 'qq') {
      let systemInfo = wx.getSystemInfoSync();
      platform = systemInfo.platform;
      imgList = platform === 'ios' ? imgArr[type][0] : imgArr[type][1];
    }
    this.setData({
      type: type,
      imgList: imgList,
      platform: platform
    })
  },
  
  localPrint: function () {
    let web_url = `${app.apiServer}/web/file_select/epbox_qq?openid=${app.openId}`;
    router.navigateTo('/pages/webview/index', {
      url: encodeURIComponent(web_url)
    })
  }
})