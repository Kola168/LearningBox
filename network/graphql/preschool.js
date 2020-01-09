// 学前接口

import gql from '../graphql_config'
const graphqlApi = {
  /**
   * 宝贝成长计划 未订阅
   * 
   */
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

}

export default graphqlApi