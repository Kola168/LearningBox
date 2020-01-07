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
   * 获取月度练习列表
   */
  getMonthExercises: (sn) => {
    return gql.query({
      query: `query getMonthExercises($sn: String!){
        content(sn: $sn){
          name
          iconUrl
          haveLearned
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
