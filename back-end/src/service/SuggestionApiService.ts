import Base from './Base'
import * as _ from 'lodash'
import { constant } from '../constant'
import { timestamp } from '../utility'

export default class extends Base {
  private model: any
  private zipFileModel: any
  protected init() {
    this.model = this.getDBModel('Suggestion')
    this.zipFileModel = this.getDBModel('Suggestion_Zip_File')
  }

  public async list(param: any): Promise<Object> {
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
      temp.proposedBy = _.get(o, 'createdBy.did.id')
      temp.createdAt = timestamp.second(temp.createdAt)
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
      list: list,
      total
    }
  }

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
    const rs = this.zipFileModel.getDBInstance().findOne({ draftHash })
    if (!rs) {
      return {
        code: 400,
        message: 'Invalid this draft hash',
        // tslint:disable-next-line:no-null-keyword
        data: null
      }
    }
    return {
      hexString: rs.content.toString('hex')
    }
  }
}
