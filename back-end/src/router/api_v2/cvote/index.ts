import Base from '../../Base'
import allSearch from './all_search'
import getProposal from './get_proposal'
import walletVote from './wallet_vote'

export default Base.setRouter([
  {
    path: '/all_search',
    router: allSearch,
    method: 'get'
  },
  {
    path: '/get_proposal/:id',
    router: getProposal,
    method: 'get'
  },
  {
    path: '/wallet_vote',
    router: walletVote,
    method: 'post'
  }
])
