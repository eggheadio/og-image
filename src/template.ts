import {readFileSync} from 'fs'
import marked from 'marked'
import {sanitizeHtml} from './sanitizer'
const Vibrant = require('node-vibrant')
const twemoji = require('twemoji')
const twOptions = {folder: 'svg', ext: '.svg'}
const emojify = (text: string) => twemoji.parse(text, twOptions)

const eggheadLogoSrc = readFileSync(`${__dirname}/egghead-logo.svg`).toString(
  'base64'
)
const eggheadLogo = 'data:image/svg+xml;base64,' + eggheadLogoSrc
const eggoSrc = readFileSync(`${__dirname}/eggo.svg`).toString('base64')
const eggo = 'data:image/svg+xml;base64,' + eggoSrc
const rglr = readFileSync(`${__dirname}/_fonts/Inter-Regular.woff2`).toString(
  'base64'
)

function getCss(theme: string, fontSize: string, palette: any) {
  let background = 'white'
  let foreground = 'black'

  if (theme === 'dark') {
    background = 'black'
    foreground = 'white'
  }

  return `
  @font-face {
    font-family: 'Inter';
    font-style:  normal;
    font-weight: normal;
    src: url(data:font/woff2;charset=utf-8;base64,${rglr}) format('woff2');
}

    * {
        box-sizing: border-box;
    }

    body {
        background: ${background};
        height: 100vh;
        margin: 0;
        padding: 0;
        font-family: 'Inter', sans-serif;
    }

    code {
        color: #D400FF;
        font-family: 'Vera';
        white-space: pre-wrap;
        letter-spacing: -5px;
    }

    code:before, code:after {
        content: '\`';
    }

    .wrapper {
        border-top: 25px solid rgb(${palette.Vibrant.rgb.toString()});
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        font-family: 'Inter', 'Open Sans', system-ui, -apple-system, BlinkMacSystemFont;
        position: relative;
        padding: 0 3%;
    }

    .eggo {
        position: absolute;
        top: 30px;
        right: 30px;
    }

    .egghead-logo {
        margin-bottom: 20px;
    }

    .logo-holder {
        flex-shrink: 0;
        display: flex;
        align-items: center;
        align-content: center;
        justify-content: center;
        justify-items: center;
        width: 38%;
    }

    .logo {
        width: 100%;
        display: block;
        padding: 5%;
    }

    .info-holder {
        width: 100%;
        flex-grow: 1;
        padding: 90px 0 90px 3%;
    }

    .divider {
        width: 80%;
        height: 2px;
        background: #EFB548;
        margin: 40px 0;
    }

    .metadata-holder {
        font-size: 28px;
        display: flex;
        align-items: center;
        margin-top: 30px;
    }

    .metadata {
        margin-left: 30px;
    }

    .author-holder {
        display: flex;
        align-items: center;
        color: #778FAC;
        font-weight: 300;
    }

    .avatar {
        width: 100%;
        max-width: 60px;
        height: 60px;
        border-radius: 30px;
    }

    .author-name {
        width: 100%;
        margin-left: 16px;
        color: #181421;
        font-weight: 600;
        /* letter-spacing: 4px; */
        /* text-transform: uppercase; */
    }

    .emoji {
        height: 1em;
        width: 1em;
        margin: 0 .05em 0 .1em;
        vertical-align: -0.1em;
    }
    
    .heading {
        font-family: system-ui, -apple-system, BlinkMacSystemFont;
        /* font-family: 'Open Sans', system-ui, -apple-system, BlinkMacSystemFont; */
        font-size: ${fontSize};
        font-style: normal;
        font-weight: 600;
        color: ${foreground};
        line-height: 1.1;
        margin: 0;
    }

    `
}

export function getHtml(parsedReq: ParsedRequest, resource: any, palette: any) {
  const {theme, md, fontSize, widths, heights, resourceType} = parsedReq
  // TODO: this should be able to handle any Resource (ContentModel)
  // which might mean we need to use a "convertToItem" style function?
  const {
    square_cover_large_url,
    title,
    instructor,
    avatar_url,
    full_name,
    published_lesson_count
  } = resource
  const images = [square_cover_large_url || avatar_url]
  const text = title || full_name
  const adjustedFontSize =
    text.length > 60 ? (text.length > 80 ? '36px' : '40px') : fontSize

  /* 
  const colors = Vibrant.from(square_cover_large_url)
    .getPalette()
    .then((palette: any) => {
      // console.log('palette: ', palette)
      return palette
    })
  */

  return `<!DOCTYPE html>
<html>
    <meta charset="utf-8">
    <title>Generated Image</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        ${getCss(theme, adjustedFontSize, palette)}
    </style>
    <body>
        <div class="wrapper">
            <div class="logo-holder">
                ${images
                  .map(
                    (img, i) =>
                      getPlusSign(i) +
                      getImage(img, widths[i], heights[i], 'logo')
                  )
                  .join('')}
            </div>
            <div class="info-holder">
            ${getImage(eggheadLogo, '250', '62', 'egghead-logo')}
                <div class="heading">${emojify(
                  md ? marked(text) : sanitizeHtml(text)
                )}</div>
                <div class="metadata-holder">
                ${
                  instructor
                    ? `
                <div class="author-holder">
                    ${getImage(
                      instructor.avatar_128_url,
                      '128',
                      '128',
                      'avatar'
                    )}
                    <div class="author-name">${emojify(
                      md
                        ? marked(instructor.full_name)
                        : sanitizeHtml(instructor.full_name)
                    )}</div>
                </div>
                `
                    : '<div class="author-name">egghead instructor</div>'
                }
                <div class="metadata">
                ${published_lesson_count &&
                  `${published_lesson_count} video lessons`}
                </div>
                </div>
            </div>
        </div>
    </body>
</html>`
}

function getImage(
  src: string,
  width = '500',
  height = 'auto',
  className: string
) {
  return `<img
        class="${className}"
        alt="Generated Image"
        src="${sanitizeHtml(src)}"
        width="${sanitizeHtml(width)}"
        height="${sanitizeHtml(height)}"
    />`
}

function getPlusSign(i: number) {
  return i === 0 ? '' : '<div class="plus">+</div>'
}
