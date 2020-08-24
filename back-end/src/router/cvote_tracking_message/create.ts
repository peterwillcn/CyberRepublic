import Base from '../Base'
import CVoteTrackingMessageService from '../../service/CVoteTrackingMessageService'

export default class extends Base {
  protected needLogin = true
  async action() {
    const param = this.getParam()
    const service = this.buildService(CVoteTrackingMessageService)

    const rs = await service.create(param)
    return this.result(1, rs)
  }
}
