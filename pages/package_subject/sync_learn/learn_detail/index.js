// pages/package_subject/sync_learn/learn_detail/index.js
const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../utils/common_import'
import getLoopsEvent from '../../../../utils/worker'
import graphql from '../../../../network/graphql/subject'
Page({

  data: {
    currentIndex: 0,
    showMemberToast: false, //显示会员弹窗
    showAiToast: false, // 显示ai出题弹窗
    currentDiff: null,
    diffList: [],
    exerciseList: [],
    defautExercise: null, //默认练习题
    aiDiffList: [], //ai题目列表
  },

  onLoad: co.wrap(function* (options) {
    this.longToast = new app.weToast()
    this.sn = options.sn
    yield this.getDifficulty()
    yield this.getNodeDetails()
    yield this.getDefaultExercise()
    yield this.getExercises()
    this.setData({
      currentDiff: this.data.diffList[0]
    })
  }),

  /**
   * 打开弹窗
   */
  openAiToast: function () {
    var memberToast = this.selectComponent('#memberToast')
    // memberToast.showToast()
    this.setData({
      showAiToast: true
    })
  },

  /**
   * 智能出题
   */
  setTopic: co.wrap(function* () {
    this.cancelSet()
    this.longToast.toast({
      type: 'loading',
      title: '正在出题'
    })
    getLoopsEvent({
      feature_key: 'xuekewang_exercise',
      worker_data: {
        diff: this.data.currentDiff.id,
        sn: this.sn,
      }
    }, (resp) => {
      if (resp.status == 'finished') {
        console.log(resp, '出题完成==')
        this.longToast.hide()
        this.getExercises()
      }
    }, () => {
      this.longToast.hide()
    })
  }),

  /**
   * 取消ai出题
   */
  cancelSet: function () {
    this.setData({
      showAiToast: false
    })
  },

  chooseDiff: co.wrap(function* ({
    currentTarget: {
      dataset: {
        index
      }
    }
  }) {
    try {
      this.setData({
        currentIndex: index,
        currentDiff: this.data.diffList[index]
      })
      yield this.getDefaultExercise()
      yield this.getExercises()

    } catch (err) {}
  }),

  /**
   * 获取子章节练习详情
   */
  getNodeDetails: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getNodeDetails(this.sn)
      this.setData({
        nodeDetails: resp.xuekewang.node,
      })
      this.longToast.hide()
    } catch (err) {
      this.longToast.hide()
      util.showError(err)
    }
  }),

  /**
   * 获取难度系数
   */
  getDifficulty: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getDifficulty()
      this.setData({
        diffList: resp.xuekewang.diff,
        currentDiff: resp.xuekewang.diff[this.data.currentIndex],
      })
      this.longToast.hide()
    } catch (err) {
      this.longToast.hide()
      util.showError(err)
    }
  }),

  /**
   * 获取ai练习列表
   */
  getExercises: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getExercises(+this.data.currentDiff.id, this.sn)
      this.setData({
        exerciseList: resp.xuekewang && resp.xuekewang.exercises
      })
      this.longToast.hide()
    } catch (err) {
      this.longToast.hide()
      util.showError(err)
    }
  }),

  /**
   * 获取默认练习题
   */
  getDefaultExercise: co.wrap(function* () {
    this.longToast.toast({
      type: 'loading',
      title: '请稍后...'
    })
    try {
      var resp = yield graphql.getDefaultExercise(+this.data.currentDiff.id, this.sn)
      this.setData({
        defautExercise: resp.xuekewang && resp.xuekewang.defaultExercise
      })
      this.longToast.hide()
    } catch (err) {
      this.longToast.hide()
      util.showError(err)
    }
  }),

  /**
   * 跳转练习详情
   */
  toExerciseDetail: function ({
    currentTarget: {
      dataset: {
        sn
      }
    }
  }) {
    wxNav.navigateTo('/pages/package_subject/sync_learn/preview_subject/index', {
      sn
    })
  }
})