import React, { Component } from 'react'
import styled from 'styled-components'
import QRCode from 'qrcode.react'
import { Modal } from 'antd'
import I18N from '@/I18N'
import SwitchSvgIcon from '@/module/common/SwitchSvgIcon'

class WithdrawMoney extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      oldUrl: '',
      message: '',
      toggle: ''
    }
  }

  hideModal = () => {
    this.props.hideModal()
  }

  handleSwitch = () => {
    this.setState({ toggle: !this.state.toggle })
  }

  componentDidMount = async () => {
    const { proposalId, withdraw, stage } = this.props
    const rs = await withdraw(proposalId, stage)
    if (rs && !rs.success) {
      this.setState({ message: rs.message })
    }
    if (rs && rs.success) {
      this.setState({ url: rs.url, message: '', oldUrl: rs.oldUrl })
    }
  }

  render() {
    const { url, message, oldUrl, toggle } = this.state
    return (
      <Modal
        maskClosable={false}
        visible={this.props.withdrawal}
        onCancel={this.hideModal}
        footer={null}
      >
        {url ? (
          <Content>
            <QRCode value={toggle ? oldUrl : url} size={300} />
            <Tip>{I18N.get('milestone.scanToWithdraw')}</Tip>

            <SwitchWrapper>
              <SwitchSvgIcon />
              <SwitchButton onClick={this.handleSwitch}>
                {I18N.get('milestone.scanEla')}
              </SwitchButton>
            </SwitchWrapper>
          </Content>
        ) : (
          <Content>{message}</Content>
        )}
      </Modal>
    )
  }
}

export default WithdrawMoney

const Content = styled.div`
  padding: 24px 24px 14px;
  text-align: center;
`
const Tip = styled.div`
  font-size: 12px;
  color: #333333;
  margin-top: 16px;
  font-weight: 400;
  line-height: 17px;
`
const SwitchWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`
const SwitchButton = styled.span`
  color: #65bda3;
  font-size: 12px;
  padding-left: 4px;
  cursor: pointer;
  font-weight: 400;
  line-height: 17px;
`
