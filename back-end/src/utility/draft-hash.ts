import * as crypto from 'crypto'
import * as _ from 'lodash'
import * as admZip from 'adm-zip'
import axios from 'axios'
import { timestamp } from '../utility'
import { constant } from '../constant'
const { DEFAULT_BUDGET, SUGGESTION_TYPE } = constant

function uniqImageUrls(data, key) {
  return [...new Map(data.map((x) => [key(x), x])).values()]
}

function sha256(str: Buffer) {
  const hash = crypto.createHash('sha256')
  return hash.update(str).digest('hex')
}

async function downloadImage(url: string) {
  try {
    const response = await axios({
      method: 'GET',
      url: url,
      responseType: 'arraybuffer'
    })
    return response.data
  } catch (err) {
    console.log(`downloadImage ${url} err...`, err)
  }
}

async function downloadImages(urls: any, zip: admZip) {
  try {
    const promiseArr = []
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i].url
      promiseArr.push(downloadImage(url))
    }
    const images = await Promise.all(promiseArr)
    if (!images) {
      return { success: false, error: `Cann't download images` }
    }
    for (let i = 0; i < images.length; i++) {
      const image = images[i]
      zip.addFile(`image/${urls[i].name}`, image)
    }
  } catch (err) {
    console.log(`downloadImages err...`, err)
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

function convertBudget(budget) {
  const initiation = _.find(budget, ['type', 'ADVANCE'])
  const budgets = budget.map((item) => {
    const stage = parseInt(item.milestoneKey, 10)
    return {
      stage: initiation ? stage.toString() : (stage + 1).toString(),
      paymentCriteria: item.criteria
    }
  })
  return budgets
}

function generateProposalData(data: any) {
  const {
    title,
    type,
    abstract,
    motivation,
    goal,
    plan,
    planIntro,
    relevance,
    budget,
    budgetIntro
  } = data
  const newAbstract = getImageUrls(abstract)
  const newMotivation = getImageUrls(motivation)
  const newGoal = getImageUrls(goal)

  const proposal: { [key: string]: any } = {
    title,
    abstract: newAbstract.content,
    motivation: newMotivation.content,
    goal: newGoal.content
  }

  const hasBudget = !!budget && _.isArray(budget) && !_.isEmpty(budget)
  if (hasBudget) {
    data.budgets = convertBudget(budget)
  } else {
    if (type === SUGGESTION_TYPE.NEW_MOTION) {
      data.budgets = DEFAULT_BUDGET
    }
  }

  if (plan && plan.milestone && plan.milestone.length > 0) {
    let isAdvanceBudget = true
    if (hasBudget && data.budgets && parseInt(data.budgets[0].stage) === 1) {
      isAdvanceBudget = false
    }
    const milestones = []
    for (let i = 0; i < plan.milestone.length; i++) {
      const index = isAdvanceBudget ? i : i + 1
      const info = {
        timestamp: timestamp.second(plan.milestone[i].date),
        goal: plan.milestone[i].version,
        stage: index.toString()
      }
      milestones.push(info)
    }
    data.milestone = milestones
  }

  if (plan && plan.teamInfo && plan.teamInfo.length > 0) {
    data.implementationTeam = plan.teamInfo
  }

  if (relevance && relevance.length > 0) {
    const info = []
    for (let i = 0; i < relevance.length; i++) {
      info.push({
        title: relevance[i].title,
        proposalHash: relevance[i].proposalHash,
        relevanceDetail: relevance[i].relevanceDetail
      })
    }
    proposal.relevance = info
  }
  let urls = [...newAbstract.urls, ...newMotivation.urls, ...newGoal.urls]
  if (planIntro) {
    const newPlanIntro = getImageUrls(planIntro)
    urls = [...urls, ...newPlanIntro.urls]
    proposal.planStatement = newPlanIntro.content
  }
  if (budgetIntro) {
    const newBudgetIntro = getImageUrls(budgetIntro)
    urls = [...urls, ...newBudgetIntro.urls]
    proposal.budgetStatement = newBudgetIntro.content
  }

  return { proposal, urls }
}

async function compressFiles(data: any) {
  const zip = new admZip()
  const { proposal, urls } = generateProposalData(data)
  if (urls && urls.length !== 0) {
    const rs = await downloadImages(urls, zip)
    if (rs && rs.success === false) {
      return rs
    }
  }
  zip.addFile(
    'proposal.json',
    Buffer.from(JSON.stringify(proposal, null, 2), 'utf8')
  )
  // for testing
  // zip.writeZip('./zip/files.zip')
  const content = zip.toBuffer()
  if (!content) {
    return { success: false, error: `Cann't get this suggestion's zip data` }
  }
  return { success: true, content }
}

export const getSuggestionDraftHash = async (suggetion: any) => {
  try {
    const rs: any = await compressFiles(suggetion)
    if (rs.success === false) {
      return { error: rs.error }
    }
    // the size of a zip file should be less than 1M
    if (rs.content && rs.content.length >= 1048576) {
      return {
        error: `The size of this suggestion's zip data is bigger than 1M`
      }
    }
    const hash0 = sha256(rs.content)
    const draftHash = sha256(Buffer.from(hash0, 'hex'))
    return {
      content: rs.content,
      draftHash
    }
  } catch (err) {
    console.log(`getSuggestionDraftHash err...`, err)
  }
}
