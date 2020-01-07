// 学前接口

import gql from '../graphql_config'
const graphqlApi = {
  /**
   * 注册学科网
   *
   * @returns
   */
  register: () => {
    return gql.mutate({
      mutation: `mutation ($input: RegisterInput!){
        Register{
          state
        }
      }`
    })
  },

  /**
   * 获取每日一练当日练习题
   */
  getPracticeContentToday: () => {
    return gql.query({
      query: `query getPracticeContentToday($key: String!){
        feature(key: $key){
          practiceContentToday{
            name
            sn
            practiceQuestionImages
            practiceAnswerImages
          }
        }
      }`,
      variables: {
        key: 'daily_practice'
      }
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
      query: `query getMonthCompilations($key: String!){
        feature(key: $key){
          practiceCategories{
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
      }`,
      variables: {
        key: 'daily_practice'
      }
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
  }
  

}

export default graphqlApi