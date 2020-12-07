import React, { Component } from 'react'
import MediaQuery from 'react-responsive'
import { Form, Mention, Button, Input, message } from 'antd'
import userUtil from '@/util/user'
import {
  MAX_WIDTH_MOBILE,
  MIN_WIDTH_PC,
  MAX_LENGTH_COMMENT
} from '@/config/constant'
import I18N from '@/I18N'
import './style.scss'

const { TextArea } = Input
const FormItem = Form.Item

class CommentMention extends Component {
  constructor(props) {
    super(props)
    const { item: value, parentId: parent, commentTo } = this.props

    this.state = {
      commentId: value && value._id,
      commentTo: commentTo ? commentTo : null,
      parentId: parent ? parent : null,
      bool: true,
      item: value,
      commentName: (value && value._id) ? `${value._id}_comment` : 'comment'
    }
  }

  componentDidMount = async () => {
  }

  getModelId() {
    return _.isString(this.props.model)
      ? this.props.model
      : this.props.model._id
  }

  handleSubmit = async e => {
    e.preventDefault()
    const { currentUserId } = this.props
    if (!currentUserId) {
      window.location.href = "/login"
    }
    
    this.setState({
      bool: false
    })
    if (this.state.bool) {
      const { commentId, commentTo, parentId, commentName } = this.state
      const { postComment, onChange, type, reduxType, detailReducer, returnUrl, form } = this.props
      const { validateFields, setFields, resetFields } = form
      validateFields(async (err, values) => {
        if (!err) {
          const comment = values[commentName]

          const commentPlainText = _.isFunction(comment.getPlainText)
            ? comment.getPlainText()
            : comment

          if (_.isEmpty(commentPlainText)) {
            setFields({
              [commentName]: {
                errors: [new Error(I18N.get('suggestion.vote.error.empty'))],
              },
            })
            this.setState({
              bool: true
            })
            return
          }

          if (commentPlainText.length > MAX_LENGTH_COMMENT) {
            setFields({
              [commentName]: {
                value: comment,
                errors: [new Error(I18N.get('suggestion.vote.error.tooLong'))],
              },
            })
            this.setState({
              bool: true
            })
            return
          }

          const commentData = [{
            comment: commentPlainText,
            commentId: parentId ? parentId : commentId,
            commentTo: commentTo
          }]

          const rs = await postComment(type, reduxType, detailReducer, returnUrl,
            this.getModelId(),
            commentData,
            values.headline)

          if (rs.nModified === 1) {
            this.setState({
              bool: true
            })
            onChange(rs.newDate)
            message.success(I18N.get('comments.posted.success'))
          }

          resetFields(commentName,[])
        }
      })
    }
  }

  renderComment() {
    const allUsers = [`ALL (${I18N.get('suggestion.form.mention.allCouncil')})`]
    _.each(this.props.all_users, obj => {
      const mentionStr = `${obj.username} (${userUtil.formatUsername(obj)})`
      allUsers.push(mentionStr)
    })

    const { commentTo, commentName } = this.state

    const { getFieldDecorator } = this.props.form
    const comment_fn = getFieldDecorator(commentName, {
      rules: [],
      initialValue: Mention.toContentState(''),
    })
    const comment_el = (
      <Mention
        multiLines={true}
        style={{ width: '100%', height: 100 }}
        defaultSuggestions={allUsers}
        notFoundContent={I18N.get('mentions.notFound')}
        placeholder={(commentTo !== null && `@ ${commentTo} :`) || I18N.get('comments.placeholder')}
      />
    )

    return comment_fn(comment_el)
  }

  isLoading() {
    return this.props.loading[this.props.reduxType || this.props.type]
  }

  renderCommentMobile() {
    const { getFieldDecorator } = this.props.form
    const comment_fn = getFieldDecorator('comment', {
      rules: [],
      initialValue: '',
    })
    const comment_el = (
      <TextArea
        style={{ width: '100%', height: 100 }}
        placeholder={I18N.get('comments.placeholder')}
      />
    )

    return comment_fn(comment_el)
  }

  remove(e) {
    const { onCancel } = this.props
    onCancel(e)
  }

  render() {
    const { item, commentId } = this.state
    return (
      <Form onSubmit={this.handleSubmit.bind(this)} className="c_commentForm">
        <MediaQuery minWidth={MIN_WIDTH_PC}>
          <FormItem>
            {this.renderComment()}
          </FormItem>
        </MediaQuery>
        <MediaQuery maxWidth={MAX_WIDTH_MOBILE}>
          <FormItem>
            {this.renderCommentMobile()}
          </FormItem>
        </MediaQuery>
        <FormItem>
          <Button
            className="ant-btn-ebp pull-right"
            type="primary"
            size="small"
            htmlType="submit"
            loading={this.isLoading()}
          >
            {I18N.get('comments.post')}
          </Button>
          {
            commentId ?
              <Button
                className="ant-btn-ebp pull-right btn-cancel"
                type="primary"
                size="small"
                loading={this.isLoading()}
                onClick={() => this.remove(item)}
              >
                {I18N.get('comments.cancel')}
              </Button>
              : null}
        </FormItem>
      </Form>)
  }
}

export default CommentMention
