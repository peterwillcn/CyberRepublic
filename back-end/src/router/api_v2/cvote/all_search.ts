import Base from '../../Base'
import CVoteApiService from '../../../service/CVoteApiService'

export default class extends Base {
  protected needLogin = false

  async action() {
    const param = this.getParam()
    const service = this.buildService(CVoteApiService)

    const rs = await service.allOrSearch(param)
    return this.result(1, rs)
  }
}
