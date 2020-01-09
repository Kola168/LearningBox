// 学前接口

import gql from '../graphql_config'
const graphqlApi = {
    /**
   * 获取每日一练当日练习题
   */
  getPracticeContentToday: () => {
    return gql.query({
      query: `query getPracticeContentToday{
        dailyPractice{
          practiceContentToday:contentToday{
            sn
            name
            practiceAnswerImages
            practiceQuestionImages
          }
          hasNewTestimonial
        }
      }`
    })
  },

  /**
   * 获取奖状
   */
  getCertifacate: () => {
    return gql.query({
      query: `query getCertifacate{
        testimonials{
          imageUrl
          title
          subTitle
          isGet
          sn
        }
      }`,
    })
  },

  /**
   * 获取月度集合分类
   */
  getMonthCompilations: () => {
    return gql.query({
      query: `query getMonthCompilations{
        dailyPractice{
          practiceCategories:categories{
            name
            sn
            subTitle
            children{
              name
              sn
              subTitle
              position
            }
          }
        }
      }`
    })
  },

  /**
   * 获取指定日期的每日一练题目
   */
  getMonthExercises: (sn) => {
    return gql.query({
      query: `query getMonthExercises($sn: String!){
        content(sn: $sn){
          sn
          practiceQuestionImages
        }
      }`,
      variables: {
        sn
      }
    })
  },

  /**
   * 获取每日一练月份集合
   * @param {String} 年份分类sn
   */
  getPracticeCategory: (sn) => {
    return gql.query({
      query: `query getPracticeCategory($sn: String!){
        category(sn: $sn){
          sn
          name
          subTitle
          image
          children{
            name
            sn
            subTitle
            position
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

    /**
   * 获取每日一练天数集合
   * @param {String} 月份分类sn
   */
  getPracticeDayCategory: (sn) => {
    return gql.query({
      query: `query getPracticeDayCategory($sn: String!){
        category(sn: $sn){
          contents{
            sn
            name
            practiceQuestionImages
            haveLearned
            pageCount
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },
	getPlans: () => {
    return gql.query({
      query: `query {
        plans {
          iconUrl
          name
          subTitle
          categoryName
          subscription
          sn
        }
      }`
    })
  },

  /**
   * 宝贝成长计划 已订阅&&已完成
   * 
   */
  getUserPlans: (tab) => {
    return gql.query({
      query: `query userPlans($tab: String!){
        userPlans(tab: $tab){
          currentIndex
          planCategoryName
          planIconUrl
          planName
          planSize
          planSubTitle
          planSn
          sn
        }
      }`,
      variables: {
        tab
      }
    })
  },

  /**
   * 宝贝成长计划 去订阅
   * 
   */
  joinPlan: (sn) => {
    return gql.mutate({
      mutation: `mutation ($input: JoinPlanInput!){
        joinPlan(input: $input) {
          state
        }
      }`,
      variables: {
        input:{sn: sn}
      }
    })
  },

  /**
   * 宝贝成长计划 取消订阅
   * 
   */
  deleteUserPlanInput: (sn) => {
    return gql.mutate({
      mutation: `mutation ($input: DeleteUserPlanInput!){
        deleteUserPlan(input: $input) {
          state
        }
      }`,
      variables: {
        input:{
          sn: sn
        }
      }
    })
  },

  /**
   * 宝贝成长计划 闯关
   * 
   */
  getPlanContents: (planSn) => {
    return gql.query({
      query: `query ($planSn: String!){
        planContents(sn: $planSn) {
          name
          iconUrl
          sn
          isShow
        }
      }`,
      variables: {
        planSn
      }
    })
  },


  /**
   * 宝贝成长计划 订阅标识
   * 
   */
  getPlan: (planSn) => {
    return gql.query({
      query: `query ($planSn: String!){
        plan(sn: $planSn) {
          subscription
        }
      }`,
      variables: {
        planSn
      }
    })
  },


  /**
   * 宝贝成长计划 预览
   * 
   */
  getContent: (planSn) => {
    return gql.query({
      query: `query ($planSn: String!){
        content(sn: $planSn) {
          featureKey
          iconUrl
          pageCount
          sn
          contentImages{
            nameUrl
          }
        }
      }`,
      variables: {
        planSn
      }
    })
  },

  /**
   * 获取每日一练月份集合
   * @param {String} 年份分类sn
   */
  getPracticeCategory: (sn) => {
    return gql.query({
      query: `query getPracticeCategory($sn: String!){
        category(sn: $sn){
          sn
          name
          subTitle
          image
          children{
            name
            sn
            subTitle
            position
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

    /**
   * 获取每日一练天数集合
   * @param {String} 月份分类sn
   */
  getPracticeDayCategory: (sn) => {
    return gql.query({
      query: `query getPracticeDayCategory($sn: String!){
        category(sn: $sn){
          contents{
            sn
            name
            practiceQuestionImages
            haveLearned
            pageCount
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  /**
   * 打印设置
   *
   */ 
  createResourceOrder: (sn) => {
    return gql.mutate({
      mutation: `mutation ($input: CreateResourceOrderInput!){
        createResourceOrder(input: $input) {
          state
          statistic
      }`,
      variables: {
        input:{
          sn: sn
        }
      }
    })
  },


  //获取宝贝测评试题列表
  getGradeList:()=>{
    return gql.query({
      query:`query{
        examinations{
          categoryName
          iconUrl
          name
          sn
        }
      }`,
    })
  },

  //获取宝贝测评题目
  getTestList:(sn)=>{
    return gql.query({
      query:`query($sn: String!){
        examination(sn:$sn){
          questions{
            audioUrl
            categoryName
            categorySn
            imageUrl
            answers{
              imageUrl
              isRight
              name
            }
          }
        }
      }`,
      variables: {
        sn:sn
      }
    })
  },

  //获取打印内容
  getGradePrint:(param)=>{
    return gql.query({
      query: `query ($sn:String!,$sns: [String!]!,$randomNum:Int!){
        examinationRandomContents(sn:$sn,sns:$sns,randomNum:$randomNum){
          featureKey
          sn
          contentImages{
            nameUrl
          }
        }
      }`,
      variables: param
    })
  },
}

export default graphqlApi
