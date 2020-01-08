const app = getApp()
import {
  regeneratorRuntime,
  co,
  wxNav,
  util
} from "../../../utils/common_import"
import api from '../../../network/restful_request'
import subjectGql from '../../../network/graphql/subject'
Page({
  data: {
    isSubjectMember: true,
    areaHeight: 0,
    showSerial: false,
    isFullScreen: false,
    currentTopic: null,
    loadReady: false,
    topicsResult: [], //批改结果
    currentResult: null, //当前题目批改结果
    topicIndex: 0, //当前批改索引,
    currentTopicType: 'single', //single客观小题,multipleObj客观大题,multipleSub主观大题
    progress: 0
  },
  onLoad: co.wrap(function* (query) {
    let areaHeight = 0
    if (app.navBarInfo) {
      areaHeight = app.sysInfo.screenHeight - app.navBarInfo.topBarHeight
    } else {
      areaHeight = app.sysInfo.screenHeight - app.getNavBarInfo().topBarHeight
    }
    this.setData({
      areaHeight,
      isFullScreen: app.isFullScreen
    })
    this.weToast = new app.weToast()
    let scene = query.scene
    this.paperId = Number(scene.split('_')[1])
    this.correctType = scene.split('_')[2] === 'paper' ? 'XuekewangPaper' : 'XuekewangExercise'
    this.getCorrectPaper()
    setInterval(() => {
      if (this.data.progress < 100) {
        this.setData({
          progress: this.data.progress + 5
        })
      }
    }, 500)
  }),
  unfoldSerial() {
    this.setData({
      showSerial: !this.data.showSerial
    })
  },
  // 获取试卷内容
  getCorrectPaper: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let resp = yield api.getCorrectPaper(this.paperId, this.correctType)
      if (resp.code != 0) {
        throw (resp)
      }
      let tempData = resp.res
      this.topics = tempData.questions
      let currentTopic = this.topics[0],
        formatResult = this.formatTopic(currentTopic),
        topicsResult = new Array(this.topics.length)
      this.subjectName = tempData.subject_name
      this.currentTopicId = currentTopic.ques_id
      this.setData({
        loadReady: true,
        title: tempData.title,
        currentTopicType: formatResult.topicType,
        topicsResult,
        currentTopic: formatResult.currentTopic
      })
      this.weToast.hide()
    } catch (error) {
      this.weToast.hide()
      util.showError(error)
    }
  }),
  // 切换题目
  changeTopic(e) {
    let index = e.currentTarget.dataset.index,
      tagetResult = this.data.topicsResult[index]
    if (tagetResult != null) {
      let formatResult = this.formatTopic(this.topics[index])
      this.changeTopicIndex = index //切换题目index
      this.changeTopicFlag = true //切换题目nextTopicIndex不增加
      this.currentTopicId = currentTopic.ques_id
      this.setData({
        currentTopic: formatResult.currentTopic,
        currentTopicType: formatResult.topicType,
        topicIndex: index,
        currentResult: tagetResult.point
      })
    }
  },
  // 选择题目分数
  checkScore(e) {
    let currentResult = Number(e.currentTarget.dataset.point)
    this.setData({
      currentResult
    })
  },
  // 下一题
  nextTopic() {
    let currentResult = this.data.currentResult
    if (currentResult != null) {
      let dataKey = `topicsResult[${this.data.topicIndex}]`,
        nextTopicIndex = this.data.topicIndex + 1

      if (this.changeTopicFlag) {
        dataKey = `topicsResult[${this.changeTopicIndex}]`
        nextTopicIndex = this.data.topicIndex + 1
      }
      let dataObj = {
        [dataKey]: {
          point: this.data.currentResult,
          questionId: this.currentTopicId
        },
        currentResult: null
      }
      if (nextTopicIndex === this.data.topicsResult.length) {
        this.setData(dataObj)
        this.preSubmit()
      } else {
        let formatResult = this.formatTopic(this.topics[nextTopicIndex])
        dataObj.topicIndex = nextTopicIndex
        dataObj.currentTopic = formatResult.currentTopic
        dataObj.currentTopicType = formatResult.topicType
        this.setData(dataObj)
        this.changeTopicFlag = false
        this.currentTopicId = formatResult.currentTopic.ques_id
      }
    }
  },

  // 提交答案
  preSubmit: co.wrap(function* () {
    this.weToast.toast({
      type: 'loading'
    })
    try {
      let res = yield subjectGql.submitCorrect(this.data.topicsResult, this.correctType, this.paperId)
      this.weToast.hide()
      wxNav.navigateTo('../report/index/index', {
        from: 'correct',
        sn: ''
      })
    } catch (e) {
      this.weToast.hide()
      util.showError(e)
    }
  }),

  // 格式化题目
  formatTopic(currentTopic) {
    let formatCurrentTopic = Object.assign({}, currentTopic),
      tempArr = [],
      topicType = ''
    if (formatCurrentTopic.option !== '{}' || !formatCurrentTopic.option) {
      let options = formatCurrentTopic.option,
        forObj = Object.keys(options)
      for (let i = 0; i < forObj.length; i++) {
        let itemArr = [forObj[i], options[forObj[i]]]
        tempArr.push(itemArr)
      }
      topicType = 'single'
      formatCurrentTopic.option = tempArr
    } else if (formatCurrentTopic.children && formatCurrentTopic.children.length > 0) {
      let children = formatCurrentTopic.children
      if (this.subjectName === '语文' || this.subjectName === '英语') {
        topicType = 'multipleObj'
      } else {
        topicType = 'multipleSub'
      }
      for (let i = 0; i < children.length; i++) {
        tempArr = []
        let forObj = Object.keys(children[i].option)
        for (let j = 0; j < forObj.length; j++) {
          let itemArr = [forObj[j], children[i].option[forObj[j]]]
          tempArr.push(itemArr)
        }
        formatCurrentTopic.children[i].option = tempArr
      }
    }
    return {
      currentTopic: formatCurrentTopic,
      topicType: topicType
    }
  }
})