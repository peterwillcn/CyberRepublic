import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import I18N from '@/I18N'
import moment from 'moment/moment'
import styled from 'styled-components'
import { Row, List, Collapse } from 'antd'
import MarkdownPreview from '@/module/common/MarkdownPreview'
import { DATE_FORMAT } from '@/constant'
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
    const { messages } = this.props
    const body = (
      <List
        itemLayout="horizontal"
        grid={{ column: 1 }}
        split={false}
        dataSource={messages}
        renderItem={(item) => (
          <div actions={[]}>
            <StyledRow gutter={16}>
              <div span={24}>
                <div>
                  <MarkdownPreview content={item.content} />
                </div>
                <StyledFooter>
                  {moment(item.createdAt).format(DATE_FORMAT)}
                </StyledFooter>
              </div>
            </StyledRow>
          </div>
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

export const Wrapper = styled.div`
  margin-top: 32px;
`

export const StyledCollapse = styled(Collapse)`
  border: none !important;
  margin-top: 30px;
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

export const StyledRow = styled(Row)`
  margin: 0 !important;
`

export const StyledFooter = styled.div`
  font-size: 12px;
  color: rgba(3, 30, 40, 0.4);
  padding: 10px 20px;
`
