import Base from '../../Base'
import CVoteApiService from '../../../service/CVoteApiService'

export default class extends Base {
  // protected needLogin = true
  async action() {
    const param = this.getParam()
    const service = this.buildService(CVoteApiService)

    const rs = await service.walletVote(param)
    return this.result(1, rs)
  }
}
