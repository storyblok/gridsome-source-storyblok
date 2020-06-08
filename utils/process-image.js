const path = require('path')
const https = require('https')
const fs = require('fs')
const { isArray, isPlainObject, isString } = require('lodash')

const { PLUGIN_ROOT, SOURCE_ROOT } = require('./constants')

/**
 * @method isStoryblokImage
 * @param  {String} value
 * @return {Boolean}
 */
const isStoryblokImage = value => {
  const isStoryblokPath = value.indexOf('//a.storyblok.com/f/') !== -1
  const isImagePath = value.match(/\.(jpeg|jpg|gif|png)$/) !== null

  return isStoryblokPath && isImagePath
}

/**
 * @method getImageUrl
 * @param  {String} value
 * @return {String}
 *
 * @example
 * getImageUrl('https://any-url.com') // 'https://any-url.com'
 * getImageUrl('http://any-url.com') // 'http://any-url.com'
 * getImageUrl('//any-url.com') // 'https://any-url.com'
 */
const getImageUrl = value => /^https?:/.test(value) ? value : `https:${value}`

/**
 * @method downloadImage
 * @param  {String} url
 * @param  {String} filePath
 * @param  {String} filename
 * @return {Promise}
 */
const downloadImage = (url, filePath, filename) => {
  if (fs.existsSync(filePath)) {
    console.log(`[gridsome-source-storyblok] Image ${filename} already downloaded`)
    return
  }

  const URL = getImageUrl(url)
  return new Promise((resolve, reject) => {
    console.log(`[gridsome-source-storyblok] Downloading: ${filename}...`)
    const file = fs.createWriteStream(filePath)

    https.get(URL, response => {
      response.pipe(file)
      file.on('finish', () => {
        console.log(`[gridsome-source-storyblok] ${filename} successfully downloaded!`)
        file.close(resolve)
      })
    }).on('error', err => {
      console.error(`[gridsome-source-storyblok] Error on processing image ${filename}`)
      console.error(err.message)
      fs.unlink(filePath, err => {
        if (err) {
          reject(err)
        }

        console.log(`[gridsome-source-storyblok] Removed the ${filename} image correct`)
        resolve(true)
      })
    })
  })
}

/**
 * @method getPathToSave
 * @param  {String} dir
 * @param  {String} filename
 * @return {String}          returns a absolute path to file that will be save
 */
const getPathToSave = (dir, filename) => {
  return path.join(PLUGIN_ROOT, SOURCE_ROOT, dir, filename)
}

/**
 * @method getFilename
 * @param  {String} url
 * @return {String}
 */
const getFilename = url => url.substring(url.lastIndexOf('/') + 1)

/**
 * @method getOptionsFromImage
 * @param  {String} imageDirectory
 * @param  {String} imageURL       Storyblok image URL
 * @return {Object}                { url, filePath, path, filename }
 */
const getOptionsFromImage = (imageDirectory, imageURL) => {
  const url = imageURL
  const filename = getFilename(imageURL)
  const filePath = getPathToSave(imageDirectory, filename)
  const path = `${imageDirectory}/${filename}`

  return {
    url,
    filePath,
    path,
    filename
  }
}

/**
 * @method processItem
 * @param  {String} imageDirectory directory to save the image
 * @param  {Object} item           object from Content Delivery API
 * @return {Promise<Object>}       return the same object
 */
const processItem = async (imageDirectory, item) => {
  for (const key in item) {
    const value = item[key]

    if (isString(value)) {
      if (isStoryblokImage(value)) {
        try {
          const image = value
          const data = getOptionsFromImage(imageDirectory, image)
          const { url, filePath, path, filename } = data
          item[key] = {
            url,
            filename,
            path
          }
          await downloadImage(url, filePath, filename)
        } catch (e) {
          console.error('[gridsome-source-storyblok] Error on download image ' + e.message)
        }
      }
    }

    if (isArray(value)) {
      try {
        await Promise.all(
          value.map(_item => processItem(imageDirectory, _item))
        )
      } catch (e) {
        console.error(e)
      }
    }

    if (isPlainObject(value)) {
      try {
        await processItem(imageDirectory, value)
      } catch (e) {
        console.error(e)
      }
    }
  }

  return Promise.resolve(item)
}

/**
 * @method processImage
 * @param  {Object} options { imageDirectory: String }
 * @param  {Object} story   Storyblok story content
 * @return {Promise}
 */
const processImage = async (options, story) => {
  const imageDirectory = options.imageDirectory
  try {
    const content = await processItem(imageDirectory, story.content)

    return Promise.resolve({
      ...story,
      content
    })
  } catch (e) {
    return Promise.reject(e)
  }
}

module.exports = processImage
