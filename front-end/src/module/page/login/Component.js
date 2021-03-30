import React from 'react'
import LoginOrRegisterForm from '@/module/form/LoginOrRegisterForm/Container'
import I18N from '@/I18N'

import './style.scss'
import URI from 'urijs'

import StandardPage from '../StandardPage'

export default class extends StandardPage {
  ord_renderContent() {
    const params = new URI(this.props.location.search || '').search(true)

    return (
      <div className="p_login ebp-wrap">
        <div className="d_box">
          <div className="side-image">
            <img src="/assets/images/login-left-extended.svg" />
          </div>
          <div>
            {params.MSG_CODE && (
              <div className="login-msg">{I18N.get('login.access.forum')}</div>
            )}
            <div className="side-form">
              <LoginOrRegisterForm />
            </div>
          </div>
        </div>
      </div>
    )
  }

  ord_checkLogin(isLogin) {
    if (isLogin) {
      this.props.history.replace('/profile/info')
    }
  }
}
