import { createContainer } from '@/util'
import Component from './Component'
import UserService from '@/service/UserService'
import CouncilService from '@/service/CouncilService'
import { message } from 'antd/lib/index'
import _ from 'lodash'
import { logger } from '@/util'
import I18N from '@/I18N'

export default createContainer(Component, (state) => {
  if (!_.isArray(state.member.users)) {
    state.member.users = _.values(state.member.users)
  }

  return {
    loading: state.member.users_loading,
    is_admin: state.user.is_admin,
    users: state.member.users || [],
  }
}, () => {
  const userService = new UserService()
  const councilService = new CouncilService()
  return {
    async listUsers() {
      try {
        return await userService.getAll({ admin: true })
      } catch (err) {
        message.error(err.message)
        logger.error(err)
      }
    },
    async updateCouncilAndSecretariatRole() {
      try {
        await councilService.udateCouncilAndSecretariat()
        message.success(I18N.get("user.update.council.secretariat.success"))
      } catch (err) {
        message.error(err.message)
        logger.error(err)
      }
    }
  }
})
