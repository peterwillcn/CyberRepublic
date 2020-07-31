import { Schema } from 'mongoose'
import * as _ from 'lodash'
import { constant } from '../../constant'

export const CVoteVoteHistory = {
  votedBy: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    // required: true
  },
  value: {
    type: String,
    emun: _.values(constant.CVOTE_RESULT),
    default: constant.CVOTE_RESULT.UNDECIDED
  },
  reason: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    emnu: _.values(constant.CVOTE_CHAIN_STATUS),
    default: constant.CVOTE_CHAIN_STATUS.UNCHAIN
  },
  signature: { data: String, message: String },
  reasonHash: {
    type: String
  },
  reasonCreatedAt: {
    type: Date
  },
  createdAt: {
    type: Date,
    // required: true,
    default: Date.now
  },
  proposalBy: {
      type: Schema.Types.ObjectId,
      ref: 'cvote',
      // required: true
  }
}
