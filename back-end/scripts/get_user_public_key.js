// MAKE SURE YOU RUN BUILD BEFORE THIS
// this should be run from the parent back-end folder, not scripts
// this is what sets the process.env
require('../dist/src/config')
const _ = require('lodash')
const { getDidPublicKey } = require('../dist/src/utility')

;(async () => {
  const db = await require('../dist/src/db').default
  const DB = await db.create()
  const db_user = DB.getModel('User')
  try {
    const query = {
      'did.id': { $exists: true },
      'did.compressedPublicKey': {$exists: false}
    }
    let users = await db_user.find(query)
    console.log('users.length', users.length)
    for (const user of users) {
      try {
        const did = _.get(user, 'did.id')
        const rs = await getDidPublicKey(did)
        if (rs && rs.compressedPublicKey) {
          await db_user.update(
            { _id: user._id },
            { $set: { 'did.compressedPublicKey': rs.compressedPublicKey } }
          )
        }
      } catch (err) {
        console.log(`user ${user.did.id} error`, err)
      }
    }
    console.log('done!')
  } catch (err) {
    console.error(err)
  }
  process.exit(1)
})()
