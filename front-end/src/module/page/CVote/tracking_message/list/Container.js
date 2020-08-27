import { createContainer } from '@/util'
import Component from './Component'
import TrackingMessageService from '@/service/TrackingMessageService'

const mapState = (state) => ({})

const mapDispatch = () => {
  const service = new TrackingMessageService()
  return {
    async list(param) {
      return service.list(param)
    }
  }
}

export default createContainer(Component, mapState, mapDispatch)
