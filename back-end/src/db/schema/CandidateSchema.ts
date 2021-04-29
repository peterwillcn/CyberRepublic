import * as _ from 'lodash'
import { constant } from '../../constant'

/*
  registerheight: 区块高度
  cancelheight: 注销高度，如未注销则为0
  index: 一般是按照votes排序的，每次查询会根据票数进行排序，不是每个候选人的唯一标识。
*/
export const Members = {
  code: String,
  cid: String,
  did: {
    type: String,
    required: true
  },
  nickName: String,
  url: String,
  location: Number,
  state: {
    type: String,
    enum: _.values(constant.CANDIDATE_STATE)
  },
  votes: Number,
  registerheight: Number,
  cancelheight: Number,
  index: Number
}

export const Candidate = {
  term: {
    type: Number,
    required: true
  },
  votingstartheight: {
    type: Number
  },
  votingendheight: {
    type: Number
  },
  members: [Members]
}
