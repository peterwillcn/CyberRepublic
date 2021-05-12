import Base from '../Base'
import CouncilService from '../../service/CouncilService'

export default class extends Base {
  async action() {
    const service = this.buildService(CouncilService)

    // service.cronJob();

    const rs = await service.invoting()
    return this.result(1, rs)
  }
}
