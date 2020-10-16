import BaseService from '../model/BaseService'
import { api_request } from '@/util'
import { Base64 } from 'js-base64'

export default class extends BaseService {
  constructor() {
    super()
    // this.selfRedux = this.store.getRedux('google')
    this.prefixPath = '/api/google'
  }

  async translate(param) {
    const path = `${this.prefixPath}/translate`
    const {target, text} = param
    const res = await api_request({
      path,
      method: 'post',
      data: { text: Base64.encode(text), target },
    })
    return res
  }
}
