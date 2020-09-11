import React from 'react'
import _ from 'lodash'
import BaseComponent from '@/model/BaseComponent'
import TrackingMessageForm from '@/module/form/TrackingMessageForm/Container'
import { Button, Icon, Modal } from 'antd'
import I18N from '@/I18N'
import styled from 'styled-components'

export default class extends BaseComponent {
  constructor(props) {
    super(props)
    this.state = {
      visible: false
    }
  }

  showModal = () => {
    this.setState({ visible: true })
  }

  hideModal = () => {
    this.setState({ visible: false })
  }

  ord_render() {
    const { visible } = this.state
    return (
      <Wrapper>
        <Button className="cr-btn cr-btn-gray" onClick={this.showModal}>
          <Inside>
            <span>{I18N.get('proposal.btn.addTrackingMessage')}</span>
            <Icon type="plus-circle" style={{ fontSize: 22, paddingLeft: 8 }} />
          </Inside>
        </Button>
        {visible && (
          <Modal
            maskClosable={false}
            visible={visible}
            onCancel={this.hideModal}
            footer={null}
            width={600}
          >
            {this.renderForm()}
          </Modal>
        )}
      </Wrapper>
    )
  }

  renderForm() {
    const props = {
      ...this.props,
      onCreated: this.onCreated,
      onCancel: this.hideModal
    }
    return <TrackingMessageForm {...props} />
  }

  getQuery = () => {
    const query = {
      proposalId: _.get(this.props, 'proposal._id')
    }
    return query
  }

  refetch = async () => {
    this.ord_loading(true)
    const { list } = this.props
    const param = this.getQuery()
    await list(param)
    this.ord_loading(false)
  }

  onCreated = () => {
    this.refetch()
  }
}

const Wrapper = styled.div`
  margin-top: 48px;
`
const Inside = styled.div`
  display: flex;
`
