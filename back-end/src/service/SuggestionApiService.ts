import Base from './Base'
import * as _ from 'lodash'
import { constant } from '../constant'
import { timestamp } from '../utility'

export default class extends Base {
  private model: any
  protected init() {
    this.model = this.getDBModel('Suggestion')
  }

  public async list(param: any): Promise<Object> {
    const { status } = param
    if (
      status &&
      ![
        constant.SUGGESTION_STATUS.ACTIVE,
        constant.SUGGESTION_TAG_TYPE.UNDER_CONSIDERATION
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

    if (!status) {
      query.status = constant.SUGGESTION_STATUS.ACTIVE
    }
    if (status && status.toUpperCase() === constant.SUGGESTION_STATUS.ACTIVE) {
      query.status = constant.SUGGESTION_STATUS.ACTIVE
      query.tags = { $eq: [] }
    }
    if (
      status &&
      status.toUpperCase() === constant.SUGGESTION_TAG_TYPE.UNDER_CONSIDERATION
    ) {
      query['tags.type'] = constant.SUGGESTION_TAG_TYPE.UNDER_CONSIDERATION
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
      'status',
      'type',
      'tags',
      'createdAt',
      'createdBy',
      'proposalHash'
    ]

    const cursor = this.model
      .getDBInstance()
      .find(query, fields.join(' '))
      .populate('createdBy', 'did')
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
      this.model.getDBInstance().find(query).count()
    ])

    const list = _.map(rs[0], function (o) {
      let temp = _.omit(o._doc, ['_id', 'createdBy', 'type', 'tags'])
      temp.proposedBy = _.get(o, 'createdBy.did.id')
      temp.createdAt = timestamp.second(temp.createdAt)
      temp.type = constant.CVOTE_TYPE_API[o.type]
      const index = _.findIndex(
        o.tags,
        (tag: any) => {
          return tag.type === constant.SUGGESTION_TAG_TYPE.UNDER_CONSIDERATION
        },
        0
      )
      if (index !== -1) {
        temp.status = constant.SUGGESTION_TAG_TYPE.UNDER_CONSIDERATION
      }
      return _.mapKeys(temp, function (value, key) {
        if (key == 'displayId') {
          return 'id'
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
}
