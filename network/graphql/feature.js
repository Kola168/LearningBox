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
}

export default graphqlApi