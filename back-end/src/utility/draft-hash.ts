import * as crypto from 'crypto'
import * as admZip from 'adm-zip'
import axios from 'axios'
import { timestamp } from '../utility'

function uniqImageUrls(data, key) {
  return [...new Map(data.map((x) => [key(x), x])).values()]
}

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

async function downloadImages(urls: any, zip: admZip) {
  const promiseArr = []
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i].url
    promiseArr.push(downloadImage(url))
  }
  const images = await Promise.all(promiseArr)
  for (let i = 0; i < images.length; i++) {
    const image = images[i]
    zip.addFile(`image/${urls[i].name}`, image)
  }
}

function getImageUrls(content: string) {
  if (!content) return
  let temp = content
  const regex = /\!\[.*?\]\(https?\:\/\/.*?\)/g
  const images = content.match(regex)
  if (!images) {
    return { urls: [], content }
  }
  const urls = images.map((el) => {
    const regex = /\!\[.*?\]\((.*?)\)/
    const url = el.replace(regex, '$1')
    const rs = url.split('/')
    let name = rs[rs.length - 1]
    const regex1 = /(.+)\?.+\=.+\&*/

    if (regex1.test(name)) {
      name = name.replace(regex1, '$1')
    }
    temp = temp.replace(el, `[image](./image/${name})`)
    return { url, name }
  })
  const uniqUrls = uniqImageUrls(urls, (el) => el.url)
  return { urls: uniqUrls, content: temp }
}

function generateProposalData(data: any) {
  const {
    title,
    abstract,
    motivation,
    goal,
    createdAt,
    plan,
    planIntro,
    relevance,
    budgetIntro
  } = data
  const newAbstract = getImageUrls(abstract)
  const newMotivation = getImageUrls(motivation)
  const newGoal = getImageUrls(goal)
  const proposal: { [key: string]: any } = {
    title,
    timestamp: timestamp.second(createdAt),
    abstract: newAbstract.content,
    motivation: newMotivation.content,
    goal: newGoal.content
  }
  if (plan && plan.milestone && plan.milestone.length > 0) {
    const info = {}
    for (let i = 0; i < plan.milestone.length; i++) {
      info[i] = {
        time: timestamp.second(plan.milestone[i].date),
        criteria: plan.milestone[i].version
      }
    }
    proposal.milestone = info
  }
  if (plan && plan.teamInfo && plan.teamInfo.length > 0) {
    const info = {}
    for (let i = 0; i < plan.teamInfo.length; i++) {
      info[i + 1] = {
        role: plan.teamInfo[i].role,
        name: plan.teamInfo[i].member,
        responsibility: plan.teamInfo[i].responsibility,
        info: plan.teamInfo[i].info
      }
    }
    proposal.teamInfo = info
  }
  if (relevance && relevance.length > 0) {
    const info = {}
    for (let i = 0; i < relevance.length; i++) {
      info[i + 1] = {
        proposal: relevance[i].title,
        relevanceDetail: relevance[i].relevanceDetail
      }
    }
    proposal.relevance = info
  }
  let urls = [...newAbstract.urls, ...newMotivation.urls, ...newGoal.urls]
  if (planIntro) {
    const newPlanIntro = getImageUrls(planIntro)
    urls = [...urls, ...newPlanIntro.urls]
    proposal.planIntro = newPlanIntro.content
  }
  if (budgetIntro) {
    const newBudgetIntro = getImageUrls(budgetIntro)
    urls = [...urls, ...newBudgetIntro.urls]
    proposal.budgetIntro = newBudgetIntro.content
  }

  return { proposal, urls }
}

async function compressFiles(data: any) {
  const zip = new admZip()
  const { proposal, urls } = generateProposalData(data)

  await downloadImages(urls, zip)
  zip.addFile(
    'proposal.json',
    Buffer.from(JSON.stringify(proposal, null, 2), 'utf8')
  )
  // for testing
  // zip.writeZip('./zip/files.zip')
  const content = zip.toBuffer()
  return content
}

export const getSuggestionDraftHash = async (suggetion: any) => {
  try {
    const content = await compressFiles(suggetion)
    // the size of a zip file should be less than 1M
    if (content && content.length >= 1048576) {
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
