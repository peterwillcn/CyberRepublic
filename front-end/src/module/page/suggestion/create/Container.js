import { createContainer } from '@/util'
import Component from './Component'
import SuggestionService from '@/service/SuggestionService'
import CVoteService from '@/service/CVoteService'

export default createContainer(
  Component,
  (state) => {
    return {
      currentUserId: state.user.current_user_id,
      isCouncil: state.user.is_council,
      isAdmin: state.user.is_admin
    }
  },
  () => {
    const service = new SuggestionService()
    const cvoteService = new CVoteService()
    return {
      createSuggestion(suggestion) {
        return service.create(suggestion)
      },
      async getActiveProposals() {
        return cvoteService.getActiveProposals()
      }
    }
  }
)
