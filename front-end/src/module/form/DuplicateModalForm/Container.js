import { createContainer } from '@/util'
import Component from './Component'
import SuggestionService from '@/service/SuggestionService'

const mapState = state => ({})

const mapDispatch = () => {
  const service = new SuggestionService()
  return {
    async getSuggestion(param) {
      return service.getSuggestionByNumber(param)
    }
  }
}

export default createContainer(Component, mapState, mapDispatch)
