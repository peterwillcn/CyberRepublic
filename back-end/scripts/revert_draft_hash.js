// MAKE SURE YOU RUN BUILD BEFORE THIS
// this should be run from the parent back-end folder, not scripts
// this is what sets the process.env
require('../dist/src/config')
;(async () => {
  const db = await require('../dist/src/db').default
  const DB = await db.create()
  const db_suggestion = DB.getModel('Suggestion')
  const db_suggestion_zip_file = DB.getModel('Suggestion_Zip_File')

  try {
    const docs = await db_suggestion_zip_file.getDBInstance().find()
    const arr = []
    for (let i = 0; i < docs.length; i++) {
      const doc = docs[i]
      const draftHash = doc.draftHash
      console.log(`draftHash...`, draftHash)
      const reverseHash = draftHash
        .match(/[a-fA-F0-9]{2}/g)
        .reverse()
        .join('')
      console.log(`reverseHash...`, reverseHash)
      doc.draftHash = reverseHash
      await doc.save()
      await db_suggestion
        .getDBInstance()
        .update({ _id: doc.suggestionId }, { draftHash: reverseHash })
    }
  } catch (err) {
    console.error(err)
  }
  process.exit(1)
})()
