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
    loadReady: false,
    isMember: true,
    barData: {},
    atlasType: 'none',
    emptySubjects: [],
    bottomSubjects: [],
    topSubjects: [],
    middleSubjects: []
  },
  onLoad() {
    this.weToast = new app.weToast()
    this.setData({
      canvasWidth: app.sysInfo.screenWidth
    })
    this.getSubjectsAtlas()
  },
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
        atlasType: 'none'
      }
      let rates = res.xuekewang.subjectRate,
        topSubjects = [],
        middleSubjects = [],
        bottomSubjects = [],
        emptySubjects = []
      for (let i = 0; i < rates.length; i++) {
        if (rates[i].questionNum > 0) {
          let score = rates[i].scoringRate
          this.atlasData.title.push(rates[i].subjectName)
          this.atlasData.data.push(score === 0 ? 0.01 : score)
          if (score >= 85) {
            topSubjects.push(rates[i])
          } else if (score < 85 && score >= 60) {
            middleSubjects.push(rates[i])
          } else {
            bottomSubjects.push(rates[i])
          }
        } else {
          emptySubjects.push(rates[i])
        }
      }
      dataObj.loadReady = true
      dataObj.topSubjects = topSubjects
      dataObj.middleSubjects = middleSubjects
      dataObj.bottomSubjects = bottomSubjects
      dataObj.emptySubjects = emptySubjects
      if (this.atlasData.title.length > 2) {
        dataObj.atlasType = 'radar'
        this.setData(dataObj)
        this.drawRadar()
      } else if (this.atlasData.title.length > 0) {
        dataObj.atlasType = 'bar'
        let tempArr = []
        for (let i = 0; i < this.atlasData.title.length; i++) {
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
      radius: center - 60,
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
  toKnowledgeList(e) {
    let subjectId = e.currentTarget.dataset.id
    wxNav.navigateTo('../knowledge_list/index', {
      subjectId: subjectId
    })
  }
})