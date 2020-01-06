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
        sn
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
