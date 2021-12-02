import Base from './Base'
import * as _ from 'lodash'
import { constant } from '../constant'
import { timestamp } from '../utility'
const Big = require('big.js')

const { ELA_BURN_ADDRESS, DEFAULT_BUDGET, SUGGESTION_TYPE, CHAIN_BUDGET_TYPE } =
  constant

/**
 * API v1 and v2 for ELA Wallet and Essentials
 */

export default class extends Base {
  private model: any
  private zipFileModel: any
  protected init() {
    this.model = this.getDBModel('Suggestion')
    this.zipFileModel = this.getDBModel('Suggestion_Zip_File')
  }

  // API-0
  public async list(param: any, version = 'v1'): Promise<Object> {
    const { status } = param
    if (
      status &&
      ![
        constant.SUGGESTION_NEW_STATUS.UNSIGNED,
        constant.SUGGESTION_NEW_STATUS.SIGNED,
        constant.SUGGESTION_NEW_STATUS.PROPOSED
      ].includes(status.toUpperCase())
    ) {
      return {
        code: 400,
        message: 'Invalid request parameters - status',
        // tslint:disable-next-line:no-null-keyword
        data: null
      }
    }
    const query: any = {}
    query.old = { $exists: false }
    query.status = constant.SUGGESTION_STATUS.ACTIVE

    if (
      status &&
      status.toUpperCase() === constant.SUGGESTION_NEW_STATUS.UNSIGNED
    ) {
      query['signature.data'] = { $exists: false }
    }
    if (
      status &&
      status.toUpperCase() === constant.SUGGESTION_NEW_STATUS.SIGNED
    ) {
      query['signature.data'] = { $exists: true }
      query.proposalHash = { $exists: false }
    }
    if (
      status &&
      status.toUpperCase() === constant.SUGGESTION_NEW_STATUS.PROPOSED
    ) {
      query.proposalHash = { $exists: true }
    }

    // search
    if (param.search) {
      const search = _.trim(param.search)
      query.$or = [{ title: { $regex: search, $options: 'i' } }]
      if (parseInt(search, 10)) {
        query.$or.push({ displayId: parseInt(search, 10) })
      }
    }

    const fields = [
      'displayId',
      'title',
      'type',
      'createdAt',
      'createdBy',
      'proposalHash',
      'signature'
    ]

    const cursor = this.model
      .getDBInstance()
      .find(query, fields.join(' '))
      .populate('createdBy', 'did')
      .sort({ displayId: -1 })

    if (
      param.page &&
      param.results &&
      parseInt(param.page) > 0 &&
      parseInt(param.results) > 0
    ) {
      const results = parseInt(param.results, 10)
      const page = parseInt(param.page, 10)

      cursor.skip(results * (page - 1)).limit(results)
    }

    const rs = await Promise.all([
      cursor,
      this.model.getDBInstance().find(query).count()
    ])

    const list = _.map(rs[0], function (o) {
      let temp = _.omit(o._doc, ['createdBy', 'type', 'signature'])
      const createdAt = _.get(o, 'createdAt')
      temp.createdAt = timestamp.second(createdAt)
      if (version === 'v2') {
        temp.proposer = _.get(o, 'createdBy.did.didName')
      } else {
        temp.proposedBy = _.get(o, 'createdBy.did.id')
      }
      temp.type = constant.CVOTE_TYPE_API[o.type]
      if (!status) {
        const isSigned = _.get(o, 'signature.data')
        const isProposed = _.get(o, 'proposalHash')
        if (!isSigned) {
          temp.status = constant.SUGGESTION_NEW_STATUS.UNSIGNED.toLowerCase()
        }
        if (isSigned) {
          temp.status = constant.SUGGESTION_NEW_STATUS.SIGNED.toLowerCase()
        }
        if (isProposed) {
          temp.status = constant.SUGGESTION_NEW_STATUS.PROPOSED.toLowerCase()
        }
      }
      if (
        status &&
        status.toUpperCase() === constant.SUGGESTION_NEW_STATUS.UNSIGNED
      ) {
        temp.status = constant.SUGGESTION_NEW_STATUS.UNSIGNED.toLowerCase()
      }
      if (
        status &&
        status.toUpperCase() === constant.SUGGESTION_NEW_STATUS.SIGNED
      ) {
        temp.status = constant.SUGGESTION_NEW_STATUS.SIGNED.toLowerCase()
      }
      if (
        status &&
        status.toUpperCase() === constant.SUGGESTION_NEW_STATUS.PROPOSED
      ) {
        temp.status = constant.SUGGESTION_NEW_STATUS.PROPOSED.toLowerCase()
      }
      return _.mapKeys(temp, function (value, key) {
        if (key == 'displayId') {
          return 'id'
        } else if (key === '_id') {
          return 'sid'
        } else {
          return key
        }
      })
    })

    const total = rs[1]
    return {
      suggestions: list,
      total
    }
  }

  // API-8
  public async getDraftData(params: any): Promise<Object> {
    const { draftHash } = params
    if (!draftHash) {
      return {
        code: 400,
        message: 'Invalid request parameter',
        // tslint:disable-next-line:no-null-keyword
        data: null
      }
    }
    const rs = await this.zipFileModel.getDBInstance().findOne({ draftHash })
    if (!rs) {
      return {
        code: 400,
        message: 'Invalid this draft hash',
        // tslint:disable-next-line:no-null-keyword
        data: null
      }
    }
    return {
      sid: rs.suggestionId,
      content: rs.content.toString('hex')
    }
  }

  private convertBudget(budget) {
    const initiation = _.find(budget, ['type', 'ADVANCE'])
    const budgets = budget.map((item) => {
      const stage = parseInt(item.milestoneKey, 10)
      return {
        type: CHAIN_BUDGET_TYPE[item.type],
        stage: initiation ? stage.toString() : (stage + 1).toString(),
        amount: Big(`${item.amount}e+8`).toFixed(0),
        paymentCriteria: item.criteria
      }
    })
    return budgets
  }

  // API-3
  public async getSuggestion(sid: string): Promise<any> {
    const db_cvote = this.getDBModel('CVote')

    const suggestion = await this.model
      .getDBInstance()
      .findOne({ _id: sid })
      .populate('createdBy', 'did username')

    if (!suggestion) {
      return {
        code: 400,
        message: 'Invalid request parameters',
        // tslint:disable-next-line:no-null-keyword
        data: null
      }
    }

    const {
      abstract,
      budget,
      budgetIntro,
      createdBy,
      createdAt,
      displayId,
      draftHash,
      elaAddress,
      goal,
      motivation,
      plan,
      planIntro,
      title,
      type
    } = suggestion

    const data: { [key: string]: any } = {
      id: displayId,
      title,
      abstract,
      motivation,
      goal
    }

    data.did = _.get(createdBy, 'did.id')

    const proposerDidName = _.get(createdBy, 'did.didName')
    if (proposerDidName) {
      data.proposer = proposerDidName
    } else {
      data.proposer = _.get(createdBy, 'username')
    }

    data.originalURL = `${process.env.SERVER_URL}/suggestion/${sid}`
    data.createdAt = timestamp.second(createdAt)
    data.type = constant.CVOTE_TYPE_API[type]

    if (type === SUGGESTION_TYPE.CHANGE_SECRETARY) {
      data.newSecretaryDID = suggestion.newSecretaryDID
    }

    if (type === SUGGESTION_TYPE.CHANGE_PROPOSAL) {
      if (suggestion.newOwnerDID) {
        data.newOwnerDID = suggestion.newOwnerDID
      }
      data.newrecipient = suggestion.newRecipient
      const proposal = await db_cvote
        .getDBInstance()
        .findOne({ vid: suggestion.targetProposalNum })
      data.targetProposalTitle = proposal.title
      data.targetproposalhash = suggestion.targetProposalHash
      data.targetProposalNum = suggestion.targetProposalNum.toString()
    }

    if (type === SUGGESTION_TYPE.TERMINATE_PROPOSAL) {
      const proposal = await db_cvote
        .getDBInstance()
        .findOne({ vid: suggestion.closeProposalNum })
      data.targetProposalNum = suggestion.closeProposalNum.toString()
      data.targetProposalTitle = proposal.title
      data.targetproposalhash = suggestion.targetProposalHash
    }

    if (draftHash) {
      data.draftHash = draftHash
    }

    if (elaAddress) {
      data.recipient = elaAddress
    }

    if (budgetIntro) {
      data.budgetStatement = budgetIntro
    }

    if (planIntro) {
      data.planStatement = planIntro
    }

    const hasBudget = !!budget && _.isArray(budget) && !_.isEmpty(budget)
    if (hasBudget) {
      data.budgets = this.convertBudget(budget)
    } else {
      if (type === SUGGESTION_TYPE.NEW_MOTION) {
        data.budgets = DEFAULT_BUDGET
        data.recipient = ELA_BURN_ADDRESS
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

    return data
  }
}
