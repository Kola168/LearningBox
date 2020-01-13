const app = getApp()
import {
  regeneratorRuntime,
  wxNav,
  co,
  util
} from "../../../../utils/common_import"
import subjectGql from '../../../../network/graphql/subject'
const FundCharts = require('../../charts.min.js')
const RadarChart = FundCharts.radar
Page({
  data: {
    isMember: true,
    expiresAt: null,
    totalErrorBooksNum: 0,
    barData: {},
    atlasType: ''
  },
  onLoad() {
    this.weToast = new app.weToast()
    this.setData({
      canvasWidth: app.sysInfo.screenWidth - 30
    })
    this.getSubjectMemberInfo()
  },
  getSubjectMemberInfo: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield subjectGql.getSubjectMemberInfo(),
        subjectMember = res.currentUser.selectedKid.schoolAgeMember
      this.weToast.hide()
      let isMember = res.currentUser.isSchoolAgeMember,
        expiresAt = subjectMember ? subjectMember.expiresAt : ''
      this.setData({
        isMember: res.currentUser.isSchoolAgeMember,
        expiresAt: expiresAt
      })
      if (isMember || (!isMember && expiresAt)) {
        this.getSubjectsAtlas()
      }
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),
  getSubjectsAtlas: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield subjectGql.getSubjectsAtlas()
      this.atlasData = {
        title: [],
        data: []
      }
      let dataObj = {
        totalErrorBooksNum: res.xuekewang.totalErrorBooksNum,
        atlasType: 'none'
      }
      let rates = res.xuekewang.subjectRate
      for (let i = 0; i < rates.length; i++) {
        if (rates[i].questionNum > 0) {
          this.atlasData.title.push(rates[i].subjectName)
          this.atlasData.data.push(rates[i].scoringRate)
        }
      }
      if (this.atlasData.title.length > 2) {
        dataObj.atlasType = 'radar'
        this.setData(dataObj)
        this.drawRadar()
      } else if (this.atlasData.title.length > 0) {
        dataObj.atlasType = 'bar'
        let tempArr = []
        for (let i = 0; i < 2; i++) {
          tempArr.push({
            title: this.atlasData.title[i],
            rate: this.atlasData.data[i]
          })
        }
        dataObj.barData = {
          data: tempArr,
          title: "得分率"
        }
        this.setData(dataObj)
      }
      this.weToast.hide()
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),
  drawRadar() {
    let canvasWidth = this.data.canvasWidth,
      center = Math.ceil(canvasWidth / 2),
      _this = this
    const radar = new RadarChart({
      id: 'radar',
      colors: ['#4D98EC'],
      radius: center - 40,
      gridNumber: 5,
      origin: {
        x: center,
        y: center
      },
      data: _this.atlasData.data,
      onAnimation: () => {
        let tits = _this.atlasData.title;
        let ctx = radar.ctx;
        ctx.lineWidth = 1;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = '13px Arial';
        ctx.fillStyle = '#333';
        radar.drawer.sideArr.map((item, index) => {
          ctx.fillText(
            tits[index],
            radar.drawer.origin.x + item.x * radar.drawer.radius * 1.2,
            radar.drawer.origin.y - item.y * radar.drawer.radius * 1.2
          );
        });
      },
      width: canvasWidth,
      height: canvasWidth,
    });
    radar.init()
  },
  toNext(e) {
    let id = e.currentTarget.id,
      url = '',
      params = {}
    switch (id) {
      case "member":
        url = '../../member_intro/index'
        break;
      case "atlas":
        url = '../atlas/index'
        break;
      case "errorbook":
        url = '../errorbook/index'
        params.isMember = this.data.isMember ? 1 : 0
        params.expiresAt = this.data.expiresAt
        break;
      case "weekness":
        url = '../../weakness_exercise/index/index'
        break;
    }
    wxNav.navigateTo(url, params)
  }
})