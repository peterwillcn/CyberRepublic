import Base from './Base'
import { CouncilMemberOpinionZipFile } from './schema/CouncilMemberOpinionZipFile'

export default class extends Base {
  protected getSchema() {
    return CouncilMemberOpinionZipFile
  }
  protected getName() {
    return 'council_member_opinion_zip_file'
  }
}
