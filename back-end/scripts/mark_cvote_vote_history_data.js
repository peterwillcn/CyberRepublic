require('../dist/src/config')
const _ = require('lodash')

;(async () => {
  const db = await require('../dist/src/db').default
  const DB = await db.create()
  const db_cvote = DB.getModel('CVote')
  const db_cvote_history = DB.getModel('CVote_Vote_History')

  try {
    const proposalList = await db_cvote.find({old:{$exists:false}})
    console.log('proposalList.length', proposalList.length)
    const voteHistory = []
    _.forEach(proposalList,(e) => {
      _.forEach(e.voteHistory, async (o) => {
        if (o.status === "chained") {
          voteHistory.push({
            ...o._doc,
            proposalBy: e._id
          })
        }
      })
    })
    console.log("voteHistory.length", voteHistory.length)
    if (voteHistory.length >0) {
      const bulk = db_cvote_history.getDBInstance().collection.initializeUnorderedBulkOp()
      voteHistory.forEach((e) => bulk.insert(e))
      await bulk.execute()
    }
  } catch (err) {
    console.error(err)
  }
  process.exit(1)
})()
