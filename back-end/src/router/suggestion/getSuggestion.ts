import Base from '../Base'
import SuggestionApiService from '../../service/SuggestionApiService'

export default class extends Base {
  protected needLogin = false

  public async action() {
    const service = this.buildService(SuggestionApiService)
    const param = this.getParam()

    const result = await service.getSuggestion(param.id)

    return this.result(1, result)
  }
}
