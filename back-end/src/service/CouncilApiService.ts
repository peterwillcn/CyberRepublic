import Base from './Base'
import * as _ from 'lodash'
import * as moment from 'moment'
import { constant } from '../constant'
import { timestamp, ela } from '../utility'

/**
 * API v1 and v2 for ELA Wallet and Essentials
 */

export const CVOTE_STATUS_TO_WALLET_STATUS = {
  [constant.CVOTE_STATUS.PROPOSED]: 'VOTING',
  [constant.CVOTE_STATUS.NOTIFICATION]: 'NOTIFICATION',
  [constant.CVOTE_STATUS.ACTIVE]: 'ACTIVE',
  [constant.CVOTE_STATUS.FINAL]: 'FINAL',
  [constant.CVOTE_STATUS.REJECT]: 'REJECTED',
  [constant.CVOTE_STATUS.DEFERRED]: 'REJECTED',
  [constant.CVOTE_STATUS.VETOED]: 'VETOED'
}

export default class extends Base {
  private model: any
  private secretariatModel: any
  private userMode: any
  private proposalMode: any
  private configModel: any
  private candidateModel: any

  protected init() {
    this.model = this.getDBModel('Council')
    this.secretariatModel = this.getDBModel('Secretariat')
    this.userMode = this.getDBModel('User')
    this.proposalMode = this.getDBModel('CVote')
    this.configModel = this.getDBModel('Config')
    this.candidateModel = this.getDBModel('Candidate')
  }

  public async term(): Promise<any> {
    const fields = ['index', 'startDate', 'endDate', 'status']

    const result = await this.model.getDBInstance().find({}, fields)

    const currentConfig = await this.configModel.getDBInstance().findOne()
    const crRelatedStageStatus = await ela.getCrrelatedStage()
    // prettier-ignore
    const {
      ondutyendheight,
      invoting,
      votingstartheight,
      votingendheight
    } = crRelatedStageStatus
    const { currentHeight } = currentConfig
    let votingStart
    if (invoting) {
      votingStart = await ela.getTimestampByHeight(votingstartheight)
    }
    let blockMinute = 2 * 60
    // if (process.env.NODE_ENV !== 'production') {
    //   blockMinute = 252 * 60
    // }
    return _.map(result, (o: any) => {
      let dateObj = {}
      if (o.status !== constant.TERM_COUNCIL_STATUS.VOTING) {
        const difference = (ondutyendheight - currentHeight) * blockMinute
        dateObj['startDate'] = o.startDate && moment(o.startDate).unix()
        if (!o.endDate) {
          dateObj['endDate'] = difference + moment().unix()
        }
      }
      if (o.status == constant.TERM_COUNCIL_STATUS.VOTING && invoting) {
        const difference = (votingendheight - currentHeight) * blockMinute
        dateObj['startDate'] = votingStart
        dateObj['endDate'] = difference + moment().unix()
      }
      if (o.status === constant.TERM_COUNCIL_STATUS.HISTORY) {
        dateObj['endDate'] = o.endDate && moment(o.endDate).unix()
      }
      return {
        id: o._id,
        ..._.omit(o._doc, ['_id', 'startDate', 'endDate']),
        ...dateObj
      }
    })
  }

  public async councilList(id: number): Promise<any> {
    const fields = [
      'status',
      'councilMembers.didName',
      'councilMembers.cid',
      'councilMembers.avatar',
      'councilMembers.did',
      'councilMembers.user.did',
      'councilMembers.location',
      'councilMembers.status',
      'councilMembers.impeachmentVotes'
    ]

    const secretariatFields = [
      'did',
      'didName',
      'avatar',
      'user.did',
      'location',
      'startDate',
      'endDate',
      'status'
    ]

    const query = {}

    if (id) {
      query['index'] = id
    } else {
      query['status'] = constant.TERM_COUNCIL_STATUS.CURRENT
    }

    const result = await this.model
      .getDBInstance()
      .findOne(query, fields)
      .populate(
        'councilMembers.user',
        constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
      )

    const secretariatResult = await this.secretariatModel
      .getDBInstance()
      .find({}, secretariatFields)
      .sort({ startDate: -1 })
      .populate('user', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)

    if (!result) {
      return {
        code: 400,
        message: 'Invalid request parameters',
        // tslint:disable-next-line:no-null-keyword
        data: null
      }
    }

    let circulatingSupply
    if (result.status === constant.TERM_COUNCIL_STATUS.CURRENT) {
      circulatingSupply = (await ela.currentCirculatingSupply()) * 0.2
    }

    const filterFields = (o: any, status: any) => {
      const fields = ['_id', 'user', 'startDate', 'endDate']
      if (status !== constant.TERM_COUNCIL_STATUS.CURRENT) {
        fields.push('impeachmentVotes')
        return _.omit(o, fields)
      }

      if (
        o.impeachmentVotes >= 0 &&
        circulatingSupply &&
        circulatingSupply > 0
      ) {
        o.rejectRatio =
          o.impeachmentVotes == 0
            ? 0
            : _.toNumber(
                (
                  _.toNumber(o.impeachmentVotes) / _.toNumber(circulatingSupply)
                ).toFixed(8)
              )
      }
      return _.omit(o, fields)
    }

    const councilList =
      result.status === constant.TERM_COUNCIL_STATUS.VOTING
        ? result.councilMembers
        : _.filter(result.councilMembers, (e: any) =>
            [
              constant.COUNCIL_STATUS.ELECTED,
              constant.COUNCIL_STATUS.IMPEACHED,
              constant.COUNCIL_STATUS.TERMINATED
            ].includes(e.status)
          )
    const council = _.map(councilList, (o: any) => ({
      ...filterFields(o._doc, result.status),
      ...this.getUserInformation(o._doc, o.user)
    }))

    const secretariat = _.map(secretariatResult, (o: any) => ({
      ...filterFields(o._doc, null),
      ...this.getUserInformation(o._doc, o.user),
      startDate: moment(o.startDate).unix(),
      endDate: o.endDate && moment(o.endDate).unix()
    }))

    return {
      council,
      secretariat,
      circulatingSupply
    }
  }

  public async councilInformation(param: any): Promise<any> {
    const db_cvote_history = this.getDBModel('CVote_Vote_History')
    let { id, did } = param
    if (!did) {
      throw 'invalid did'
    }

    // query council
    const fields = [
      'height',
      'circulatingSupply',
      'status',
      'councilMembers.didName',
      'councilMembers.avatar',
      'councilMembers.user.did',
      'councilMembers.cid',
      'councilMembers.did',
      'councilMembers.address',
      'councilMembers.introduction',
      'councilMembers.impeachmentVotes',
      'councilMembers.depositAmount',
      'councilMembers.location',
      'councilMembers.status'
    ]
    const query = {
      councilMembers: {
        $elemMatch: {
          did,
          status: {
            $in: [
              constant.COUNCIL_STATUS.ELECTED,
              constant.COUNCIL_STATUS.IMPEACHED,
              constant.COUNCIL_STATUS.INACTIVE
            ]
          }
        }
      }
    }
    if (id) {
      query['index'] = id
    } else {
      query['status'] = constant.TERM_COUNCIL_STATUS.CURRENT
    }
    const councilList = await this.model
      .getDBInstance()
      .findOne(query, fields)
      .populate(
        'councilMembers.user',
        constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
      )

    // query secretariat
    const secretariatFields = [
      'user.did',
      'did',
      'address',
      'location',
      'birthday',
      'email',
      'introduction',
      'wechat',
      'weibo',
      'facebook',
      'microsoft',
      'startDate',
      'endDate',
      'status'
    ]
    const querySec = { did }
    if (id) {
      querySec['term'] = id
    } else {
      querySec['status'] = constant.SECRETARIAT_STATUS.CURRENT
    }
    const secretariat = await this.secretariatModel
      .getDBInstance()
      .findOne(querySec, secretariatFields)
      .populate('user', constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID)

    if (!councilList && !secretariat) {
      const query = {
        term: id,
        members: { $elemMatch: { did } }
      }
      const result = await this.candidateModel.findOne(query)
      if (result) {
        const assets = await ela.depositCoin(did)
        return {
          type: 'UnelectedCouncilMember',
          depositAmount: _.get(assets, 'available')
        }
      }
      return {
        type: 'Other'
      }
    }

    if (councilList) {
      const council =
        councilList &&
        _.filter(councilList.councilMembers, (o: any) => o.did === did)[0]

      let term = []
      let impeachmentObj = {}
      if (councilList.status !== constant.TERM_COUNCIL_STATUS.VOTING) {
        const currentCouncil = await ela.currentCouncil()
        const thisDidInfo: any = _.find(currentCouncil.crmembersinfo, { did })
        // prettier-ignore
        impeachmentObj['dpospublickey'] = thisDidInfo && thisDidInfo.dpospublickey
        // update impeachment
        const circulatingSupply = councilList.circulatingSupply
          ? councilList.circulatingSupply
          : await ela.circulatingSupply(councilList.height)
        const impeachmentThroughVotes = circulatingSupply * 0.2
        impeachmentObj['impeachmentVotes'] = council.impeachmentVotes
        impeachmentObj['impeachmentThroughVotes'] = _.toNumber(
          impeachmentThroughVotes.toFixed(8)
        )
        impeachmentObj['impeachmentRatio'] = _.toNumber(
          (council.impeachmentVotes / impeachmentThroughVotes).toFixed(4)
        )
        // update term
        if (council && council.user) {
          const proposalFields = [
            'createdBy',
            'createdAt',
            'vid',
            'title',
            'status',
            'voteResult'
          ]
          const proposalList = await this.proposalMode
            .getDBInstance()
            .find(
              {
                $or: [
                  { proposer: council.user._id },
                  { 'voteResult.votedBy': council.user._id }
                ]
              },
              proposalFields
            )
            .sort({ createdAt: -1 })
            .populate(
              'createdBy',
              constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
            )
          const cvoteHistory = await db_cvote_history
            .getDBInstance()
            .find({ votedBy: council.user._id })
            .populate(
              'votedBy',
              constant.DB_SELECTED_FIELDS.USER.NAME_EMAIL_DID
            )
          const history = _.keyBy(cvoteHistory, 'votedBy._id')
          term = _.map(proposalList, (o: any) => {
            const didName = _.get(o, 'createdBy.did.didName')
            let voteResult = _.filter(
              o.voteResult,
              (o: any) =>
                council.user._id.equals(o.votedBy) &&
                o.status == constant.CVOTE_CHAIN_STATUS.CHAINED
            )
            if (_.isEmpty(voteResult)) {
              voteResult = _.filter(
                history,
                (e: any) =>
                  e.proposalBy.equals(o._id) &&
                  e.status == constant.CVOTE_CHAIN_STATUS.CHAINED
              )
            }
            const currentVoteResult = _.get(voteResult[0], 'value')
            return {
              id: o.vid,
              title: o.title,
              didName,
              status: CVOTE_STATUS_TO_WALLET_STATUS[o.status],
              voteResult: currentVoteResult,
              createdAt: moment(o.createdAt).unix()
            }
          })
          term = _.filter(term, (o: any) => {
            return (
              o.voteResult && o.voteResult !== constant.CVOTE_RESULT.UNDECIDED
            )
          })
        }
      }
      if (
        councilList.status === constant.TERM_COUNCIL_STATUS.HISTORY &&
        [
          constant.COUNCIL_STATUS.ELECTED,
          constant.COUNCIL_STATUS.INACTIVE
        ].includes(council.status)
      ) {
        council.status = constant.COUNCIL_STATUS.EXPIRED
      }
      const assets = await ela.depositCoin(did)
      if (assets) {
        council.depositAmount = _.get(assets, 'available')
      }
      return {
        ..._.omit(council._doc, ['_id', 'user', 'impeachmentVotes']),
        ...this.getUserInformation(council._doc, council.user),
        ...impeachmentObj,
        term,
        type: 'CouncilMember'
      }
    }

    if (secretariat) {
      return {
        ..._.omit(secretariat._doc, ['_id', 'user', 'startDate', 'endDate']),
        ...this.getUserInformation(secretariat._doc, secretariat.user),
        startDate: moment(secretariat.startDate).unix(),
        endDate: secretariat.endDate && moment(secretariat.endDate).unix(),
        type: 'SecretaryGeneral'
      }
    }
  }

  private getUserInformation(obj: any, user: any) {
    const { didName, avatar }: any = obj || {}
    const { didName: userDidName, avatar: userAvatar }: any =
      (user && user.did && _.pick(user.did, ['didName', 'avatar'])) || {}
    return this.filterNullField({
      didName: userDidName || didName,
      avatar: userAvatar || avatar
    })
  }

  private filterNullField(obj: object) {
    return _.pickBy(obj, _.identity)
  }
}
