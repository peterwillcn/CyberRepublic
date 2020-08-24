import Base from '../Base'
import CVoteTrackingMessageService from '../../service/CVoteTrackingMessageService'

export default class extends Base {
  async action() {
    const param = this.getParam()
    const service = this.buildService(CVoteTrackingMessageService)
    const rs = await service.list(param)
    return this.result(1, rs)
  }
}
