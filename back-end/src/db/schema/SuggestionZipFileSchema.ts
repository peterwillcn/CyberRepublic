import { Schema } from 'mongoose'

export const SuggestionZipFile = {
  suggestionId: {
    type: Schema.Types.ObjectId,
    ref: 'suggestion',
    required: true
  },
  draftHash: String,
  content: Buffer
}
