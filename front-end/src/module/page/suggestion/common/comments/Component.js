import React from 'react'
import { Form, Avatar, Button, Input, Mention, Modal, message } from 'antd'
import _ from 'lodash'
import moment from 'moment'
import BaseComponent from '@/model/BaseComponent'
import ProfilePopup from '@/module/profile/OverviewPopup/Container'
import Translation from '@/module/common/Translation/Container'
import userUtil from '@/util/user'
import styled from 'styled-components'
import I18N from '@/I18N'
import { MAX_LENGTH_COMMENT } from '@/config/constant'
import { USER_AVATAR_DEFAULT, SUGGESTION_BUTTON_DEFAULT } from '@/constant'
import CommentMention from './CommentMention'
import './style.scss'

const { TextArea } = Input

class C extends BaseComponent {
  constructor(props) {
    super(props)

    this.state = {
      showUserInfo: null,
      commentId: null,
      commentTo: null,
      parentId: null,
      isComment: false,
      viewMore: [],
      commentArr: [],
      bool: true,
      curDetail: this.props.detailReducer
        ? this.props.detailReducer(curDetail) || {}
        : this.props[this.props.reduxType || this.props.type]
    }
  }

  async componentDidMount() {
    this.props.listUsers()
    const { hash } = this.props.location
    if (hash && hash === '#comments') {
      document.getElementById('comments').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      })
    }
  }

  componentWillUnmount() {}

  linkUserDetail(user) {
    this.setState({
      showUserInfo: user
    })
  }

  handleCommentClick = (e) => {
    const { commentArr } = this.state
    const { _id: id } = e
    if (_.includes(commentArr, id)) {
      _.remove(commentArr, (item) => item === id)
    } else {
      commentArr.push(id)
    }
    this.setState({
      commentArr
    })
  }

  changeCurComment(comments) {
    if (comments) {
      this.setState({
        curDetail: comments
      })
    }
  }

  // only wraps loading / renderMain
  ord_render() {
    return (
      <div className="c_Comments">
        {this.renderHeader()}
        {
          <CommentMention
            {...this.props}
            onChange={this.changeCurComment.bind(this)}
          />
        }
        {this.renderBody()}
        <Modal
          className="profile-overview-popup-modal"
          visible={!!this.state.showUserInfo}
          onCancel={this.handleCancelProfilePopup.bind(this)}
          footer={null}
        >
          {this.state.showUserInfo && (
            <ProfilePopup showUserInfo={this.state.showUserInfo} />
          )}
        </Modal>
      </div>
    )
  }

  renderBody() {
    const { curDetail } = this.state
    const comments = curDetail.comments || []

    const commentsList = _.map(comments, (item, key) => {
      return this.renderCommentItem(item[0], key, false, null)
    })

    return commentsList
  }

  renderCommentItem(item, key, isChild, parentId) {
    if (!item) return
    const { commentArr } = this.state
    const userName = userUtil.formatUsername(item.createdBy)
    return (
      <Comments key={key}>
        <AvatarDiv>
          <div style={{ margin: '0 auto' }}>
            {this.renderAvatarItem(item.createdBy)}
          </div>
          <UserName>{userName}</UserName>
        </AvatarDiv>
        <CommentBody>
          <div>
            {isChild ? `@${item.commentTo}: ` : ''}
            <span style={isChild ? { fontWeight: 300 } : {}}>
              {item.comment}
            </span>
          </div>
          <CommentsFooter>
            <CommentsFooterRight>
              {this.renderTranslationBtn(item.comment)}
              {this.renderCreatedAt(item.createdAt)}
            </CommentsFooterRight>
            <SubmmitBtn style={isChild ? {} : { paddingRight: 20 }}>
              <img
                onClick={() => {
                  this.handleCommentClick(item)
                }}
                src={`${SUGGESTION_BUTTON_DEFAULT}`}
              />
            </SubmmitBtn>
          </CommentsFooter>
          {
            <div
              style={
                _.includes(commentArr, item._id) ? null : { display: 'none' }
              }
            >
              <CommentMention
                {...this.props}
                item={item}
                parentId={parentId}
                commentTo={userName}
                onChange={this.changeCurComment.bind(this)}
                onCancel={this.handleCommentClick.bind(this)}
              />
            </div>
          }
          {this.renderChildCommentItem(item)}
        </CommentBody>
      </Comments>
    )
  }

  renderChildCommentItem(item) {
    let childCommentsList = []
    const { viewMore } = this.state
    const hasChild = _.isEmpty(item.childComment)
    if (!hasChild) {
      if (_.includes(viewMore, item._id)) {
        _.each(item.childComment, (child, key) => {
          childCommentsList.push(
            this.renderCommentItem(child, key, true, item._id)
          )
        })
      } else {
        if (item.childComment.length > 2) {
          for (var i = 0; i < 2; i++) {
            childCommentsList.push(
              this.renderCommentItem(item.childComment[i], i, true, item._id)
            )
          }
        } else {
          for (var i = 0; i < item.childComment.length; i++) {
            childCommentsList.push(
              this.renderCommentItem(item.childComment[i], i, true, item._id)
            )
          }
        }
      }
    }

    return !_.isEmpty(childCommentsList) ? (
      <ChildComment>
        {childCommentsList}
        {item.childComment.length > 2 ? (
          <ViewButton onClick={() => this.handleViewMore(item)}>
            {!_.includes(viewMore, item._id)
              ? `${I18N.get('suggestion.comments.viewMore')}(${
                  item.childComment.length
                })`
              : I18N.get('suggestion.comments.viewLess')}
          </ViewButton>
        ) : null}
      </ChildComment>
    ) : null
  }

  handleViewMore(item) {
    const viewArr = this.state.viewMore
    if (_.includes(viewArr, item._id)) {
      _.remove(viewArr, (o) => o === item._id)
    } else {
      viewArr.push(item._id)
    }
    this.setState({
      viewMore: viewArr
    })
  }

  // header + main area
  renderMain() {
    return (
      <div className="c_Comments" id={this.props.id}>
        {this.renderHeader()}
        {this.renderComments()}
        <Modal
          className="profile-overview-popup-modal"
          visible={!!this.state.showUserInfo}
          onCancel={this.handleCancelProfilePopup.bind(this)}
          footer={null}
        >
          {this.state.showUserInfo && (
            <ProfilePopup showUserInfo={this.state.showUserInfo} />
          )}
        </Modal>
      </div>
    )
  }

  handleCancelProfilePopup() {
    this.setState({
      showUserInfo: null
    })
  }

  renderHeader() {
    return (
      <h3 id="comments" className="no-margin with-gizmo">
        {this.props.header || I18N.get('comments')}
      </h3>
    )
  }

  getInputProps() {
    const { getFieldDecorator } = this.props.form

    const headline_fn = getFieldDecorator('headline', {
      rules: [
        {
          max: 100,
          message: 'Headline is too long'
        },
        {
          required: this.props.headlines,
          message: `${I18N.get('profile.form.headline.error')}`
        }
      ],
      initialValue: ''
    })
    const headline_el = (
      <Input placeholder={I18N.get('profile.form.headline')} />
    )

    return {
      headline: headline_fn(headline_el)
    }
  }

  renderComment() {
    const allUsers = [`ALL (${I18N.get('suggestion.form.mention.allCouncil')})`]
    _.each(this.props.all_users, (obj) => {
      const mentionStr = `${obj.username} (${userUtil.formatUsername(obj)})`
      allUsers.push(mentionStr)
    })

    const { commentTo, isComment } = this.state

    const { getFieldDecorator } = this.props.form
    const comment_fn = getFieldDecorator('comment', {
      rules: [],
      initialValue: Mention.toContentState('')
    })
    const comment_el = (
      <Mention
        multiLines={true}
        style={{ width: '100%', height: 100 }}
        defaultSuggestions={allUsers}
        notFoundContent={I18N.get('mentions.notFound')}
        placeholder={
          (commentTo !== null && isComment && `@ ${commentTo} :`) ||
          I18N.get('comments.placeholder')
        }
      />
    )

    return comment_fn(comment_el)
  }

  renderCommentInput() {
    const allUsers = [`ALL (${I18N.get('suggestion.form.mention.allCouncil')})`]
    _.each(this.props.all_users, (obj) => {
      const mentionStr = `${obj.username} (${userUtil.formatUsername(obj)})`
      allUsers.push(mentionStr)
    })

    const { getFieldDecorator } = this.props.form
    const comment_fn = getFieldDecorator('comment', {
      rules: [],
      initialValue: Mention.toContentState('')
    })
    const comment_el = (
      <Mention
        multiLines={true}
        style={{ width: '100%', height: 100 }}
        defaultSuggestions={allUsers}
        notFoundContent={I18N.get('mentions.notFound')}
        placeholder={I18N.get('comments.placeholder')}
      />
    )

    return comment_fn(comment_el)
  }

  renderAvatarItem(info) {
    const profile = info && info.profile
    const { avatar, firstName, lastName } = profile || {}
    const { avatar: didAvatar } = !_.isEmpty(info.did) && info.did
    if (avatar || didAvatar || (!firstName && !lastName)) {
      return (
        <Avatar
          className="comment-avatar pull-left"
          src={avatar || didAvatar || USER_AVATAR_DEFAULT}
          shape="circle"
          size={64}
          onClick={() => this.linkUserDetail(info)}
        />
      )
    }

    if (firstName || lastName) {
      return (
        <Avatar
          className="comment-avatar pull-left"
          style={{
            backgroundColor: '#000',
            fontSize: 24
          }}
          shape="circle"
          size={64}
          onClick={() => this.linkUserDetail(info)}
        >
          {`${firstName && firstName.toUpperCase().substr(0, 1)}${lastName &&
            lastName.toUpperCase().substr(0, 1)}`}
        </Avatar>
      )
    }
  }

  renderCreatedAt(createdAt) {
    let formatTemp = 'MMM DD - hh:mm a'
    if (this.props.lang !== 'en') {
      formatTemp = 'MM 月 DD 日 - hh:mm a'
    }
    const date = moment(createdAt).format(formatTemp)
    return <CreatedAt>{date}</CreatedAt>
  }

  isUserSubscribed() {
    const curDetail = this.props[this.props.reduxType || this.props.type]
    const subscribers = curDetail.subscribers || []
    return !!_.find(
      subscribers,
      (subscriber) =>
        subscriber.user && subscriber.user._id === this.props.currentUserId
    )
  }

  isLoading() {
    return this.props.loading[this.props.reduxType || this.props.type]
  }

  getSubscribeButton() {
    if (this.isUserSubscribed() && this.props.canSubscribe) {
      return (
        <Button
          className="ant-btn-ebp pull-left"
          size="small"
          onClick={this.unsubscribe.bind(this)}
          loading={this.isLoading()}
        >
          Unsubscribe
        </Button>
      )
    }

    return this.props.canSubscribe ? (
      <Button
        className="ant-btn-ebp pull-left"
        size="small"
        onClick={this.subscribe.bind(this)}
        loading={this.isLoading()}
      >
        Subscribe
      </Button>
    ) : null
  }

  getModelId() {
    return _.isString(this.props.model) // Bit naive IMPROVEME
      ? this.props.model
      : this.props.model._id
  }

  subscribe() {
    this.props.subscribe(this.props.type, this.getModelId())
  }

  unsubscribe() {
    this.props.unsubscribe(this.props.type, this.getModelId())
  }

  renderTranslationBtn(text) {
    return (
      <TranslationBtn>
        <Translation text={text} />
      </TranslationBtn>
    )
  }

  handleSubmit = async (e) => {
    e.preventDefault()
    this.setState({
      bool: false
    })
    if (this.state.bool) {
      const { commentId, commentTo, parentId } = this.state
      this.props.form.validateFields(async (err, values) => {
        if (!err) {
          const { comment } = values
          const commentPlainText = _.isFunction(comment.getPlainText)
            ? comment.getPlainText()
            : comment

          if (_.isEmpty(commentPlainText)) {
            this.props.form.setFields({
              comment: {
                errors: [new Error(I18N.get('suggestion.vote.error.empty'))]
              }
            })
            this.setState({
              bool: true
            })
            return
          }

          if (commentPlainText.length > MAX_LENGTH_COMMENT) {
            this.props.form.setFields({
              comment: {
                value: comment,
                errors: [new Error(I18N.get('suggestion.vote.error.tooLong'))]
              }
            })
            this.setState({
              bool: true
            })
            return
          }

          const commentData = [
            {
              comment: commentPlainText,
              commentId: parentId ? parentId : commentId,
              commentTo: commentTo
            }
          ]

          const rs = await this.props.postComment(
            this.props.type,
            this.props.reduxType,
            this.props.detailReducer,
            this.props.returnUrl,
            this.getModelId(),
            commentData,
            values.headline
          )

          if (rs.nModified === 1) {
            this.setState({
              curDetail: rs.newDate,
              bool: true
              // isComment: !isComment,
            })
            message.success(I18N.get('comments.posted.success'))
          }

          this.props.form.resetFields()
        }
      })
    }
  }

  handleDelete = (comment) => {
    this.props.removeComment(
      this.props.type,
      this.props.reduxType,
      this.props.detailReducer,
      this.getModelId(),
      {
        commentId: comment._id
      }
    )
  }

  showUserProfile(username) {
    const user = _.find(this.props.all_users, { username })
    if (user) {
      this.props.history.push(`/member/${user._id}`)
    }
  }
}

export default Form.create()(C)

const Comments = styled.div`
  display: flex;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
  padding-right: 20px;
  padding-top: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #dee6f1;
`
const AvatarDiv = styled.div`
  width: 10%;
  display: grid;
  height: 100px;
  justify-content: center;
`
const UserName = styled.div`
  text-align: center;
`
const CommentBody = styled.div`
  width: 90%;
  border-bottom: 1px soild #fff;
`
const TranslationBtn = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`
const SubmmitBtn = styled.div`
  cursor: pointer;
  margin-top: 20px;
  margin-bottom: 20px;
`
const CreatedAt = styled.div`
  margin: 20px;
  color: #7f93b2;
`
const ChildComment = styled.div`
  background: #f6f9fd;
  &:before {
    content: '';
    z-index: 0;
    width: 50px;
    height: 40px;
    position: absolute;
    left: 12%;
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
    background-color: #f6f9fd;
    border: 1px solid #f6f9fd;
  }
`
const ViewButton = styled.div`
  margin: 30px 0;
  padding-bottom: 30px;
  text-align: center;
  cursor: pointer;
  font-size: 14px;
  line-height: 20px;
`
const CommentsFooter = styled.div`
  display: flex;
  justify-content: space-between;
`
const CommentsFooterRight = styled.div`
  display: flex;
`
