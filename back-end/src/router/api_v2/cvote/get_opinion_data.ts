import Base from '../../Base'
import CvoteApiService from '../../../service/CvoteApiService'

export default class extends Base {
  protected needLogin = false

  async action() {
    const param = this.getParam()
    const service = this.buildService(CvoteApiService)

    const rs = await service.getOpinionData(param)
    return this.result(1, rs)
  }
}
