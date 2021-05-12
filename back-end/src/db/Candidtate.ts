import Base from './Base'
import { Candidate } from './schema/CandidateSchema'

export default class extends Base {
  protected getSchema() {
    return Candidate
  }
  protected getName() {
    return 'candidates'
  }
}
