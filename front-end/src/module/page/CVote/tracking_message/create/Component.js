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
        <Button
          className="cr-btn cr-btn-primary"
          type="primary"
          onClick={this.showModal}
        >
          <Text>{I18N.get('proposal.btn.addTrackingMessage')}</Text>
          <Icon type="plus-circle" />
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

const Wrapper = styled.div``
const Text = styled.span`
  vertical-align: top;
`
