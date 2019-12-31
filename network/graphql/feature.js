// 功能性接口

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

  //获取年级以及对应教材接口
  getGradeList:()=>{
    return gql.query({
      query:`query{
          userStages{
          name
          sn
         	rootName
          sn
          kousuanCategories{
            name
            sn
          }
        }
      }`
    })
  },

  //获取年级下对应的口算类型接口
  getKousuanType:(sn)=>{
    return gql.query({
      query:`query($sn: String!){
        category(sn:$sn){
          children{
            name
            image
            sn
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },

  //获取口算类型具体题目接口
  getKnowledgePoints:(sn)=>{
    return gql.query({
      query:`query($sn: String!){
        category(sn:$sn){
          children{
            name
            image
            sn
            quesionNumber
          }
        }
      }`,
      variables: {
        sn
      }
    })
  },
}

export default graphqlApi
