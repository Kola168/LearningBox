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
          currentStage{
            sn
            name
            guessWriteCategories(sn:$sn){
              sn
              name
            }
          }
          siblings{
            sn
            name
            guessWriteCategories(sn:$sn){
              sn
              name
            }
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
          currentStage{
             name
             sn
          }
          siblings{
           name
           sn
           rootName
           sn
           kousuanCategories{
             name
             sn
           }
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

  //获取年级下对应的口算类型接口
  getKousuanTypeAndChildren:(sn)=>{
    return gql.query({
      query:`query($sn: String!){
        category(sn:$sn){
          children{
            name
            image
            sn
            children{
              name
              image
              sn
            }
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
  },

  //创建定时任务
  createTimedtask:(input)=>{
    return gql.mutate({
      mutation: `mutation ($input: CreateTimedTaskInput!){
        createTimedtask(input:$input){
          task{
            sn
          }
        }
      }`,
      variables: {
        input: input
      }
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

  //查询口算计划状态列表
  timedTasks:(param)=>{
    return gql.query({
      query: `query($state: TimedTaskStateEnum!,$taskType: TimedTaskTypeEnum!){
        timedTasks(state:$state,taskType:$taskType){
          startTime
          endTime
          categoryName
          day
    	    isEndtime
          sn
          state
          timing
        }
      }`,
      variables: param
    })
  },

  //提前结束定时任务
  updateTimedtask:(input)=>{
    return gql.mutate({
      mutation: `mutation ($input: UpdateTimedTaskInput!){
        updateTimedtask(input:$input){
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
