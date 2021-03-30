import { Schema } from 'mongoose'

export const CVote_Tracking_Message = {
  content: {
    type: String,
    required: true
  },
  proposalId: {
    type: Schema.Types.ObjectId,
    ref: 'cvote'
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'users'
  }
}
