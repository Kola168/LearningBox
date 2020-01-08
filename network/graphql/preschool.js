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
          iconUrl
          name
          sn
        }
      }`,
      variables: param
    })
  },
}

export default graphqlApi
