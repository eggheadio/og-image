import {IncomingMessage} from 'http'
import {parse} from 'url'
import compact from 'lodash/compact'

export function parseRequest(req: IncomingMessage) {
  console.log(req.url, parse(req.url || '', true))

  const {pathname = '/', query = {}} = parse(req.url || '', true)
  const {fontSize, images, widths, heights, theme, md} = query
  let [type, slug] = compact(pathname.split('/'))

  if (type && !slug) {
    slug = type
    type = 'series'
  }

  if (Array.isArray(fontSize)) {
    throw new Error('Expected a single fontSize')
  }
  if (Array.isArray(theme)) {
    throw new Error('Expected a single theme')
  }

  const arr = slug.split('.')

  let extension = ''
  let text = ''
  if (arr.length === 0) {
    text = ''
  } else if (arr.length === 1) {
    text = arr[0]
  } else {
    extension = arr.pop() as string
    text = arr.join('.')
  }
  console.log(text, slug, type, extension)
  const parsedRequest: ParsedRequest = {
    resourceType: type,
    fileType: extension === 'jpeg' ? extension : 'png',
    text: decodeURIComponent(text),
    theme: theme === 'dark' ? 'dark' : 'light',
    md: md === '1' || md === 'true',
    fontSize: fontSize || '54px',
    images: getArray(images),
    widths: getArray(widths),
    heights: getArray(heights)
  }
  parsedRequest.images = getDefaultImages(
    parsedRequest.images,
    parsedRequest.theme
  )
  return parsedRequest
}

function getArray(stringOrArray: string[] | string): string[] {
  return Array.isArray(stringOrArray) ? stringOrArray : [stringOrArray]
}

function getDefaultImages(images: string[], theme: Theme): string[] {
  if (
    images.length > 0 &&
    images[0] &&
    images[0].startsWith(
      'https://assets.zeit.co/image/upload/front/assets/design/'
    )
  ) {
    return images
  }
  return theme === 'light'
    ? ['https://assets.zeit.co/image/upload/front/assets/design/now-black.svg']
    : ['https://assets.zeit.co/image/upload/front/assets/design/now-white.svg']
}
