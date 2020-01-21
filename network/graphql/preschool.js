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
            ... on DailyPractice {
              sn
              name
              practiceAnswerImages
              practiceQuestionImages
            }
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
            ... on DailyPracticeCategory {
              name
              sn
              subTitle
              children{
                ... on DailyPracticeCategory {
                  name
                  sn
                }
              }
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
          ... on DailyPractice {
            sn
            practiceQuestionImages
          }
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
          ... on DailyPracticeCategory {
            sn
            name
            subTitle
            image
            children{
              ... on DailyPracticeCategory {
                name
                sn
              }
            }
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
            ... on DailyPractice {
              sn
              name
              practiceQuestionImages
              haveLearned
              pageCount
            }
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  /**
   * 更新最新的奖状状态
   */
  updateNewsCerts: () => {
    return gql.mutate({
      mutation: `mutation {
        updateUserTestimonials(input:{}){
          state
        }
      }`
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
   * 宝贝成长计划 是否自动打印
   * 
   */
  getUserPlan: (sn) => {
    return gql.query({
      query: `query userPlan($sn: String!){
        userPlan(sn: $sn){
          sn
          subscription{
            copies
            enable
            intervalDay
            timing
          }
        }
      }`,
      variables: {
        sn
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
          userPlan{
            sn
          }
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
   * 宝贝成长计划 订阅标识
   * 
   */
  getPlan: (planSn) => {
    return gql.query({
      query: `query ($planSn: String!){
        plan(sn: $planSn) {
          userPlanSn
          sn
          name
          subscription
          planShowContents{
            sn
            iconUrl
            isShow
            name
          }
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


  getPreviewContent: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        content(sn: $sn){
            ... on PlanContent {
              sn
              name
              plan{
                subscription
                userPlanSn
              } 
              featureKey
              iconUrl
              pageCount
              contentImages{
                nameUrl
              }        
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
  // createResourceOrder: (sn) => {
  //   return gql.mutate({
  //     mutation: `mutation ($input: CreateResourceOrderInput!){
  //       createResourceOrder(input: $input) {
  //         state
  //         statistic
  //     }`,
  //     variables: {
  //       input:{
  //         sn: sn
  //       }
  //     }
  //   })
  // },


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

  //定时任务设置时间
  joinSubscription:(input)=>{
    return gql.mutate({
      mutation: `mutation ($input: CreateSubscriptionInput!){
        joinSubscription(input:$input){
          state
        }
      }`,
      variables: {
        input: input
      }
    })
  },

}

export default graphqlApi
