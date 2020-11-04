import { Schema } from 'mongoose'

export const CommentSchema = {
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  childComment: [{
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'users',
      required: true
    },
    commentTo: String,
    comment: {
      type: String,
      required: true
    },
    createdAt: Date
  }],
  headline: String,
  createdAt: Date
}
