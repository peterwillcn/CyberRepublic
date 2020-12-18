export const Did = {
  did: String,
  number: {
    type: String, // uuid string
    required: true,
    unique: true
  },
  message: String,
  success: Boolean,
  // mark if a user uses the new version ELA wallet to log in
  newVersion: Boolean
}
