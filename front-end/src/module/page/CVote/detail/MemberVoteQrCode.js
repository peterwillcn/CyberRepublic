import React, { Component } from 'react'
import styled from 'styled-components'
import I18N from '@/I18N'
import QRCode from 'qrcode.react'
import { Popover } from 'antd'
import UploadSvgIcon from '@/module/common/UploadSvgIcon'

class MemberVoteQrCode extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      oldUrl: '',
      visible: false
    }
  }

  componentDidMount = async () => {
    const rs = await this.props.getMemberVoteUrl(this.props._id)
    if (rs && rs.success) {
      this.setState({ url: rs.url, oldUrl: rs.oldUrl })
    }
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible })
  }

  render() {
    const { visible } = this.state
    const content = (
      <Content>
        <div>
          <QRCode value={this.state.url} size={145} />
          <Tip>{I18N.get('profile.member.vote.qrcodeTip')}</Tip>
          <Tip>{I18N.get('profile.member.vote.community')}</Tip>
        </div>
        <div>
          <QRCode value={this.state.oldUrl} size={145} />
          <Tip>{I18N.get('profile.member.vote.qrcodeOldTip')}</Tip>
          <Tip>{I18N.get('profile.member.vote.community')}</Tip>
        </div>
      </Content>
    )
    return (
      <Popover
        visible={visible}
        onVisibleChange={this.handleVisibleChange}
        content={content}
        trigger="click"
        placement="top"
      >
        <ScanEntry>
          <UploadSvgIcon />
          <StyledButton>{I18N.get('profile.member.vote')}</StyledButton>
        </ScanEntry>
      </Popover>
    )
  }
}

export default MemberVoteQrCode

const Content = styled.div`
  padding: 16px;
  min-width: 380px;
  text-align: center;
  display: flex;
  justify-content: space-between;
`
const Tip = styled.div`
  font-size: 13px;
  color: #333333;
  margin-top: 16px;
  opacity: 0.8;
`
const ScanEntry = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 8px rgb(0 0 0 / 15%);
  width: 100px;
  height: 100px;
`
const StyledButton = styled.span`
  font-size: 13px;
  color: #008d85;
  padding-left: 8px;
`
