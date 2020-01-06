// 功能性接口

import gql from '../graphql_config'
const graphqlApi = {
  /**
   * 获取默写分类
   * @param { string } key featureKey
   */
  getCategory: (key) => {
    return gql.query({
      query: `query ($key: String!){
        feature(key: $key){
          categories {
            image,
            name,
            sn,
            writeType
          }
        }
      }`,
      variables: {
        key: key
      }
    })
  },

  getStages: (sn) => {
    return gql.query({
      query: `query($sn: String!) {
        userStages {
          sn
          name
          guessWriteCategories(sn:$sn){
            sn
            name
          }
        }
      }`,
      variables: {
        sn: sn
      }
    })
  },
  /**
   * 获取默写列表
   * @param { string } sn
   */
  getWriteList: (sn) => {
    return gql.query({
      query: `query ($sn: String!){
        category(sn:$sn) {
          sn
          name
          children{
            sn
            name
            printCount
            questions{
              answer
              title
            }
          }
        }
      }`,
      variables: {
        sn: sn
      }
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

  //口算打印接口
  createKousunOrder:(input)=>{
    return gql.mutate({
      mutation: `mutation ($input: CreateResourceOrderInput!){
        createResourceOrder(input:$input){
          state
        }
      }`,
      variables: {
        input: input
      }
    })
  }
	
}

export default graphqlApi
