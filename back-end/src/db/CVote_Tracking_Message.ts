import Base from './Base'
import { CVote_Tracking_Message } from './schema/CVoteTrackingMessageSchema'

export default class extends Base {
  protected getSchema() {
    return CVote_Tracking_Message
  }
  protected getName() {
    return 'cvote_tracking_message'
  }
  protected rejectFields() {
    return {}
  }
}
