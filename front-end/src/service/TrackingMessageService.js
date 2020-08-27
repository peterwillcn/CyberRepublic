import BaseService from '../model/BaseService'
import { api_request, logger } from '@/util'

export default class extends BaseService {
  constructor() {
    super()
    this.prefixPath = '/api/tracking_message'
  }

  async create(param) {
    let rs
    const path = `${this.prefixPath}/create`
    try {
      rs = await api_request({
        path,
        method: 'post',
        data: param
      })
    } catch (error) {
      logger.error(error)
    }
    return rs
  }

  async list(param) {
    let result
    try {
      result = await api_request({
        path: `${this.prefixPath}/list`,
        method: 'get',
        data: param
      })
      return result
    } catch (error) {
      logger.error(error)
    }
  }
}
