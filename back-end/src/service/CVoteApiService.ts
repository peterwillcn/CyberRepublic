import Base from './Base'
import * as _ from 'lodash'
import { constant } from '../constant'
import { timestamp, ela, logger, utilCrypto } from '../utility'
import * as moment from 'moment'
import * as jwt from 'jsonwebtoken'

const Big = require('big.js')

/**
 * API v1 and v2 for ELA Wallet and Essentials
 */

const { DID_PREFIX, API_VOTE_TYPE } = constant

const CHAIN_STATUS_TO_PROPOSAL_STATUS = {
  all: [
    constant.CVOTE_STATUS.PROPOSED,
    constant.CVOTE_STATUS.NOTIFICATION,
    constant.CVOTE_STATUS.ACTIVE,
    constant.CVOTE_STATUS.FINAL,
    constant.CVOTE_STATUS.REJECT,
    constant.CVOTE_STATUS.TERMINATED,
    constant.CVOTE_STATUS.VETOED
  ],
  registered: constant.CVOTE_STATUS.PROPOSED,
  cragreed: constant.CVOTE_STATUS.NOTIFICATION,
  crcanceled: constant.CVOTE_STATUS.REJECT,
  voteragreed: constant.CVOTE_STATUS.ACTIVE,
  votercanceled: constant.CVOTE_STATUS.VETOED,
  finished: constant.CVOTE_STATUS.FINAL,
  terminated: constant.CVOTE_STATUS.TERMINATED,
  aborted: [constant.CVOTE_STATUS.REJECT, constant.CVOTE_STATUS.VETOED]
}

const PROPOSAL_STATUS_TO_CHAIN_STATUS = {
  [constant.CVOTE_STATUS.PROPOSED]: 'registered',
  [constant.CVOTE_STATUS.NOTIFICATION]: 'cragreed',
  [constant.CVOTE_STATUS.ACTIVE]: 'voteragreed',
  [constant.CVOTE_STATUS.FINAL]: 'finished',
  [constant.CVOTE_STATUS.REJECT]: 'crcanceled',
  [constant.CVOTE_STATUS.VETOED]: 'votercanceled',
  [constant.CVOTE_STATUS.TERMINATED]: 'terminated'
}

export default class extends Base {
  private model: any
  protected init() {
    this.model = this.getDBModel('CVote')
  }

  public async allOrSearch(param): Promise<any> {
    const db_cvote = this.getDBModel('CVote')
    const db_config = this.getDBModel('Config')
    const query: any = {}

    if (
      !param.status ||
      !_.keys(CHAIN_STATUS_TO_PROPOSAL_STATUS).includes(param.status)
    ) {
      return {
        code: 400,
        message: 'Invalid request parameters - status',
        // tslint:disable-next-line:no-null-keyword
        data: null
      }
    }

    // status
    query.status = CHAIN_STATUS_TO_PROPOSAL_STATUS[param.status]

    // search
    if (param.search) {
      const search = _.trim(param.search)
      const db_user = this.getDBModel('User')
      const users = await db_user
        .getDBInstance()
        .find({
          $or: [{ 'did.didName': { $regex: _.trim(search), $options: 'i' } }]
        })
        .select('_id')
      const userIds = _.map(users, '_id')
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { proposer: { $in: userIds } }
      ]
      if (_.isNumber(search)) {
        query.$or.push({ vid: _.toNumber(search) })
      }
    }

    query.old = { $ne: true }

    const fields = [
      'vid',
      'title',
      'status',
      'type',
      'createdAt',
      'proposer',
      'proposedEndsHeight',
      'notificationEndsHeight',
      'proposalHash',
      'rejectAmount',
      'rejectThroughAmount'
    ]

    const cursor = db_cvote
      .getDBInstance()
      .find(query, fields.join(' '))
      .populate('proposer', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)
      .sort({ vid: -1 })

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
      db_cvote.getDBInstance().find(query).count(),
      ela.height()
    ])
    // filter return data，add proposalHash to CVoteSchema
    const list = _.map(rs[0], function (o) {
      let temp = _.omit(o._doc, [
        '_id',
        'proposer',
        'type',
        'rejectAmount',
        'proposedEndsHeight',
        'notificationEndsHeight',
        'rejectThroughAmount'
      ])
      temp.proposedBy = _.get(o, 'proposer.did.didName')
      temp.status = PROPOSAL_STATUS_TO_CHAIN_STATUS[temp.status]
      if ([constant.CVOTE_STATUS.PROPOSED].includes(o.status)) {
        temp.voteEndsIn = _.toNumber(
          (o.proposedEndsHeight - rs[2]) * 2 * 60
        ).toFixed()
      }
      if (
        [constant.CVOTE_STATUS.NOTIFICATION].includes(o.status) &&
        o.rejectAmount >= 0 &&
        o.rejectThroughAmount > 0
      ) {
        temp.voteEndsIn = _.toNumber(
          (o.notificationEndsHeight - rs[2]) * 2 * 60
        ).toFixed()
        temp.rejectAmount = `${o.rejectAmount}`
        temp.rejectThroughAmount = `${parseFloat(
          _.toNumber(o.rejectThroughAmount).toFixed(8)
        )}`
        temp.rejectRatio = _.toNumber(
          (
            _.toNumber(o.rejectAmount) / _.toNumber(o.rejectThroughAmount)
          ).toFixed(4)
        )
      }
      temp.type = constant.CVOTE_TYPE_API[o.type]
      temp.createdAt = timestamp.second(temp.createdAt)
      return _.mapKeys(temp, function (value, key) {
        if (key == 'vid') {
          return 'id'
        } else {
          return key
        }
      })
    })

    const total = rs[1]
    return { list, total }
  }

  public async getTracking(id) {
    const db_cvote = this.getDBModel('CVote')
    const db_user = this.getDBModel('User')
    const secretary = await db_user.getDBInstance().findOne(
      {
        role: constant.USER_ROLE.SECRETARY,
        'did.id': 'did:elastos:igCSy8ht7yDwV5qqcRzf5SGioMX8H9RXcj'
      },
      constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
    )
    const propoal = await db_cvote
      .getDBInstance()
      .findOne({ _id: id })
      .populate('proposer', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)

    if (!propoal) {
      return
    }

    try {
      const didName = _.get(secretary, 'did.didName')
      const avatar = _.get(secretary, 'did.avatar')
      const ownerDidName = _.get(propoal, 'proposer.did.didName')
      const ownerAvatar =
        _.get(propoal, 'proposer.did.avatar') ||
        _.get(propoal, 'proposer.profile.avatar')
      const { withdrawalHistory } = propoal
      const withdrawalList = _.filter(
        withdrawalHistory,
        (o: any) => o.milestoneKey !== '0'
      )
      const withdrawalListByStage = _.groupBy(withdrawalList, 'milestoneKey')
      const keys = _.keys(withdrawalListByStage).sort().reverse()
      const result = _.map(keys, (k: any) => {
        const withdrawals = _.sortBy(withdrawalListByStage[`${k}`], 'createdAt')
        const withdrawal = withdrawals[withdrawals.length - 1]

        const comment = {}

        if (_.get(withdrawal, 'review.createdAt')) {
          comment['content'] = _.get(withdrawal, 'review.reason')
          comment['opinion'] = _.get(withdrawal, 'review.opinion')
          comment['avatar'] = avatar
          comment['createdBy'] = didName
          comment['createdAt'] = moment(
            _.get(withdrawal, 'review.createdAt')
          ).unix()
        }

        return {
          stage: parseInt(k),
          didName: ownerDidName,
          avatar: ownerAvatar,
          content: withdrawal.message,
          createdAt: moment(withdrawal.createdAt).unix(),
          comment
        }
      })

      return result
    } catch (err) {
      logger.error(err)
    }
  }

  public async getProposalById(data: any): Promise<any> {
    const db_cvote = this.getDBModel('CVote')
    const db_cvote_history = this.getDBModel('CVote_Vote_History')
    const { id } = data

    const fields = [
      'vid',
      'title',
      'status',
      'type',
      'abstract',
      'voteResult',
      'createdAt',
      'proposalHash',
      'rejectAmount',
      'rejectThroughAmount',
      'proposedEndsHeight',
      'notificationEndsHeight',
      'targetProposalNum',
      'newOwnerDID',
      'newAddress',
      'newSecretaryDID',
      'closeProposalNum',
      'budget'
    ]
    const isNumber = /^\d*$/.test(id)
    let query: any
    if (isNumber) {
      query = { vid: parseInt(id), old: { $exists: false } }
    } else {
      query = { proposalHash: id, old: { $exists: false } }
    }

    const proposal = await db_cvote
      .getDBInstance()
      .findOne(query, fields.join(' '))
      .populate(
        'voteResult.votedBy',
        constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
      )

    if (!proposal) {
      return {
        code: 400,
        message: 'Invalid request parameters',
        // tslint:disable-next-line:no-null-keyword
        data: null
      }
    }

    const address = `${process.env.SERVER_URL}/proposals/${proposal.id}`

    const proposalId = proposal._id
    const targetNum = proposal.targetProposalNum || proposal.closeProposalNum
    let targetProposal: any
    if (targetNum) {
      targetProposal = await db_cvote
        .getDBInstance()
        .findOne({ vid: parseInt(targetNum), old: { $exists: false } })
    }

    const voteResultFields = ['value', 'reason', 'votedBy', 'avatar']
    const cvoteHistory = await db_cvote_history
      .getDBInstance()
      .find({ proposalBy: proposalId })
      .populate('votedBy', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)
    const voteResultWithNull = _.map(proposal._doc.voteResult, (o: any) => {
      let result
      if (o.status === constant.CVOTE_CHAIN_STATUS.CHAINED) {
        result = o._doc
      } else {
        const historyList = _.filter(
          cvoteHistory,
          (e: any) =>
            e.status === constant.CVOTE_CHAIN_STATUS.CHAINED &&
            o.votedBy._id.toString() == e.votedBy._id.toString()
        )
        if (!_.isEmpty(historyList)) {
          const history = _.sortBy(historyList, 'createdAt')
          result = history[history.length - 1]._doc
        }
      }
      if (!_.isEmpty(result)) {
        return _.pick(
          {
            ...result,
            votedBy: _.get(result, 'votedBy.did.didName'),
            avatar: _.get(result, 'votedBy.did.avatar')
          },
          voteResultFields
        )
      }
    })
    const voteResult = _.filter(voteResultWithNull, (o: any) => !_.isEmpty(o))

    const tracking = await this.getTracking(proposalId)

    // const summary = await this.getSummary(proposalId)
    const summary = []

    const notificationResult = {}

    // duration
    const currentHeight = await ela.height()
    if (proposal.status === constant.CVOTE_STATUS.PROPOSED) {
      const duration = (proposal.proposedEndsHeight - currentHeight) * 2 * 60
      notificationResult['duration'] = duration >= 0 ? duration : 0
    }

    if (proposal.status === constant.CVOTE_STATUS.NOTIFICATION) {
      const duration =
        (proposal.notificationEndsHeight - currentHeight) * 2 * 60
      notificationResult['duration'] = duration >= 0 ? duration : 0
    }

    if (
      [
        constant.CVOTE_STATUS.NOTIFICATION,
        constant.CVOTE_STATUS.VETOED
      ].includes(proposal.status) &&
      proposal.rejectAmount >= 0 &&
      proposal.rejectThroughAmount > 0
    ) {
      notificationResult['rejectAmount'] = `${proposal.rejectAmount}`
      notificationResult['rejectThroughAmount'] = `${parseFloat(
        _.toNumber(proposal.rejectThroughAmount).toFixed(8)
      )}`
      notificationResult['rejectRatio'] = _.toNumber(
        (
          _.toNumber(proposal.rejectAmount) /
          _.toNumber(proposal.rejectThroughAmount)
        ).toFixed(4)
      )
    }

    let fund = []
    if (proposal.budget) {
      _.forEach(proposal.budget, (o) => {
        fund.push(_.omit(o, ['reasons', 'status', 'milestoneKey']))
      })
    }

    return _.omit(
      {
        id: proposal.vid,
        title: proposal.title,
        status: PROPOSAL_STATUS_TO_CHAIN_STATUS[proposal.status],
        type: constant.CVOTE_TYPE_API[proposal.type],
        abs: proposal.abstract,
        address,
        targetProposalTitle: targetProposal && targetProposal.title,
        ..._.omit(proposal._doc, [
          'vid',
          'abstract',
          'type',
          'rejectAmount',
          'rejectThroughAmount',
          'status',
          'voteHistory',
          'notificationEndsHeight',
          'proposedEndsHeight',
          'budget'
        ]),
        fund,
        ...notificationResult,
        createdAt: timestamp.second(proposal.createdAt),
        voteResult,
        tracking,
        summary
      },
      ['_id']
    )
  }

  public async walletVote(param: any) {
    const db_user = this.getDBModel('User')
    const db_cvote = this.getDBModel('CVote')
    const db_council = this.getDBModel('Council')

    const rs: any = jwt.verify(
      param.params,
      process.env.WALLET_VOTE_PUBLIC_KEY,
      {
        algorithms: ['ES256']
      }
    )
    if (rs.exp < (new Date().getTime() / 1000).toFixed()) {
      throw 'Request expired'
    }

    if (rs.command !== API_VOTE_TYPE.PROPOSAL) {
      throw 'Invalid command'
    }
    const { status, reason, reasonHash, proposalHash, did } = rs.data
    const voteDid = DID_PREFIX + did
    const user = await db_user.getDBInstance().findOne({ 'did.id': voteDid })
    if (!user) {
      throw 'This user doesn‘t exist'
    }
    if (user.role !== constant.USER_ROLE.COUNCIL) {
      throw 'This user not a coumcil'
    }
    const currentCouncil = await db_council.getDBInstance().findOne({
      status: constant.TERM_COUNCIL_STATUS.CURRENT
    })
    if (!_.find(currentCouncil.councilMembers, { did })) {
      throw 'This user not a coumcil'
    }
    const proposal = await db_cvote
      .getDBInstance()
      .findOne({ proposalHash: proposalHash })
    if (!proposal) {
      throw 'Invalid proposal hash'
    }
    const votedRs: any = _.find(proposal.voteResult, { votedBy: user._id })
    if (!votedRs) {
      throw 'This vote undefined'
    }
    if (
      votedRs.status == constant.CVOTE_CHAIN_STATUS.UNCHAIN &&
      votedRs.value != 'undecided'
    ) {
      throw 'The voting status has not been updated'
    }
    const data = {
      _id: proposal._id,
      value: status,
      reason,
      reasonHash,
      votedByWallet: user._id
    }
    this.vote(data)
  }

  public async vote(param): Promise<Document> {
    const db_cvote = this.getDBModel('CVote')
    const db_cvote_history = this.getDBModel('CVote_Vote_History')

    const { _id, value, reason, reasonHash, votedByWallet } = param
    const cur = await db_cvote.findOne({ _id })
    const votedBy = _.isEmpty(votedByWallet)
      ? _.get(this.currentUser, '_id')
      : votedByWallet
    if (!cur) {
      throw 'invalid proposal id'
    }
    const currentVoteResult = _.find(cur._doc.voteResult, ['votedBy', votedBy])
    const reasonCreateDate = new Date()
    await db_cvote.update(
      {
        _id,
        'voteResult.votedBy': votedBy
      },
      {
        $set: {
          'voteResult.$.value': value,
          'voteResult.$.reason': reason || '',
          'voteResult.$.status': constant.CVOTE_CHAIN_STATUS.UNCHAIN,
          'voteResult.$.reasonHash':
            reasonHash ||
            utilCrypto.sha256D(reason + timestamp.second(reasonCreateDate)),
          'voteResult.$.reasonCreatedAt': reasonCreateDate
        },
        $inc: {
          __v: 1
        }
      }
    )

    if (
      !_.find(currentVoteResult, ['value', constant.CVOTE_RESULT.UNDECIDED])
    ) {
      await db_cvote_history.save({
        ..._.omit(currentVoteResult, ['_id']),
        proposalBy: _id
      })
    }

    return await this.getById(_id)
  }

  public async getById(id): Promise<any> {
    const db_cvote = this.getDBModel('CVote')
    const db_cvote_history = this.getDBModel('CVote_Vote_History')
    // access proposal by reference number
    const isNumber = /^\d*$/.test(id)
    let query: any
    if (isNumber) {
      query = { vid: parseInt(id), old: { $exists: false } }
    } else {
      query = { _id: id }
    }
    const rs = await db_cvote
      .getDBInstance()
      .findOne(query)
      .populate(
        'voteResult.votedBy',
        constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
      )
      .populate('proposer', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)
      .populate('createdBy', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)
      .populate('reference', constant.DB_SELECTED_FIELDS.SUGGESTION.ID)
      .populate('referenceElip', 'vid')

    if (!rs) {
      return { success: true, empty: true }
    }

    const voteHistory = await db_cvote_history
      .getDBInstance()
      .find({ proposalBy: rs._doc._id })
      .populate('votedBy', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)

    _.forEach(rs._doc.voteResult, (o: any) => {
      if (
        o.status === constant.CVOTE_CHAIN_STATUS.CHAINED &&
        !_.find(voteHistory, { txid: o.txid })
      ) {
        voteHistory.push({
          ...o._doc,
          isCurrentVote: true
        })
      }
    })

    const res = { ...rs._doc }
    res.voteHistory = _.sortBy(voteHistory, function (item) {
      return -item.reasonCreatedAt
    })
    if (!_.isEmpty(res.relevance)) {
      let relevanceStr = ''
      _.forEach(res.relevance[0] && res.relevance[0]._doc, (v, k) => {
        if (k === '0') {
          _.forEach(res.relevance[0]._doc, (v) => {
            relevanceStr += v
          })
        }
        return
      })
      if (!_.isEmpty(relevanceStr)) {
        res.relevance = relevanceStr
      }
    }
    if (res.budgetAmount) {
      const doc = JSON.parse(JSON.stringify(res))
      // deal with 7e-08
      doc.budgetAmount = Big(doc.budgetAmount).toFixed()
      return doc
    }
    return res
  }
}
