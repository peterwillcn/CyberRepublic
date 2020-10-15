import { createContainer } from '@/util'
import Component from './Component'
import TrackingMessageService from '@/service/TrackingMessageService'

const mapState = (state) => ({
  user: state.user,
  currentUserId: state.user.current_user_id,
  isLogin: state.user.is_login
})

const mapDispatch = () => {
  const service = new TrackingMessageService()
  return {
    async create(param) {
      return service.create(param)
    },
    async list(param) {
      return service.list(param)
    }
  }
}

export default createContainer(Component, mapState, mapDispatch)
