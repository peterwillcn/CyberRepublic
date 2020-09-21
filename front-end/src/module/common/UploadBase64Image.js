import React from 'react'
import BaseComponent from '@/model/BaseComponent'
import { message, Icon } from 'antd'
import I18N from '@/I18N'
import styled from 'styled-components'
import PropTypes from 'prop-types'

const IMAGE_SIZE = {
  MAX_WIDTH: 1080,
  MAX_HEIGHT: 720
}

function resizeImage(img) {
  const canvas = document.createElement('canvas')

  let width = img.width
  let height = img.height

  // calculate the width and height, constraining the proportions
  if (width > height) {
    if (width > IMAGE_SIZE.MAX_WIDTH) {
      height = Math.round((height *= IMAGE_SIZE.MAX_WIDTH / width))
      width = IMAGE_SIZE.MAX_WIDTH
    }
  } else {
    if (height > IMAGE_SIZE.MAX_HEIGHT) {
      width = Math.round((width *= IMAGE_SIZE.MAX_HEIGHT / height))
      height = IMAGE_SIZE.MAX_HEIGHT
    }
  }

  // resize the canvas and draw the image data into it
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.drawImage(img, 0, 0, width, height)

  // get the base64 data from canvas as 70% JPG
  return canvas.toDataURL('image/jpeg', 0.7)
}

class UploadBase64Image extends BaseComponent {
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

    if (file.size > 10 * 1024 * 1024) {
      message.error(I18N.get('image.upload.size.error'))
      e.target.value = null
      return
    }

    const blobURL = URL.createObjectURL(file)
    const image = new Image()
    image.src = blobURL

    image.onload = async () => {
      // send it to canvas to compress and convert format
      const base64 = resizeImage(image)
      // release the blob url
      URL.revokeObjectURL(blobURL)
      this.props.insertImage(base64)
    }
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

UploadBase64Image.propTypes = {
  name: PropTypes.string.isRequired,
  insertImage: PropTypes.func.isRequired
}

export default UploadBase64Image

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
