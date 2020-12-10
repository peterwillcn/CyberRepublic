import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import I18N from '@/I18N'
import DeleteSvgIcon from '@/module/common/DeleteSvgIcon'
import EditSvgIcon from '@/module/common/EditSvgIcon'
import ShowLongText from '@/module/common/ShowLongText'

class RelevanceList extends BaseComponent {
  handleDelete = (index) => {
    this.props.onDelete(index)
  }

  handleEdit = (index) => {
    this.props.onEdit(index)
  }

  ord_render() {
    // const { list, editable } = this.props
    const { editable, list } = this.props
    const visible = editable === false ? editable : true
    return (
      <div>
        <Label>{I18N.get('from.SuggestionForm.title')}</Label>
        {list &&
          list.map((item, index) => {
            return (
              item && (
                <StyledRow key={index}>
                  <div>{I18N.get('from.SuggestionForm.proposal') + `:` + item.title}</div>
                  <div>
                    <TitleLabel>
                      {I18N.get('from.SuggestionForm.detail') + `:`}
                      <ShowLongText text={item.relevanceDetail} id={'info' + index} />
                    </TitleLabel>
                    <SvgLabel>
                      {visible && (
                        <SvgIcon>
                          <EditSvgIcon
                            height="20"
                            width="20"
                            type="edit"
                            onClick={this.handleEdit.bind(this, index)}
                            style={{ marginRight: 22, cursor: 'pointer' }}
                          />
                          <DeleteSvgIcon
                            height="20"
                            width="20"
                            type="delete"
                            onClick={this.handleDelete.bind(this, index)}
                            style={{ cursor: 'pointer' }}
                          />
                        </SvgIcon>
                      )}
                    </SvgLabel>
                  </div>
                </StyledRow>
              )
            )
          })}
      </div>
    )
  }
}

RelevanceList.propTypes = {
  onDelete: PropTypes.func,
  onEdit: PropTypes.func,
  list: PropTypes.array,
  editable: PropTypes.bool
}

export default RelevanceList

const StyledRow = styled.div`
  width: 100%;
  border-bottom: 1px solid #edf1f5;
  margin-bottom: 10px;
  > button {
    margin: 0 4px;
  }
  p {
    padding: 0px;
  }
`
const Label = styled.div`
  margin: 50px 0 30px 0;
  font-size: 17px;
  line-height: 24px;
  color: #000000;
`

const SvgIcon = styled.span`
  display: inline;
  float: right;
`

const TitleLabel = styled.div`
  width:80%;
  display: inline-block;
`

const SvgLabel = styled.div`
  width:20%;
  display: inline-block;
`