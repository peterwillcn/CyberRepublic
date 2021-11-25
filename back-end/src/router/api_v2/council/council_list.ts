import Base from '../../Base'
import CouncilApiService from '../../../service/CouncilApiService'

export default class extends Base {
  async action() {
    const param = this.getParam()
    const service = this.buildService(CouncilApiService)

    const rs = await service.councilList(param.id)
    return this.result(1, rs)
  }
}
