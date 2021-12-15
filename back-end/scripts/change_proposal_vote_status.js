// MAKE SURE YOU RUN BUILD BEFORE THIS
// this should be run from the parent back-end folder, not scripts
// this is what sets the process.env
require('../dist/src/config')
;(async () => {
  const db = await require('../dist/src/db').default
  const DB = await db.create()
  const db_cvote = DB.getModel('CVote')
  const mongoose = require('mongoose')
  const ObjectId = mongoose.Types.ObjectId
  try {
    await db_cvote.getDBInstance().update(
      {
        vid: 6,
        proposalHash: { $exists: true },
        'voteResult._id': ObjectId('xxx')
      },
      {
        $set: {
          'voteResult.$.reason': ''
        }
      }
    )
  } catch (err) {
    console.error(err)
  }
  process.exit(1)
})()
