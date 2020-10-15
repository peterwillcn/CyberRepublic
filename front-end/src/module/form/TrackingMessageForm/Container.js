import { createContainer } from '@/util'
import Component from './Component'
import TrackingMessageService from '@/service/TrackingMessageService'

const mapState = (state) => ({
  currentUserId: state.user.current_user_id
})

const mapDispatch = () => {
  const service = new TrackingMessageService()
  return {
    async create(param) {
      return service.create(param)
    }
  }
}

export default createContainer(Component, mapState, mapDispatch)
