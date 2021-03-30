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
        <StylePaymentActionBtn action="true"
          className="action"
          onClick={() => {
            this.showModal(item)
          }}
        >
          {I18N.get('milestone.request')}
        </StylePaymentActionBtn>
      )
    }
    if (this.isOwner() && item.status === REJECTED && status === ACTIVE) {
      return (
        <StylePaymentActionBtn action="true"
          className="action"
          onClick={() => {
            this.showModal(item)
          }}
        >
          {I18N.get('milestone.rerequest')}
        </StylePaymentActionBtn>
      )
    }
    if (
      item.status === WAITING_FOR_APPROVAL &&
      user.is_secretary &&
      status === ACTIVE
    ) {
      return (
        <div className="review">
          <StylePaymentActionBtn action="true" approve="true"
            className="action approve"
            onClick={() => {
              this.showModal(item, 'APPROVED')
            }}
          >
            {I18N.get('milestone.approve')}
          </StylePaymentActionBtn>
          <StylePaymentActionBtn
            className="action reject"
            onClick={() => {
              this.showModal(item, 'REJECTED')
            }}
          >
            {I18N.get('milestone.reject')}
          </StylePaymentActionBtn>
        </div>
      )
    }
    if (
      this.isOwner() &&
      item.status === WAITING_FOR_WITHDRAWAL &&
      Number(item.amount) !== 0
    ) {
      return (
        <StylePaymentActionBtn action="true"
          className="action"
          onClick={() => this.showWithdrawalModal(item.milestoneKey)}
        >
          {I18N.get('milestone.withdraw')}
        </StylePaymentActionBtn>
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

  renderNewPaymentItem(item, index) {
    const { list } = this.props
    const visible = this.isVisible()
    const isOld = list && list.find((item) => item.reasons)
    return (
      <StylePayment key={index}>
        <StylePaymentContent style={{ width: '80%' }}>
          <StylePaymentHead>
            <StylePaymentIndex>{index + 1}</StylePaymentIndex>
            <StylePaymentAmmount>{item.amount + ' ELA'}</StylePaymentAmmount>
            <StylePaymentType>{item.type ? I18N.get(`suggestion.budget.${item.type}`) : ''}</StylePaymentType>
            {visible && (
              <StylePaymentStatus>{item.status && I18N.get(`milestone.${item.status}`)}</StylePaymentStatus>
            )}
          </StylePaymentHead>
          <div>
            <StylePaymentContentItem goal="true">
              <div >{I18N.get('suggestion.budget.goal') + ': '}</div>
              <div>{this.renderGoal(item)}</div>
            </StylePaymentContentItem>
            <StylePaymentContentItem>
              <div>{I18N.get('suggestion.budget.criteria') + ':'}</div>
              <ShowLongText
                text={item.criteria}
                id={'criteria' + item.milestoneKey}
              />
            </StylePaymentContentItem>
            {isOld ? (
              <StylePaymentContentItem>
                <div>{I18N.get('suggestion.budget.reasons') + ':'}</div>
                <ShowLongText
                  text={item.reasons}
                  id={'reasons' + item.milestoneKey}
                />
              </StylePaymentContentItem>
            ) : null}
          </div>
        </StylePaymentContent>
        <StylePaymentAction>{visible && <div>{this.renderActions(item)}</div>}</StylePaymentAction>
      </StylePayment>
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
      <div>
        {list &&
          list.map((item, index) => this.renderNewPaymentItem(item, index))}
        <StyledTable>
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
      </div>
    )
  }
}

export default PaymentList

const StylePayment = styled.div`
  display: flex;
  margin-bottom: 20px;
  border-bottom: 1px solid #e8e8e8;
`
const StylePaymentContent = styled.div`
  width: 80%;
  margin-bottom: 20px;
`
const StylePaymentContentItem= styled.div`
  ${props => props.goal ? 'display: flex': ''}
  margin-bottom: 20px;
`
const StylePaymentAction = styled.div`
  width: 20%;
  display: flex;
  justify-content: center;
  align-items: center;
`
const StylePaymentActionBtn = styled.div`
  width: 72px;
  cursor:pointer;
  border: 1px solid ${props => props.action ? '#43AF92': '#ED6060'};
  color: ${props => props.action ? '#43AF92': '#ED6060'};
  margin-bottom: ${props => props.approve ? '16px': '0'};
  box-sizing: border-box;
  border-radius: 24px;
  font-size: 12px;
  text-align: center;
  height: 24px;
  line-height: 20px;
`
const StylePaymentHead = styled.div`
  display: flex;
  align-items: center;
  height: 32px;
  margin-bottom: 20px
`
const StylePaymentIndex = styled.div`
  width: 32px;
  height: 32px;
  margin-right: 24px;
  background: #1DE9B6;
  border-radius: 4px;
  text-align: center;
  display: flex;
  color: #FFF;
  justify-content: center;
  align-items: center;
  font-size: 14px;
`
const StylePaymentAmmount = styled.div`
  display: flex;
  justify-content: center;
  text-align: center;
  align-items: center;
  font-size: 22px;
  margin-right: 40px;
`
const StylePaymentType = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  color: #008D85;
  font-size: 12px;
  height: 25px;
  background-color: #e4f8f3;
  padding: 0px 10px 2px 10px;
`
const StylePaymentStatus = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-right: 20px;
  color: #A49939;
  font-size: 12px;
  height: 25px;
  background-color: #F9F7CF;
  padding: 0px 10px 2px 10px;
`
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
