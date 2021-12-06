import Base from '../../Base'
import getSuggestion from './getSuggestion'
import all_search from './all_search'
import getDraftData from './get_draft_data'
import signature from './signature'

export default Base.setRouter([
  {
    path: '/get_suggestion/:id',
    router: getSuggestion,
    method: 'get'
  },
  {
    path: '/all_search',
    router: all_search,
    method: 'get'
  },
  {
    path: '/draft_data/:draftHash',
    router: getDraftData,
    method: 'get'
  },
  {
    path: '/signature',
    router: signature,
    method: 'post'
  }
])
