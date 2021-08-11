import React, { Component } from 'react'
import styled from 'styled-components'
import { Modal, Spin, Button } from 'antd'
import QRCode from 'qrcode.react'
import I18N from '@/I18N'
import SwitchSvgIcon from '@/module/common/SwitchSvgIcon'
import { StyledButton } from './style'

class CMSignSuggestionButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      oldUrl: '',
      visible: false,
      loading: false,
      isBound: false,
      toggle: false
    }
  }

  handleSwitch = () => {
    this.setState({ toggle: !this.state.toggle })
  }

  elaQrCode = () => {
    const { url, isBound, message, toggle, oldUrl } = this.state
    if (!isBound) {
      return (
        <Content>
          <Notice>{I18N.get('suggestion.msg.associateDidFirst')}</Notice>
          <Button
            className="cr-btn cr-btn-primary"
            onClick={() => {
              this.props.history.push('/profile/info')
            }}
          >
            {I18N.get('suggestion.btn.associateDid')}
          </Button>
        </Content>
      )
    }
    if (isBound && message) {
      return <Content>{message}</Content>
    }
    return (
      <Content>
        {url ? <QRCode value={toggle ? oldUrl : url} size={240} /> : <Spin />}
        <Tip>{I18N.get('suggestion.msg.councilQRCode')}</Tip>
        {url && (
          <SwitchWrapper>
            <SwitchSvgIcon />
            <SwitchButton onClick={this.handleSwitch}>
              {I18N.get('suggestion.msg.scanEla')}
            </SwitchButton>
          </SwitchWrapper>
        )}
      </Content>
    )
  }

  handleSign = async () => {
    const { user } = this.props
    if (user && user.did && user.did.id) {
      this.setState({ isBound: true, visible: true })
    } else {
      this.setState({ isBound: false, visible: true })
    }
  }

  componentDidMount = async () => {
    const { id, getCMSignatureUrl, user } = this.props
    if (user && user.did && user.did.id) {
      const rs = await getCMSignatureUrl(id)
      if (rs && rs.success) {
        this.setState({ url: rs.url, message: '', oldUrl: rs.oldUrl })
      }
      if (rs && !rs.success && rs.message) {
        this.setState({ message: rs.message, url: '', oldUrl: '' })
      }
    }
  }

  hideModal = () => {
    this.setState({ visible: false })
  }

  render() {
    const { visible } = this.state
    return (
      <div>
        <StyledButton
          type="ebp"
          className="cr-btn cr-btn-default"
          onClick={this.handleSign}
        >
          {I18N.get('suggestion.btn.makeIntoProposal')}
        </StyledButton>
        <Modal
          maskClosable={false}
          visible={visible}
          onCancel={this.hideModal}
          footer={null}
          width={500}
        >
          {this.elaQrCode()}
        </Modal>
      </div>
    )
  }
}

export default CMSignSuggestionButton

const Content = styled.div`
  padding: 16px;
  text-align: center;
`
const Tip = styled.div`
  font-size: 12px;
  color: #333333;
  margin-top: 16px;
`
const Notice = styled.div`
  font-size: 16px;
  color: #000;
  margin-bottom: 24px;
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
