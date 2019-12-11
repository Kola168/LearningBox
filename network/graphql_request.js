/*
 * @Author: your name
 * @Date: 2019-11-19 14:39:00
 * @LastEditTime: 2019-12-10 13:42:36
 * @LastEditors: Please set LastEditors
 * @Description: In User Settings Edit
 * @FilePath: /LearningBox/network/graphql_request.js
 */
var app = getApp()
var gqwxappGraphql = require('./wxgql')
var GraphQL = gqwxappGraphql.GraphQL

// 初始化对象
let gql = GraphQL({
  url: `${app.apiServer}/graphql`,
  header: function() {
    if (app.authToken) {
			console.log('authToken==1==',app.authToken)
      return {
        "AUTHORIZATION": `Token token=${app.authToken}`
      }
    } else {
      try {
        var authToken = wx.getStorageSync('authToken')
			  console.log('authToken====',authToken)
				if (authToken) {
          return {
            "AUTHORIZATION": `Token token=${authToken}`
          }
        }
      } catch (e) {
        console.log(e)
      }
    }
  },
  //全局错误拦截
  errorHandler: function(res) {

  }
}, true);

const graphqlApi = {
  /**
   * 搜索
   * @param { String } keyword 关键词
   * @param { Array } keys 请求数据分类
   */
  getSearchResult: (keyword, keys) => {
    return gql.query({
      query: `query searchResult($keyword: String!,$keys: [String!]){
        searchResult:searchUnion(keyword: $keyword,keys: $keys){
						name
						resources{
              ...on Course{
                sn
                name
                desc
                iconUrl
                studyUsers
              }
              ...on Content{
                name
                iconUrl
                printCount
                totalPage
                categorySn
                sn
                categories
              }
              ...on Feature{
                sn
                name
                iconUrl
                miniappPath
              }
              ...on KfbCategory{
                categorySn
                sn
                name
                iconUrl
                path
                pathTypeKey
                subTitle
              }
            }
  			}
  		}`,
      variables: {
        keyword: keyword,
        keys: keys
      }
    })
  },

  bindDevice: (deviceInfo) => {
    return gql.mutate({
      mutation: `mutation bindDevice($input: BindDeviceInput!){
        bindDevice(input:$input){
          device {
						onlineState
						sn
					}
        }
      }`,
      variables: {
        input: deviceInfo
      }
    })
  },

  /**
   * 解绑打印机
   * @param { String } sn required 设备编号
   */
  unbindDevice: (sn) => {
    return gql.mutate({
      mutation: `mutation ($input: UpdateDeviceSettingInput!){
        updateDeviceSetting(input:$input){
          state
        }
      }`,
      variables: {
        input: {
          sn: sn
        }
      }
    })
  },

  /**
   * 获取打印机列表
   */
  getDeviceList: () => {
    return gql.query({
      query: `query {
        devices {
          name,
          selected,
          sn,
          model
        }
      }`
    })
  },

  /**
   * 获取打印机详情
   * @param { String } sn required 设备编号
   */
  getDeviceDetail: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        device(sn: $sn){
          name,
          selected,
          sn,
          model,
          auditFree,
          marginFree,
          onlineState,
          quality,
					printOrder
				}
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 获取百度网盘是否授权
   */
  getBaiduNetAuth: () => {
    return gql.query({
      query: `query {
        token {
          baiduTokenName
        }
      }`
    })
  },

  /**
   * 获取百度网盘列表
   * @param { String } path required 关键词
   * @param { String } type required 请求数据类型：img/doc
   * @param { String } key 搜索关键词
   */
  getBaiduNetList: (path, type, key = '') => {
    return gql.query({
      query: `query ($path: String!,$type: String!,$key: String){
        fileList:baidu(path: $path,type: $type,key: $key){
          filename,
          fsId,
          isdir,
          path,
          size,
          thumb,
          time
        }
      }`,
      variables: {
        path: path,
        type: type,
        key: key
      }
    })
  },

  /**
   * 课程列表
   * *@param { CategoryEnum } type 请求类型
   */
  getCourses: (type) => {
    return gql.query({
      query: `query getCourses($type: String!){
        courses(type:$type){
          banners
          desc
          code
          introduction
          name
          studyUsers
          totalLessons
          mainImageUrl
          priceYuan
          recommendationImageUrl
          sn
          payed
        }
      }`,
      variables: {
        type: type
      }
    })
  },

  /**
   * 获取课程详情
   */
  getCourseDetail: (sn) => {
    return gql.query({
      query: `query getCourses($sn: String!){
        course(sn: $sn){
          banners
          desc
          code
          shareSn
          introduction
          name
          studyUsers
          courseCollected
          courseChapters {
            name
            shareToTrial
            sn
            state
            trial
            courseLessons{
              courseName
              locked
              name
              shareToTrial
            }
          }
          finishedLessons
          totalLessons
          mainImageUrl
          userCanShareToTrial
          priceYuan
          promotion
          promotionNum
          recommendationImageUrl
          sn
          payed
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  /**
   * 获取分享助力信息
   */
  getAssistanceInfo: (sn) => {
    return gql.query({
      query: `query getAssistanceInfo($sn: String!){
        courseShare(sn: $sn){
          assistanceSucceed
          assistanceUsers{
            avatar
            name
            phone
          }
          canAssistance
          course{
            desc
            studyUsers
            introduction
            mainImageUrl
            totalLessons
            name
            priceYuan
            promotion
            promotionNum
          }
          endAtTimestamp
          owner
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  // 获取最后一次学些的信息
  getLastCourseInfo: () => {
    return gql.query({
      query: `query getLastCourseInfo(){
        lastCourse{
          finished
          name
          sn
          total
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },

  // 获取课程首页banner
  getCourseBanner: (type) => {
    return gql.query({
      query: `query getCourseBanner($type:  BannerTypeEnum!){
        banners (type: $type){
          url: imageUrl
          name
        }
      }`,
      variables: {
        type: type
      }
    })
  },

  // 分享助力
  shareAssistance: (sn)=> {
    return gql.mutate({
      mutation: `mutation shareAssistance($input: CoursePromotionInput!){
        courseShare(input:$input){
          state
        }
      }`,
      variables: {
        input: {
          sn
        }
      }
    })
  },

  // 发起助力
  sendCourseAssistance: (sn) => {
    return gql.mutate({
      mutation: `mutation shareAssistance($input: CoursePromotionInput!){
        courseShare(input:$input){
          state
        }
      }`,
      variables: {
        input: {
          sn
        }
      }
    })
  },

  // 发起助力
  collectCourse: (input) => {
    return gql.mutate({
      mutation: `mutation shareAssistance($input: ResourceCollectInput!){
        collect(input:$input){
          state
        }
      }`,
      variables: {
        input: input
      }
    })
  },

  getMyFavorList: (type) => {
    return gql.query({
      query: `query getMyFavorList($type: CollectionTypeEnum!){
       collections(type: $type) {
        ...on Course{
          name
          sn
          mainImageUrl
          desc
          payed
          priceYuan
          purchasedAt
          totalLessons
          studyUsers
          finishedLessons
          introduction
          lastCourseChapterSn
        }
       }
      }`,
      variables: {
        type
      }
    })
  },

  // 获取课时详情
  getCourseLesson: (sn) => {
    return gql.query({
      query: `query getCourseLesson($sn: String!){
        courseLesson(sn: $sn) {
          courseName
          name
          shareToTrial
          videoUrl
        }
      }`,
      variables: {
        sn
      }
    })
  }
}

export default graphqlApi