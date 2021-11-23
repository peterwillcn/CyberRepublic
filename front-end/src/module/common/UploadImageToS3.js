import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import { message, Icon } from 'antd'
import I18N from '@/I18N'
import styled from 'styled-components'
import PropTypes from 'prop-types'
import { upload_file } from '@/util'

class UploadImageToS3 extends BaseComponent {
  onChange = (e) => {
    const file = e.target.files[0]
    if (!file) {
      return
    }
    // check if the uploaded file is an image
    if (file.type && !file.type.includes('image/')) {
      message.error(I18N.get('image.upload.type.error'))
      return
    }

    if (file.size > 200 * 1024) {
      message.error(I18N.get('image.upload.size.error'))
      e.target.value = null
      return
    }

    upload_file(file).then((rs) => {
      this.props.insertImage(rs.url)
    })

    e.target.value = null
  }

  ord_render() {
    const { name } = this.props
    return (
      <Wrapper>
        <input
          type="file"
          id={name}
          className="upload-base64"
          onChange={this.onChange}
        />
        <label htmlFor={name}>
          <figure>
            <Icon type="picture" />
          </figure>
        </label>
      </Wrapper>
    )
  }
}

UploadImageToS3.propTypes = {
  name: PropTypes.string.isRequired,
  insertImage: PropTypes.func.isRequired
}

export default UploadImageToS3

const Wrapper = styled.div`
  .upload-base64 {
    width: 0.1px;
    height: 0.1px;
    opacity: 0;
    overflow: hidden;
    z-index: -1;
  }

  .upload-base64 + label {
    cursor: pointer;
    display: inline-block;
    overflow: hidden;
    z-index: 99;
  }

  .upload-base64 + label figure {
    width: 24px;
    height: 24px;
    background-color: #008d85;
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .upload-base64 + label svg {
    fill: #fff;
    width: 14px;
    height: 14px;
  }
`
