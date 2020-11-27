import { Schema } from 'mongoose'
import { CommentSchema } from './CommentSchema'
import { SubscriberSchema } from './SubscriberSchema'
import { constant } from '../../constant'
import * as _ from 'lodash'
import { SuggestionCore } from './SuggestionCoreSchema'

const tag = {
  type: {
    type: String,
    enum: _.values(constant.SUGGESTION_TAG_TYPE),
    uppercase: true,
    required: true
  },
  desc: String,
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}

export const Suggestion = {
  ...SuggestionCore,
  contentType: {
    type: String,
    enum: _.values(constant.CONTENT_TYPE)
  },
  version: {
    type: Number,
    default: 1.0
  },
  likes: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  likesNum: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: [Schema.Types.ObjectId],
    default: []
  },
  dislikesNum: {
    type: Number,
    default: 0
  },
  viewsNum: {
    type: Number,
    default: 0
  },
  activeness: {
    type: Number,
    default: 0
  },
  comments: [[CommentSchema]],
  commentsNum: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  // constans.SUGGESTION_STATUS: ACTIVE, ABUSED, ARCHIVED. abuse will also be archived
  status: {
    type: String,
    uppercase: true,
    enum: _.values(constant.SUGGESTION_STATUS),
    default: constant.SUGGESTION_STATUS.ACTIVE
  },
  // constant.SUGGESTION_ABUSED_STATUS: REPORTED, HANDLED
  abusedStatus: {
    type: String,
    uppercase: true,
    enum: _.values(constant.SUGGESTION_ABUSED_STATUS)
  },
  subscribers: [SubscriberSchema],
  reference: [
    {
      type: Schema.Types.ObjectId,
      ref: 'cvote'
    }
  ],
  tags: [tag],
  signature: { data: String, message: String },
  draftHash: String,
  ownerPublicKey: String,
  proposalHash: String,
  // council members make suggesiton into proposal
  proposers: [
    {
      did: String,
      timestamp: String
    }
  ],
  closeProposalNum: Number, // terminate a proposal
  targetProposalNum: Number, // change the proposal owner
  newOwnerDID: String,
  // if no newOwnerDID, the newOwnerPublicKey is the compressed public key of  the target proposal's proposer
  newOwnerPublicKey: String,
  newOwnerSignature: { data: String, message: String },
  newSecretarySignature: { data: String, message: String },
  newSecretaryDID: String,
  newSecretaryPublicKey: String,
  targetProposalHash: String,
  newAddress: String, // new ELA address
  // if no newAddress, the newRecipient is the target proposal's ELA address
  newRecipient: String,
  old: Boolean, // mark an old suggestion
  validPeriod: Number
}
