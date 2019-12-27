// pages/package_subject/sync_learn/components/chapter/index.js

const app = getApp()
import {
  regeneratorRuntime,
  co,
  util
} from '../../../../../utils/common_import'
import graphql from '../../../../../network/graphql_request'
import busFactory from '../../busFactory'
Component({
  properties: {

  },

  data: {
    isUnfold: false,
    chapters: []
  },

  attached: function() {
    this.longToast = new app.weToast()
    busFactory.listenChapterData((chapters)=>{
      console.log(chapters,'====resp====')
      this.setData({
        chapters
      })
    })
  },

  methods: {
    lookChapter: function(e) {
      var index = this.nodeIndex = e.currentTarget.dataset.index
      this.setData({
        [`chapters[${index}]isUnfold`]: !this.data.chapters[index].isUnfold
      })
      if (this.data.chapters[index].isUnfold) {
        this.getChapterContentDetails(this.data.chapters[index].id)
      }
    },
    getChapterContentDetails: co.wrap(function*(chapterId){
      this.longToast.toast({
        title: '请稍后...',
        type: 'loading'
      })
      try {
        var textbookId = busFactory.getIds('textbookId')
        var subjectId = busFactory.getIds('subjectId')
        var resp = yield graphql.getChapterDetail({
          subjectId,
          textbookId,
          parentId: chapterId
        })
        if (!resp.xuekewang.childrenNodes.length) {
          this.longToast.hide()
          return util.showError({
            message: '章节数据暂无'
          })
        }
        this.setData({
          [`chapters[${this.nodeIndex}].children`]: resp.xuekewang.childrenNodes
        })
        this.longToast.hide()
        console.log(this.data.chapters, '==chapters==')
      } catch(err) {
        this.longToast.hide()
        util.showError(err)
      }
    })
  }
})
