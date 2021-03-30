import { createContainer } from '@/util'
import Component from './Component'
import CvoteService from '@/service/CVoteService'

const mapState = state => ({})

const mapDispatch = () => {
  const service = new CvoteService()
  return {
    async getProposalTitle(param) {
      return service.getProposalTitle(param)
    }
  }
}

export default createContainer(Component, mapState, mapDispatch)
