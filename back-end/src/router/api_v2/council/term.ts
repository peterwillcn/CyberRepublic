import Base from '../../Base'
import CouncilApiService from '../../../service/CouncilApiService'

export default class extends Base {
  async action() {
    const service = this.buildService(CouncilApiService)

    const rs = await service.term()
    return this.result(1, rs)
  }
}
