import Base from './Base'
import { CVoteVoteHistory } from './schema/CVoteVoteHistory'


export default class extends Base {
    protected getSchema() {
        return CVoteVoteHistory
    }
    protected getName() {
        return 'cvote_vote_history'
    }
}
