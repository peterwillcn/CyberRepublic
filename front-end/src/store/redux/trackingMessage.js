import BaseRedux from '@/model/BaseRedux'

class trackingMessageRedux extends BaseRedux {
  defineTypes() {
    return ['tracking_message']
  }

  defineDefaultState() {
    return {
      loading: false,
      all_public: []
    }
  }
}

export default new trackingMessageRedux()
