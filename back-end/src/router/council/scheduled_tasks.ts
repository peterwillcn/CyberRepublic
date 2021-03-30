import Base from '../Base'
import CouncilService from '../../service/CouncilService'
import CVoteService from '../../service/CVoteService'

export default class extends Base {
    async action() {
        // const service = this.buildService(CouncilService)
        const service = this.buildService(CouncilService)
        const rs = await Promise.all([
            service.eachSecretariatJob(),
            service.eachCouncilJobPlus()
        ])
        return this.result(1, rs)
    }
}
