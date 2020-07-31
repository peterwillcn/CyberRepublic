require('../dist/src/config')
;(async () => {
  const db = await require('../dist/src/db').default
  const DB = await db.create()
  const db_cvote = DB.getModel('CVote')
  const db_cvote_history = DB.getModel('CVote_Vote_History')

  try {
    const proposalList = await db_cvote.find({old:{$exists:false}})
    console.log('proposalList.length', proposalList.length)
    _.forEach(proposalList,(e) => {
      _.forEach(e.voteHistory, async (o) => {
        if (o.status === constant.CVOTE_CHAIN_STATUS.CHAINED) {
          const doc = {
            ...o._doc,
            proposalBy: e._id
          }
          await db_cvote_history.save(doc)
        }
      })
    })
  } catch (err) {
    console.error(err)
  }
  process.exit(1)
})()
