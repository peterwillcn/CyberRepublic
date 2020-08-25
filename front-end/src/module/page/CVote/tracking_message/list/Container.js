import { createContainer } from '@/util'
import Component from './Component'
import CVoteTrackingMessageService from '@/service/CVoteTrackingMessageService'

const mapState = state => ({})

const mapDispatch = () => {
  const service = new CVoteTrackingMessageService()
  return {
    async list(param) {
      return service.listData(param)
    }
  }
}

export default createContainer(Component, mapState, mapDispatch)
