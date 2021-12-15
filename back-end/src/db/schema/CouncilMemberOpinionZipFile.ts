import { Schema } from 'mongoose'

export const CouncilMemberOpinionZipFile = {
  proposalId: {
    type: Schema.Types.ObjectId,
    ref: 'cvote',
    required: true
  },
  proposalHash: String,
  opinionHash: String,
  content: Buffer,
  votedBy: {
    type: Schema.Types.ObjectId,
    ref: 'user',
    required: true
  }
}
