import React, { Component, Fragment } from 'react'
import styled from 'styled-components'
import { Popover, Spin, message } from 'antd'
import I18N from '@/I18N'
import QRCode from 'qrcode.react'
import ExternalLinkSvg from './ExternalLinkSvg'
import ScanSvgIcon from '@/module/common/ScanSvgIcon'

class ProfileDid extends Component {
  constructor(props) {
    super(props)
    this.state = {
      url: '',
      oldUrl: '',
      visible: false,
      oldUrlVisible: false
    }
    this.timerDid = null
    this.oldTimerDid = null
  }

  elaQrCode = () => {
    const { oldUrl, url } = this.state
    return (
      <Content>
        <div>
          {oldUrl ? <QRCode value={oldUrl} size={180} /> : <Spin />}
          <Tip>{I18N.get('profile.qrcodeOldTip')}</Tip>
        </div>
        <div>
          {url ? <QRCode value={url} size={180} /> : <Spin />}
          <Tip>{I18N.get('profile.qrcodeTip')}</Tip>
        </div>
      </Content>
    )
  }

  pollingDid = async () => {
    if (!this._isMounted) {
      return
    }
    const rs = await this.props.getNewActiveDid()
    if (rs && rs.success) {
      clearTimeout(this.timerDid)
      this.timerDid = null
      clearTimeout(this.oldTimerDid)
      this.oldTimerDid = null
      this.setState({ url: '', visible: false })
      return
    }
    if (rs && rs.success === false) {
      clearTimeout(this.timerDid)
      this.timerDid = null
      clearTimeout(this.oldTimerDid)
      this.oldTimerDid = null
      if (rs.message) {
        message.error(rs.message)
      } else {
        message.error('Something went wrong')
      }
      this.setState({ visible: false })
      return
    }
    if (this._isMounted) {
      clearTimeout(this.timerDid)
      this.timerDid = setTimeout(this.pollingDid, 3000)
    }
  }

  pollingDidWithOldUrl = async () => {
    if (!this._isMounted) {
      return
    }
    const rs = await this.props.getNewActiveDid()
    if (rs && rs.success) {
      clearTimeout(this.oldTimerDid)
      this.oldTimerDid = null
      clearTimeout(this.timerDid)
      this.timerDid = null
      this.setState({ oldUrl: '', visible: false })
      return
    }
    if (rs && rs.success === false) {
      clearTimeout(this.oldTimerDid)
      this.oldTimerDid = null
      clearTimeout(this.timerDid)
      this.timerDid = null
      if (rs.message) {
        message.error(rs.message)
      } else {
        message.error('Something went wrong')
      }
      this.setState({ visible: false })
      return
    }
    if (this._isMounted) {
      clearTimeout(this.oldTimerDid)
      this.oldTimerDid = setTimeout(this.pollingDidWithOldUrl, 3000)
    }
  }

  handleAssociate = () => {
    if (!this.timerDid) {
      this.timerDid = setTimeout(this.pollingDid, 3000)
    }
    if (!this.oldTimerDid) {
      this.oldTimerDid = setTimeout(this.pollingDidWithOldUrl, 3000)
    }
  }

  componentDidMount = async () => {
    this._isMounted = true
    const rs = await this.props.getElaUrl()
    if (rs && rs.success) {
      this.setState({ url: rs.url, oldUrl: rs.oldUrl })
    }
  }

  componentWillUnmount() {
    this._isMounted = false
    clearTimeout(this.timerDid)
    clearTimeout(this.oldTimerDid)
    this.timerDid = null
    this.oldTimerDid = null
  }

  handleVisibleChange = (visible) => {
    this.setState({ visible })
  }

  render() {
    const { did } = this.props
    let domain
    if (process.env.NODE_ENV === 'development') {
      domain = 'blockchain-did-regtest'
    } else {
      domain = 'idchain'
    }
    if (did && did.id) {
      return (
        <Did>
          <span>DID:</span>
          <a
            href={`https://${domain}.elastos.org/address/${did.id.slice(
              'did:elastos:'.length
            )}`}
            target="_blank"
          >
            {did.id} <ExternalLinkSvg />
          </a>
        </Did>
      )
    } else {
      return (
        <Fragment>
          <Popover
            content={this.elaQrCode()}
            trigger="click"
            placement="top"
            visible={this.state.visible}
            onVisibleChange={this.handleVisibleChange}
          >
            <Button onClick={this.handleAssociate}>
              <ScanSvgIcon color="#ffffff" width={20} height={20} />
              <Text>{I18N.get('profile.associateDid')}</Text>
            </Button>
          </Popover>
        </Fragment>
      )
    }
  }
}

export default ProfileDid

const Button = styled.span`
  margin-bottom: 16px;
  font-size: 14px;
  color: #ffffff;
  text-align: center;
  padding: 14px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #65bda3;
  border-radius: 8px;
  width: 240px;
`
const Content = styled.div`
  padding: 16px;
  min-width: 460px;
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
const Did = styled.div`
  line-height: 32px;
  a {
    color: #008d85;
    font-size: 13px;
    padding-left: 10px;
    &:focus {
      text-decoration: none;
    }
  }
`
const Text = styled.span`
  padding-left: 8px;
  opacity: 0.8;
`
