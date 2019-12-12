// pages/package_feature/print_ calendar/index.js
import wxNav from '../../../utils/nav.js'

Page({

  data: {
    urls: [],
    diy: [
      'https://cdn.gongfudou.com/miniapp/ec/calendar_diy_a.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_diy_b.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_diy_c.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_diy_d.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_diy_e.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_diy_f.png',
    ],
    wood: [
      'https://cdn.gongfudou.com/miniapp/ec/calendar_solid_wood_acalendar_solid_wood_a.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_solid_wood_b.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_solid_wood_c.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_solid_wood_d.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_solid_wood_e.png',
      'https://cdn.gongfudou.com/miniapp/ec/calendar_solid_wood_f1.png',
    ],
    titleName:'',
  },
  name:{
    diy:'DIY生活台历',
    wood:'实木相框台历',
  },
  onLoad: function(options) {
    this.type=options.type
    this.setData({
      urls:this.data[this.type],
      titleName:this.name[this.type]
    })
  },
  buysth: function() {

  },
  toedit: function(e) {
    try {
      wxNav.navigateTo('/pages/package_feature/print_calendar/edit',{
        type:this.type
      })
    } catch (e) {
      console.log(e)
    }

  },
})
