// MAKE SURE YOU RUN BUILD BEFORE THIS
// this should be run from the parent back-end folder, not scripts
// this is what sets the process.env
require('../dist/src/config')
;(async () => {
  const db = await require('../dist/src/db').default
  const DB = await db.create()
  const db_cvote = DB.getModel('CVote')
  try {
    // const query = {
    //   vid: 6,
    //   proposalHash: { $exists: true }
    // }
    // const proposal = await db_cvote.findOne(query)
    // console.log(`proposal`, proposal)
    await db_cvote.getDBInstance().updateOne(
      {
        vid: 6,
        proposalHash: { $exists: true },
        'voteResult.reasonHash': 'xxx'
      },
      {
        $unset: {
          'voteResult.$.reasonHash': true,
          'voteResult.$.reasonCreatedAt': true
        }
      }
    )
  } catch (err) {
    console.error(err)
  }
  process.exit(1)
})()
