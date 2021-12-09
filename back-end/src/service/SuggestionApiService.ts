import Base from './Base'
import * as _ from 'lodash'
import * as jwt from 'jsonwebtoken'
import { constant } from '../constant'
import { timestamp, mail, user as userUtil, getPemPublicKey } from '../utility'
const Big = require('big.js')

const {
  ELA_BURN_ADDRESS,
  DEFAULT_BUDGET,
  SUGGESTION_TYPE,
  CHAIN_BUDGET_TYPE,
  DID_PREFIX
} = constant

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
        Object.values(constant.SUGGESTION_NEW_STATUS).includes(
          status.toUpperCase()
        )
      ) {
        temp.status = status.toLowerCase()
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
        stage: initiation ? stage : stage + 1,
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
      .findOne({ _id: sid }, '-comments commentsNum')
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

    const isSigned = _.get(suggestion, 'signature.data')
    const isProposed = _.get(suggestion, 'proposalHash')
    if (!isSigned) {
      data.status = constant.SUGGESTION_NEW_STATUS.UNSIGNED.toLowerCase()
    }
    if (isSigned) {
      data.status = constant.SUGGESTION_NEW_STATUS.SIGNED.toLowerCase()
    }
    if (isProposed) {
      data.status = constant.SUGGESTION_NEW_STATUS.PROPOSED.toLowerCase()
    }

    data.did = _.get(createdBy, 'did.id')

    const proposerDidName = _.get(createdBy, 'did.didName')
    if (proposerDidName) {
      data.proposer = proposerDidName
    } else {
      data.proposer = _.get(createdBy, 'username')
    }

    if (suggestion.ownerPublicKey) {
      data.ownerPublicKey = suggestion.ownerPublicKey
    }

    data.originalURL = `${process.env.SERVER_URL}/suggestion/${sid}`
    data.createdAt = timestamp.second(createdAt)
    data.type = constant.CVOTE_TYPE_API[type]

    if (type === SUGGESTION_TYPE.CHANGE_SECRETARY) {
      data.newSecretaryDID = suggestion.newSecretaryDID
      data.newSecretaryPublicKey = suggestion.newSecretaryPublicKey
    }

    if (type === SUGGESTION_TYPE.CHANGE_PROPOSAL) {
      if (suggestion.newOwnerDID) {
        data.newOwnerDID = suggestion.newOwnerDID
        data.newOwnerPublicKey = suggestion.newOwnerPublicKey
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
          stage: index
        }
        milestones.push(info)
      }
      data.milestone = milestones
    }

    if (plan && plan.teamInfo && plan.teamInfo.length > 0) {
      data.implementationTeam = plan.teamInfo
    }

    if (_.get(suggestion, 'signature.data')) {
      data.signature = _.get(suggestion, 'signature.data')
    }

    if (_.get(suggestion, 'newOwnerSignature.data')) {
      data.newOwnerSignature = _.get(suggestion, 'newOwnerSignature.data')
    }

    if (_.get(suggestion, 'newSecretarySignature.data')) {
      data.newSecretarySignature = _.get(
        suggestion,
        'newSecretarySignature.data'
      )
    }

    return data
  }

  public async signature(param: any) {
    try {
      const jwtToken = param.jwt
      const claims: any = jwt.decode(jwtToken)
      const { iss, sid, command, signature, exp } = claims
      if (command !== 'createsuggestion' || !sid || !iss || !signature) {
        return {
          code: 400,
          success: false,
          message: 'Invalid request params'
        }
      }
      const now = Math.trunc(Date.now() / 1000)
      if (now > exp) {
        return {
          code: 400,
          success: false,
          message: 'The signature is expired'
        }
      }

      const suggestion = await this.model
        .getDBInstance()
        .findById({ _id: sid })
        .populate('createdBy', 'did')

      if (!suggestion) {
        return {
          code: 400,
          success: false,
          message: 'There is no this suggestion.'
        }
      }

      const ownerDID = _.get(suggestion, 'createdBy.did.id')
      if (iss === ownerDID) {
        const signatureInfo = _.get(suggestion, 'signature.data')
        if (signatureInfo) {
          return {
            code: 400,
            success: false,
            message: 'This suggestion had been signed.'
          }
        }
        const compressedKey = _.get(suggestion, 'ownerPublicKey')
        const pemPublicKey = compressedKey && getPemPublicKey(compressedKey)
        if (!pemPublicKey) {
          return {
            code: 400,
            success: false,
            message: `Can not get your DID's public key.`
          }
        }
        return jwt.verify(
          jwtToken,
          pemPublicKey,
          async (err: any, decoded: any) => {
            if (err) {
              return {
                code: 401,
                success: false,
                message: 'Verify signature failed.'
              }
            } else {
              try {
                await this.model.update(
                  { _id: sid },
                  { signature: { data: decoded.signature } }
                )
                // notify new owner to sign
                if (suggestion.type === SUGGESTION_TYPE.CHANGE_PROPOSAL) {
                  this.notifyPeopleToSign(
                    suggestion,
                    suggestion.newOwnerPublicKey
                  )
                }
                // notify new secretary general to sign
                if (suggestion.type === SUGGESTION_TYPE.CHANGE_SECRETARY) {
                  this.notifyPeopleToSign(
                    suggestion,
                    suggestion.newSecretaryPublicKey
                  )
                }
                return { code: 200, success: true, message: 'Ok' }
              } catch (err) {
                console.log(`receive owner signature err...`, err)
                return {
                  code: 500,
                  success: false,
                  message: 'DB can not save your signature.'
                }
              }
            }
          }
        )
      }

      const newOwnerDID = _.get(suggestion, 'newOwnerDID')
      if (iss === DID_PREFIX + newOwnerDID) {
        if (suggestion.type !== SUGGESTION_TYPE.CHANGE_PROPOSAL) {
          return {
            code: 400,
            success: false,
            message: `This suggestion's type is not CHANGE PROPOSAL`
          }
        }
        const signatureInfo = _.get(suggestion, 'newOwnerSignature.data')
        if (signatureInfo) {
          return {
            code: 400,
            success: false,
            message: 'This suggestion had been signed.'
          }
        }
        const compressedKey = _.get(suggestion, 'newOwnerPublicKey')
        const pemPublicKey = compressedKey && getPemPublicKey(compressedKey)
        if (!pemPublicKey) {
          return {
            code: 400,
            success: false,
            message: `Can not get your DID's public key.`
          }
        }

        return jwt.verify(
          jwtToken,
          pemPublicKey,
          async (err: any, decoded: any) => {
            if (err) {
              return {
                code: 401,
                success: false,
                message: 'Verify signature failed.'
              }
            } else {
              try {
                await this.model.update(
                  { _id: sid },
                  {
                    newOwnerSignature: { data: decoded.signature }
                  }
                )
                return { code: 200, success: true, message: 'Ok' }
              } catch (err) {
                console.log(`receive new owner signature err...`, err)
                return {
                  code: 500,
                  success: false,
                  message: 'Something went wrong'
                }
              }
            }
          }
        )
      }

      const secretaryDID = _.get(suggestion, 'newSecretaryDID')
      if (iss === DID_PREFIX + secretaryDID) {
        if (suggestion.type !== SUGGESTION_TYPE.CHANGE_SECRETARY) {
          return {
            code: 400,
            success: false,
            message: `This suggestion's type is not CHANGE SECRETARY`
          }
        }
        const signatureInfo = _.get(suggestion, 'newSecretarySignature.data')
        if (signatureInfo) {
          return {
            code: 400,
            success: false,
            message: 'This suggestion had been signed.'
          }
        }
        const compressedKey = _.get(suggestion, 'newSecretaryPublicKey')
        const pemPublicKey = compressedKey && getPemPublicKey(compressedKey)
        if (!pemPublicKey) {
          return {
            code: 400,
            success: false,
            message: `Can not get your DID's public key.`
          }
        }
        return jwt.verify(
          jwtToken,
          pemPublicKey,
          async (err: any, decoded: any) => {
            if (err) {
              return {
                code: 401,
                success: false,
                message: 'Verify signatrue failed.'
              }
            } else {
              try {
                await this.model.update(
                  { _id: sid },
                  { newSecretarySignature: { data: decoded.signature } }
                )
                return { code: 200, success: true, message: 'Ok' }
              } catch (err) {
                console.log(`receive new secretary signature err...`, err)
                return {
                  code: 500,
                  success: false,
                  message: 'DB can not save the signature.'
                }
              }
            }
          }
        )
      }
    } catch (err) {
      console.log(`signature api err...`, err)
      return {
        code: 500,
        success: false,
        message: 'Something went wrong'
      }
    }
  }

  private async notifyPeopleToSign(suggestion, receiverPublicKey) {
    const subject = `【Signature required】Suggestion <${suggestion.displayId}> is ready for you to sign`
    const body = `
      <p>Suggestion <${suggestion.displayId}> <${suggestion.title}> is ready for you to sign</p>
      <p>Click here to sign now:</p>
      <p><a href="${process.env.SERVER_URL}/suggestion/${suggestion._id}">${process.env.SERVER_URL}/suggestion/${suggestion._id}</a></p>
      <br />
      <p>Thanks</p>
      <p>Cyber Republic</p>
    `
    const receiver = await this.getDBModel('User').findOne({
      'did.compressedPublicKey': receiverPublicKey
    })
    mail.send({
      to: receiver.email,
      toName: userUtil.formatUsername(receiver),
      subject,
      body
    })
  }
}
