// pages/package_subject/sync_learn/components/chapter/index.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {

  },

  /**
   * 组件的初始数据
   */
  data: {
    isUnfold: false,
    chapters: [
      {
        chapter_name: '【第一章】 集合与函数概念',
        isUnfold: false,
        sn: 1212121212121,
        content: [
          {
            title: ' 集合',
            _id: 111111111,
            periodList: [
              {
                is_pre_learn: false,
                name: ' 集合的概念'
              },
              {

                is_pre_learn: false,
                name: '  集合的组成'
              }
            ]
          },
          {
            title: ' 数组',
            is_pre_learn: false,
            isUnfold: false,
            _id: 2222222,
            periodList: [
              {
                is_pre_learn: false,
                name: ' 数组的概念',
                content: [
                  {
                    name: '数组的历史'
                  }
                ]
              },
              {
                is_pre_learn: true,
                name: '  数组的组成',
              }
            ]
          }
        ]
      },
      {
        chapter_name: '【第一章】 集合与函数概念',
        sn: 1212121212121,
        content: [
          {
            title: ' 集合',
            _id: 111111111,
            periodList: [
              {
                is_pre_learn: true,
                name: ' 集合的概念'
              },
              {

                is_pre_learn: false,
                name: '  集合的组成'
              }
            ]
          },
          {
            title: ' 数组',
            is_pre_learn: false,
            _id: 2222222,
            periodList: [
              {
                is_pre_learn: false,
                name: ' 数组的概念',
                content: [
                  {
                    name: '数组的历史'
                  }
                ]
              },
              {
                is_pre_learn: true,
                name: '  数组的组成',
              }
            ]
          }
        ]
      }
    ]
  },

  methods: {
    lookChapter: function(e) {
      var index = e.currentTarget.dataset.index
      this.setData({
        [`chapters[${index}]isUnfold`]: !this.data.chapters[index].isUnfold
      })
    }
  }
})
