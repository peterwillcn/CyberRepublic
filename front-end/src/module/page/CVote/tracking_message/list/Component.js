import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import I18N from '@/I18N'
import styled from 'styled-components'

export default class extends BaseComponent {
  constructor(p) {
    super(p)
    this.state = {
      loading: true
    }
  }

  async componentDidMount() {
    this.refetch()
  }

  ord_render() {
    return <Wrapper>list</Wrapper>
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
}

export const Wrapper = styled.div`
  margin-top: 32px;
`
