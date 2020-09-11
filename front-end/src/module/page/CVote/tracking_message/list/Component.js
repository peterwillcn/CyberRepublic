import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import I18N from '@/I18N'
import moment from 'moment/moment'
import styled from 'styled-components'
import { List, Collapse, Empty } from 'antd'
import MarkdownPreview from '@/module/common/MarkdownPreview'
import userUtil from '@/util/user'
const { Panel } = Collapse

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
    const { messages, proposal } = this.props
    if (!messages || messages.length === 0) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_SIMPLE}
          description={<span>{I18N.get('proposal.text.noData')}</span>}
        />
      )
    }
    const name = proposal && userUtil.formatUsername(proposal.proposer)
    const body = (
      <List
        itemLayout="horizontal"
        grid={{ column: 1 }}
        split={false}
        dataSource={messages}
        renderItem={(item) => (
          <StyledRow>
            <StyledContent>
              <MarkdownPreview content={item.content} />
            </StyledContent>
            <StyledFooter>
              {`${name}, `}
              {moment(item.createdAt).format('hh:mm MMM D, YYYY')}
            </StyledFooter>
          </StyledRow>
        )}
      />
    )
    return (
      <Wrapper>
        <StyledCollapse defaultActiveKey={['1']} expandIconPosition="right">
          <Panel
            header={I18N.get('proposal.text.tracking.reviewDetails')}
            key="1"
          >
            {body}
          </Panel>
        </StyledCollapse>
      </Wrapper>
    )
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

const Wrapper = styled.div`
  margin-bottom: 32px;
`

const StyledCollapse = styled(Collapse)`
  border: none !important;
  margin-bottom: 40px;
  .ant-collapse-content-box {
    padding: 0 !important;
  }
  .ant-collapse-content {
    border: none !important;
  }
  .ant-collapse-header {
    text-align: center;
    padding-left: 0 !important;
    color: #008d85 !important;
    background-color: white;
    .ant-collapse-arrow {
      right: calc(50% - 70px) !important;
    }
  }
  > .ant-collapse-item {
    border-bottom: none !important;
  }
`

const StyledRow = styled.div`
  padding: 8px 16px 24px;
  border-bottom: 1px solid #e5e5e5;
`

const StyledContent = styled.div`
  color: #000000;
  opacity: 0.8;
`

const StyledFooter = styled.div`
  font-size: 12px;
  color: rgba(3, 30, 40, 0.4);
  line-height: 17px;
  padding-left: 4px;
`
