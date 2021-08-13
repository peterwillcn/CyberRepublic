import React, { Component } from 'react'
import styled from 'styled-components'
import { Popover, Spin } from 'antd'
import I18N from '@/I18N'
import QRCode from 'qrcode.react'
import SwitchSvgIcon from '@/module/common/SwitchSvgIcon'

class OnChainButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      oldUrl: '',
      visible: false,
      toggle: false
    }
  }

  handleSwitch = () => {
    this.setState({ toggle: !this.state.toggle })
  }

  qrCode = () => {
    const { url, oldUrl, toggle } = this.state
    return (
      <Content>
        {url ? <QRCode value={toggle ? oldUrl : url} size={180} /> : <Spin />}
        <Tip>
          {toggle
            ? I18N.get('council.voting.ela')
            : I18N.get('council.voting.essentials')}
        </Tip>
        {url && (
          <SwitchWrapper>
            <SwitchSvgIcon />
            <SwitchButton onClick={this.handleSwitch}>
              {toggle
                ? I18N.get('council.voting.scan.ela')
                : I18N.get('council.voting.scan.essentials')}
            </SwitchButton>
          </SwitchWrapper>
        )}
      </Content>
    )
  }

  componentDidMount = async () => {
    const { id, getReviewProposalUrl } = this.props
    const rs = await getReviewProposalUrl(id)
    if (rs && rs.success) {
      this.setState({ url: rs.url, oldUrl: rs.oldUrl })
    }
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible })
  }

  render() {
    let domain
    if (process.env.NODE_ENV === 'development') {
      domain = 'blockchain-did-regtest'
    } else {
      domain = 'idchain'
    }
    return (
      <Popover
        content={this.qrCode()}
        trigger="click"
        placement="top"
        visible={this.state.visible}
        onVisibleChange={this.handleVisibleChange}
      >
        <Button>{I18N.get('council.voting.voteResult.onchain')}</Button>
      </Popover>
    )
  }
}

export default OnChainButton

const Button = styled.span`
  display: inline-block;
  margin-bottom: 16px;
  font-size: 13px;
  border: 1px solid #008d85;
  color: #008d85;
  text-align: center;
  padding: 6px 16px;
  cursor: pointer;
`
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
