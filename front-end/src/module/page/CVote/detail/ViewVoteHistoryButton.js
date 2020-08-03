import React, { Component } from 'react'
import styled from 'styled-components'
import { Modal, Button, Timeline, Avatar } from 'antd'
import moment from 'moment/moment'
import I18N from '@/I18N'
import { breakPoint } from '@/constants/breakPoint'
import Translation from '@/module/common/Translation/Container'

class ViewVoteHistoryButton extends Component {
  constructor(props) {
    super(props)
    this.state = {
      visible: false,
    }
  }

  hideModal = () => {
    this.setState({ visible: true })
  }

  handleCancel = () => {
    this.setState({ visible: false })
  }

  VotesNode = (data, key) => {
    if (!data) {
      return
    }
    let voteStatus = data && data.status
    if (
      voteStatus == undefined ||
      voteStatus == 'failed' ||
      voteStatus == 'unchain'
    ) {
      voteStatus = (
        <div className="status unchain">
          <div>{I18N.get(`council.voting.chainStatus.unchain`)}</div>
        </div>
      )
    }
    if (voteStatus == 'chained') {
      voteStatus = (
        <div className="status chained">
          <div>{I18N.get(`council.voting.chainStatus.chained`)}</div>
        </div>
      )
    }

    const avatarName = [data.votedBy.profile.firstName, data.votedBy.profile.lastName]

    const createdAt = data.reasonCreatedAt || data.createdAt
    const format = 'YYYY-MM-DD'
    const formatTime = 'hh:mm:ss'
    const proposed = moment(createdAt).format(format)
    const detailTime = moment(createdAt).format(formatTime)

    const valueNode = (
      <ItemStatus key={KeyframeEffect}>
        <div className="vote-value">
          <span style={{ background: colorStyle[data.value], padding: '3px' }}>
            {I18N.get(`council.voting.type.${data.value}`)}
          </span>
        </div>
        <div><span style={{ whiteSpace: 'pre-wrap' }}>{proposed + "\n" + detailTime}</span></div>
        <div className="status">{data.isCurrentVote
          ? I18N.get('council.voting.viewHistory.current')
          : null}
        </div>
      </ItemStatus>
    )
    const userNode = (
      <Item key={key}>
        {data.votedBy.did.avatar || avatarName[0] == 'undefined' ? (
          <Avatar
            size={90}
            src={data.votedBy.did.avatar || USER_AVATAR_DEFAULT}
            alt="voter avatar"
          />
        ) : (
            <Avatar
              className="comment-avatar pull-left"
              style={{
                backgroundColor: '#000',
                fontSize: 24
              }}
              shape="circle"
              size={64}
            >
              {`${avatarName[0] &&
                avatarName[0].toUpperCase().substr(0, 1)}${avatarName[1] &&
                avatarName[1].toUpperCase().substr(0, 1)}`}
            </Avatar>
          )}
        <div>{data.votedBy.did.didName}</div>
        {data.reason !== '' ? voteStatus : null}
      </Item>
    )

    const googleNode = data.reason && (
      <div style={{ marginTop: '0.5rem' }}>
        <Translation text={data.reason} />
      </div>
    )

    const reasonNode = (
      <Reason>
        {data.reason.split('\n').map((item, key) => {
          return (
            <span key={key}>
              {item}
              <br />
            </span>
          )
        })}
        {googleNode}
      </Reason>
    )

    return (
      <Timeline.Item key={key} color={'green'}>
        <ResultRow key={key}>
          {valueNode}
          {userNode}
          {reasonNode}
        </ResultRow>
      </Timeline.Item>
    )
  }

  render() {
    const voteNode = _.map(this.props.data, (o, key) => this.VotesNode(o, key))
    return (<span>
      <VoteHistornBtn type={"primary"} onClick={this.hideModal}>
        {I18N.get(`council.voting.viewHistory.btn`)}
      </VoteHistornBtn>
      <Modal
        visible={this.state.visible}
        onOk={this.handleCancel}
        onCancel={this.handleCancel}
        footer={null}
        width={880}
      >
        <Timeline style={{ margin: '50px' }}>
          {voteNode}
        </Timeline>
      </Modal></span>
    )
  }
}

export default ViewVoteHistoryButton

const colorStyle = {
  support: "#1DE9B6",
  abstention: "#BFD2EA",
  reject: "#FC6D6D",
}

const ItemStatus = styled.div`
  width: 110px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: left;
  text-align: left;
  .status {
    font-size: 14px;
    line-height: 20px;
    margin-top: 8px;
    font-style: normal;
    font-weight: normal;
    color:  #008D85;
  }
  .vote-value {
    display: inline;
    font-size: 16px;
    line-height:23px;
    margin-bottom: 8px;
    text-transform: uppercase;
  }
`

const Item = styled.div`
  width: 150px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  .status {
    text-align: center;
    border-radius: 10px;
    font-size: 13px;
    width: 70px;
    height: 20px;
    margin-top: 8px;
  }
  .status.chained {
    color: #fff;
    background: #008d85;
  }
  .status.unchain {
    background: #ffffff;
    border: 1px solid #008d85;
    color: #008d85;
  }
`

const testm = [
  `.status {
    width: 70px;
    height: 20px;
    color: #FFFFFF;
    border-radius: 10px;
    background: #008D85;
    font-size: 13px;
    text-align: center;
    margin-top: 8px;
    padding: 3px;
  }`
]

const Reason = styled.div`
  margin-left: 25px;
  margin-top: 10px;
  @media only screen and (max-width: ${breakPoint.mobile}) {
    margin-left: 10px;
    margin-top: 0px;
  }
`

const ResultRow = styled.div`
  display: flex;
  margin-bottom: 30px;
`

const VoteHistornBtn = styled.button`
  width: 150px;
  height: 17px;

  font-style: normal;
  font-weight: normal;
  font-size: 12px;
  line-height: 17px;

  text-align: center;
  text-decoration-line: underline;

  color: #008D85;
`