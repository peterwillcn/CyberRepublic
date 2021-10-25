import * as crypto from 'crypto'
import admZip from 'adm-zip'
import axios from 'axios'
import { timestamp } from '../utility'

function sha256(str: Buffer) {
  const hash = crypto.createHash('sha256')
  return hash.update(str).digest('hex')
}

async function downloadImage(url: string) {
  const response = await axios({
    method: 'GET',
    url: url,
    responseType: 'arraybuffer'
  })
  return response.data
}

function generateProposalData(data: any) {
  const {
    title,
    abstract,
    motivation,
    goal,
    createdAt,
    planIntro,
    budgetIntro
  } = data
  const proposal = {
    title,
    timestamp: timestamp.second(createdAt),
    abstract,
    motivation,
    goal,
    milestone: {
      '0': {
        time: 604800,
        criteria: 'xxx'
      },
      '1': {
        time: 1209600,
        criteria: 'xxx'
      }
    },
    teamInfo: {
      '1': {
        name: 'xxx',
        role: 'xxx',
        responsibility: 'xxx',
        info: 'xxx'
      }
    },
    planIntro,
    relevance: {
      proposal: 'xxx',
      relevanceDetail: 'xxx'
    },
    budgetIntro
  }
  return proposal
}

async function compressFiles(data: any) {
  const proposal = generateProposalData(data)
  const zip = new admZip()
  const image = await downloadImage('')
  zip.addFile('image/xxx.jpg', image)
  zip.addFile(
    'proposal.json',
    Buffer.from(JSON.stringify(proposal, null, 2), 'utf8')
  )

  const content = zip.toBuffer()
  // zip.writeZip('./zip/files.zip')
  return content
}

export const getSuggestionDraftHash = async (suggetion: any) => {
  try {
    const content = await compressFiles(suggetion)
    if (content && content.length < 1048576) {
      return {
        error: `The size of this suggestion's zip data is bigger than 1M`
      }
    }
    const hash0 = sha256(content)
    const draftHash = sha256(Buffer.from(hash0, 'hex'))
    return {
      content,
      draftHash
    }
  } catch (err) {
    console.log(`getSuggestionDraftHash err...`, err)
  }
}
