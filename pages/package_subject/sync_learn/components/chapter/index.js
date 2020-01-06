// pages/package_subject/sync_learn/components/chapter/index.js

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util,
  wxNav
} from '../../../../../utils/common_import'
import graphql from '../../../../../network/graphql/subject'
import busFactory from '../../busFactory'
Component({

  data: {
    isUnfold: false,
    chapters: []
  },

  attached: function () {
    this.longToast = new app.weToast()
    busFactory.listenChapterData((chapters) => {
      this.setData({
        chapters
      })
    })
  },

  methods: {
    lookChapter: function (e) {
      var index = this.nodeIndex = e.currentTarget.dataset.index
      this.setData({
        [`chapters[${index}]isUnfold`]: !this.data.chapters[index].isUnfold
      })
      if (this.data.chapters[index].isUnfold) {
        this.getChapterContentDetails(this.data.chapters[index].sn)
      }
    },

    // 获取章节详情数据
    getChapterContentDetails: co.wrap(function* (sn) {
      this.longToast.toast({
        title: '请稍后...',
        type: 'loading'
      })
      try {
        var resp = yield graphql.getChapterDetail(sn)
        if (!resp.xuekewang.childrenNodes.length) {
          this.longToast.hide()
          this.setData({
            [`chapters[${this.nodeIndex}]isUnfold`]: false
          })
          return util.showError({
            message: '章节数据暂无'
          })
        }
        this.setData({
          [`chapters[${this.nodeIndex}].children`]: resp.xuekewang.childrenNodes
        })
        this.longToast.hide()
      } catch (err) {
        this.longToast.hide()
        util.showError(err)
      }
    }),
    /**
     * 跳转练习页
     */
    toExeDetail: co.wrap(function* ({
      currentTarget: {
        dataset: {
          sn
        }
      }
    }) {
      var subjectSn = busFactory.getIds('subjectSn')
      wxNav.navigateTo('/pages/package_subject/sync_learn/learn_detail/index', {
        sn: sn,
        subjectSn: subjectSn,
      })
    })
  }
})