import * as crypto from 'crypto'
import * as _ from 'lodash'
import * as admZip from 'adm-zip'

function sha256(str: Buffer) {
  const hash = crypto.createHash('sha256')
  return hash.update(str).digest('hex')
}

async function compressFiles(reason: string) {
  const zip = new admZip()
  const opinion = { content: reason }
  zip.addFile(
    'opinion.json',
    Buffer.from(JSON.stringify(opinion, null, 2), 'utf8')
  )
  // for testing
  // zip.writeZip('./zip/files.zip')
  const content = zip.toBuffer()
  if (!content) {
    return {
      success: false,
      error: `Cann't get this council member opinion's zip data`
    }
  }
  return { success: true, content }
}

export const getCouncilMemberOpinionHash = async (reason: any) => {
  try {
    const rs: any = await compressFiles(reason)
    if (rs.success === false) {
      return { error: rs.error }
    }
    // the size of a zip file should be less than 1M
    if (rs.content && rs.content.length >= 1048576) {
      return {
        error: `The size of this council member opinion's zip data is bigger than 1M`
      }
    }
    const hash0 = sha256(rs.content)
    const opinionHash = sha256(Buffer.from(hash0, 'hex'))
    const reverseHash = opinionHash
      .match(/[a-fA-F0-9]{2}/g)
      .reverse()
      .join('')
    return {
      content: rs.content,
      opinionHash: reverseHash
    }
  } catch (err) {
    console.log(`getCouncilMemberOpinionHash err...`, err)
  }
}
