// 学前接口

import gql from '../graphql_config'
const graphqlApi = {
  /**
   * 注册学科网
   *
   */
  register: () => {
    return gql.mutate({
      mutation: `mutation ($input: RegisterInput!){
        Register(input:$input){
          state
        }
      }`,
      variables: {
        input: {

        }
      }
    })
  },

  /**
   * 获取学科
   *
   */
  getSubjects: () => {
    return gql.query({
      query: `query {
        xuekewang {
          registered
          subjects {
            iconUrl
            subjectId
            subjectName
            totalNumber
          }
        }
      }`
    })
  },

  /**
   * 获取学科教材版本
   * @param { Number } subjectId
   */
  getSubjectsVersions: (subjectId) => {
    return gql.query({
      query: `query ($subjectId: Int!){
        xuekewang {
          textbookVersions(subjectId:$subjectId){
            name
            versionId
          }
        }
      }`,
      variables: {
        subjectId: subjectId
      }
    })
  },
}

export default graphqlApi