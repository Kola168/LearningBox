const app = getApp()
import {
  wxNav
} from "../../../../utils/common_import"
const FundCharts = require('../../charts.min.js/index.js')
const RadarChart = FundCharts.radar
const BarChart = FundCharts.bar
Page({
  data: {
    isMember: true
  },
  onLoad() {
    setTimeout(() => {
      this.setData({
        canvasWidth: app.sysInfo.screenWidth - 40
      })
      this.drawRadar()
      this.drawBar()
    }, 300)

  },
  drawRadar() {
    let canvasWidth = this.data.canvasWidth,
      center = Math.ceil(canvasWidth / 2)
    const radar = new RadarChart({
      id: 'radar',
      colors: ['#4D98EC'],
      radius: center - 60, // 半径
      gridNumber: 5,
      origin: { // 中心
        x: center,
        y: center
      },
      data: [1, 2, 3, 4, 5],
      onAnimation: () => {
        let tits = ['吃', '喝', '住', '睡', '乐'];
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
  drawBar() {
    let canvasWidth = this.data.canvasWidth
    let bar = new BarChart({
      id: 'bar',
      barMargin: 120,
      width: canvasWidth,
      height: canvasWidth - 60,
      chartLeft: 44,
      range: {
        min: 0,
        max: 100
      },
      dash: {
        length: 4,
        color: "#E7E7E7"
      },
      colors: ['#6892df'],
      xaxis: ['语文', '数学'],
      data: [20, 80],
      //   handleTextX: (ctx, xArr) => {      // 处理x轴文字
      //     // 增加x轴刻度
      //     let _chartWidth = testline._chart.width - testline.opts.chartLeft - testline.opts.chartRight;
      //     ctx.textAlign = 'center';
      //     ctx.textBaseline = 'middle';
      //     ctx.font = '10px Arial';
      //     ctx.fillStyle = '#333';

      //     for (let i in xArr) {
      //       ctx.fillText(xArr[i], (_chartWidth / (xArr.length - 1) * i) + testline.opts.chartLeft, testline._chart.height - 13);
      //     }
      // },
      // handleTextY: (ctx, yaxis) => {
      //   console.log(yaxis);
      //   ctx.textAlign = 'center';
      //   ctx.textBaseline = 'middle';
      //   ctx.font = '10px Arial';
      //   ctx.fillStyle = '#fff';

      //   ctx.fillText(yaxis.min.toFixed(0));
      //   ctx.fillText(yaxis.max.toFixed(0));
      //   ctx.fillText(((yaxis.max + yaxis.min) / 2).toFixed(0), 10, (bar._chart.height - bar.opts.chartTop) / 2 - 10);
      // }
    });
    bar.init()
  },
  toNext(e) {
    let id = e.currentTarget.id,
      url = ''
    switch (id) {
      case "member":
        url = '../../member_intro/index'
        break;
      case "atlas":
        url = '../atlas/index'
        break;
      case "errorbook":
        url = '../errorbook/index'
        break;
    }
    wxNav.navigateTo(url)
  }
})