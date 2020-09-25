import React, { Component } from 'react'
import styled from 'styled-components'
import { Popover } from 'antd'
import moment from 'moment'
import linkifyStr from 'linkifyjs/string'
import I18N from '@/I18N'
import Signature from './Signature'
import {
  MILESTONE_STATUS,
  SUGGESTION_BUDGET_TYPE,
  CVOTE_STATUS
} from '@/constant'
import WithdrawMoney from './WithdrawMoney'
import ShowLongText from '@/module/common/ShowLongText'

const {
  WAITING_FOR_REQUEST,
  REJECTED,
  WAITING_FOR_APPROVAL,
  WAITING_FOR_WITHDRAWAL,
  WITHDRAWN
} = MILESTONE_STATUS

const { COMPLETION } = SUGGESTION_BUDGET_TYPE
const { FINAL, ACTIVE, TERMINATED } = CVOTE_STATUS

class PaymentList extends Component {
  constructor(props) {
    super(props)
    this.state = {
      toggle: false,
      stage: '',
      opinion: '',
      withdrawal: false,
      withdrawalStage: '',
      isCompletion: false,
      showMore: true
    }
  }

  hideModal = () => {
    this.setState({ toggle: false, stage: '', opinion: '' })
  }

  showModal = (item, opinion) => {
    this.setState({
      toggle: true,
      stage: item.milestoneKey,
      opinion,
      isCompletion: item.type === COMPLETION
    })
  }

  showWithdrawalModal = (stage) => {
    this.setState({ withdrawal: true, withdrawalStage: stage })
  }

  hideWithdrawalModal = () => {
    this.setState({ withdrawal: false, withdrawalStage: '' })
  }

  isOwner() {
    const { user, proposer } = this.props
    if (user && proposer) {
      return user.current_user_id === proposer._id
    } else {
      return false
    }
  }

  isVisible() {
    const { user, status } = this.props
    return (
      (this.isOwner() || user.is_secretary) &&
      [ACTIVE, FINAL, TERMINATED].includes(status)
    )
  }

  renderMilestone = (item) => {
    const date = (
      <div className="square-date">
        {moment(item.date).format('MMM D, YYYY')}
      </div>
    )
    const version = (
      <div className="square-content">
        <p
          dangerouslySetInnerHTML={{
            __html: linkifyStr(item.version)
          }}
        />
      </div>
    )
    return (
      <Square>
        {date}
        {version}
      </Square>
    )
  }

  renderActions(item) {
    const { user, status } = this.props
    if (this.isFinal()) {
      return null
    }
    if (
      this.isOwner() &&
      item.status === WAITING_FOR_REQUEST &&
      status === ACTIVE
    ) {
      return (
        <div
          className="action"
          onClick={() => {
            this.showModal(item)
          }}
        >
          {I18N.get('milestone.request')}
        </div>
      )
    }
    if (this.isOwner() && item.status === REJECTED && status === ACTIVE) {
      return (
        <div
          className="action"
          onClick={() => {
            this.showModal(item)
          }}
        >
          {I18N.get('milestone.rerequest')}
        </div>
      )
    }
    if (
      item.status === WAITING_FOR_APPROVAL &&
      user.is_secretary &&
      status === ACTIVE
    ) {
      return (
        <div className="review">
          <div
            className="action approve"
            onClick={() => {
              this.showModal(item, 'APPROVED')
            }}
          >
            {I18N.get('milestone.approve')}
          </div>
          <div
            className="action reject"
            onClick={() => {
              this.showModal(item, 'REJECTED')
            }}
          >
            {I18N.get('milestone.reject')}
          </div>
        </div>
      )
    }
    if (
      this.isOwner() &&
      item.status === WAITING_FOR_WITHDRAWAL &&
      Number(item.amount) !== 0
    ) {
      return (
        <div
          className="action"
          onClick={() => this.showWithdrawalModal(item.milestoneKey)}
        >
          {I18N.get('milestone.withdraw')}
        </div>
      )
    }
  }

  renderGoal(item) {
    const { milestone } = this.props
    if (milestone && milestone.length > 0 && item.milestoneKey) {
      return (
        <Popover content={this.renderMilestone(milestone[item.milestoneKey])}>
          <a>
            {`${I18N.get('suggestion.budget.milestone')} #${Number(
              item.milestoneKey
            ) + 1}`}
          </a>
        </Popover>
      )
    } else {
      return null
    }
  }

  renderPaymentItem(item, index) {
    const { list } = this.props
    const visible = this.isVisible()
    const isOld = list && list.find((item) => item.reasons)
    return (
      <StyledRow key={index}>
        <td>{index + 1}</td>
        <td>{item.type ? I18N.get(`suggestion.budget.${item.type}`) : ''}</td>
        <td>{item.amount}</td>
        {isOld ? (
          <td>
            <ShowLongText
              text={item.reasons}
              id={'reasons' + item.milestoneKey}
            />
          </td>
        ) : null}
        <td>{this.renderGoal(item)}</td>
        <td>
          <ShowLongText
            text={item.criteria}
            id={'criteria' + item.milestoneKey}
          />
        </td>
        {visible && (
          <td>{item.status && I18N.get(`milestone.${item.status}`)}</td>
        )}
        {visible && <td>{this.renderActions(item)}</td>}
      </StyledRow>
    )
  }

  getApplication() {
    const { withdrawalHistory } = this.props
    const { stage } = this.state
    const rs = withdrawalHistory.filter((item) => {
      return item.signature && stage === item.milestoneKey
    })
    return rs && rs.length > 0 && rs[rs.length - 1]
  }

  isFinal() {
    const { list } = this.props
    const last = list && list.filter((item) => item.type === COMPLETION)[0]
    return last && last.status === WITHDRAWN
  }

  render() {
    const { list, proposalId, actions, user } = this.props
    const visible = this.isVisible()
    const {
      toggle,
      stage,
      opinion,
      isCompletion,
      withdrawal,
      withdrawalStage
    } = this.state
    const isOld = list && list.find((item) => item.reasons)
    return (
      <StyledTable>
        <StyledHead>
          <StyledRow>
            <th style={{ width: 100 }}>
              {I18N.get('suggestion.budget.payment')}#
            </th>
            <th>{I18N.get('suggestion.budget.type')}</th>
            <th>
              {I18N.get('suggestion.budget.amount')}
              (ELA)
            </th>
            {isOld ? (
              <th style={{ width: '20%' }}>
                {I18N.get('suggestion.budget.reasons')}
              </th>
            ) : null}
            <th>{I18N.get('suggestion.budget.goal')}</th>
            <th style={{ width: '18%' }}>
              {I18N.get('suggestion.budget.criteria')}
            </th>
            {visible && <th>{I18N.get('milestone.status')}</th>}
            {visible && <th>{I18N.get('suggestion.budget.action')}</th>}
          </StyledRow>
        </StyledHead>
        <tbody>
          {list &&
            list.map((item, index) => this.renderPaymentItem(item, index))}
        </tbody>

        <Signature
          toggle={toggle}
          stage={stage}
          isCompletion={isCompletion}
          proposalId={proposalId}
          applyPayment={actions.applyPayment}
          getPaymentSignature={actions.getPaymentSignature}
          hideModal={this.hideModal}
          isSecretary={user.is_secretary}
          opinion={opinion}
          reviewApplication={actions.reviewApplication}
          application={this.getApplication()}
        />

        {withdrawal ? (
          <WithdrawMoney
            withdrawal={withdrawal}
            proposalId={proposalId}
            withdraw={actions.withdraw}
            stage={withdrawalStage}
            hideModal={this.hideWithdrawalModal}
          />
        ) : null}
      </StyledTable>
    )
  }
}

export default PaymentList

const StyledTable = styled.table`
  margin-top: 16px;
  width: 100%;
  font-size: 13px;
  table-layout: fixed;
`
const StyledHead = styled.thead`
  > tr {
    background: #0f2631;
  }
  th {
    line-height: 18px;
    padding: 16px;
    color: #fff;
  }
`
const StyledRow = styled.tr`
  width: 100%;
  background: #f2f6fb;
  > td {
    line-height: 18px;
    padding: 8px 16px;
    color: #000;
    overflow-wrap: break-word;
    vertical-align: middle;
    > button {
      margin: 0 4px;
    }
    .action {
      color: #43af92;
      &:hover {
        cursor: pointer;
      }
    }
    .reject {
      color: red;
      margin-left: 24px;
    }
    .review {
      display: flex;
    }
  }
`
const Square = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  line-height: 20px;
  width: 295px;
  > div {
    margin-top: 4px;
    &.square-date {
      margin-top: 20px;
    }
    &.square-content {
      width: 100%;
      margin-bottom: 27px;
      padding: 0 22px;
      > p {
        padding: 0;
        text-align: center;
        overflow-wrap: break-word;
        white-space: normal;
      }
    }
  }
`
