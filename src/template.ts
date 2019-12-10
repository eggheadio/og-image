import {readFileSync} from 'fs'
import marked from 'marked'
import {sanitizeHtml} from './sanitizer'
const twemoji = require('twemoji')
const twOptions = {folder: 'svg', ext: '.svg'}
const emojify = (text: string) => twemoji.parse(text, twOptions)

const eggheadLogoSrc = readFileSync(`${__dirname}/egghead-logo.svg`).toString(
  'base64'
)
const eggheadLogo = 'data:image/svg+xml;base64,' + eggheadLogoSrc

function getCss(theme: string, fontSize: string, palette: any) {
  const rglr = readFileSync(
    `${__dirname}/../_fonts/Inter-Regular.woff2`
  ).toString('base64')

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
        font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont;
    }

    .wrapper {
        border-top: 25px solid rgb(${palette.Vibrant.rgb.toString()});
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        position: relative;
        padding: 0 3%;
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

    .byline-holder {
        font-size: 30px;
        display: flex;
        align-items: center;
        margin-top: 30px;
    }

    .metadata {
      display: flex;
      align-items: center;
      margin-left: 30px;
    }

    .icon {
      margin-right: 10px;
    }

    .author-holder {
        display: flex;
        align-items: center;
    }

    .avatar {
        width: 100%;
        max-width: 64px;
        height: 64px;
        border-radius: 32px;
    }

    .author-name {
        width: 100%;
        margin-left: 16px;
        color: #181421;
        font-weight: 600;
    }

    .emoji {
        height: 1em;
        width: 1em;
        margin: 0 .05em 0 .1em;
        vertical-align: -0.1em;
    }
    
    .heading {
        font-size: ${fontSize};
        color: ${foreground};
        font-weight: 600;
        font-style: normal;
        line-height: 1.2;
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
    published_lesson_count,
  } = resource
  const images = [square_cover_large_url || avatar_url]
  const text = title || full_name
  const adjustedFontSize =
    text.length > 60 ? (text.length > 80 ? '40px' : '44px') : fontSize // 54px
  const vibrant = `rgb(${palette.Vibrant.rgb.toString()})`

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
                <div class="byline-holder">
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
                
                <div class="metadata">${
                  published_lesson_count === null
                    ? `<svg class="icon" xmlns="http://www.w3.org/2000/svg" width="34" height="37" viewBox="0 0 34 37">
                    <path fill="#A1A7BC" d="M30.3542083,20.2495677 C30.4772822,19.5269308 30.5417144,18.7955243 30.546875,18.0625 C30.5417144,17.3294757 30.4772822,16.5980692 30.3542083,15.8754323 L33.5151458,12.8213646 C34.0110493,12.3414997 34.1171329,11.5858869 33.7725365,10.9880208 L31.514724,7.07447917 C31.1655385,6.4791127 30.4588055,6.19406991 29.7942708,6.38057813 L25.5796875,7.58474479 C24.438598,6.65531903 23.1539399,5.91767008 21.776026,5.4006875 L20.7178646,1.14094792 C20.5506798,0.470636251 19.9486587,0 19.2578125,0 L14.7421875,0 C14.0513413,0 13.4493202,0.470636251 13.2821354,1.14094792 L12.2179531,5.4006875 C10.8421556,5.91825642 9.55957133,6.65588216 8.4203125,7.58474479 L4.20572917,6.38057812 C3.54122509,6.19462565 2.83482497,6.47953419 2.48527604,7.07447917 L0.227463542,10.9880208 C-0.117928242,11.5862418 -0.0118031993,12.3427706 0.484854167,12.8228698 L3.64579167,15.8769375 C3.52279861,16.5990787 3.45836666,17.3299785 3.453125,18.0625 C3.45828557,18.7955243 3.52271781,19.5269308 3.64579167,20.2495677 L0.484854167,23.3036354 C-0.0110492944,23.7835003 -0.117132874,24.5391131 0.227463542,25.1369792 L2.48527604,29.0505208 C2.7544175,29.5166881 3.2520085,29.8036495 3.79029167,29.803125 C3.93019505,29.8024992 4.06939346,29.7832645 4.20422396,29.7459271 L8.41880729,28.5417604 C9.55989681,29.4711862 10.8445549,30.2088351 12.2224687,30.7258177 L13.286651,34.9855573 C13.4540086,35.6536415 14.0534635,36.1229149 14.7421875,36.125 L19.2578125,36.125 C19.9486587,36.125 20.5506798,35.6543637 20.7178646,34.9840521 L21.7820469,30.7243125 C23.1578444,30.2067436 24.4404287,29.4691178 25.5796875,28.5402552 L29.7942708,29.7444219 C29.9291013,29.7817593 30.0682997,29.800994 30.2082031,29.8016198 C30.7464863,29.8021443 31.2440773,29.5151829 31.5132187,29.0490156 L33.7710312,25.135474 C34.116423,24.537253 34.010298,23.7807242 33.5136406,23.300625 L30.3542083,20.2495677 Z M17,24.0833333 C13.6747856,24.0833333 10.9791667,21.3877144 10.9791667,18.0625 C10.9791667,14.7372856 13.6747856,12.0416667 17,12.0416667 C20.3252144,12.0416667 23.0208333,14.7372856 23.0208333,18.0625 C23.0208333,19.6593243 22.3864974,21.1907468 21.2573721,22.3198721 C20.1282468,23.4489974 18.5968243,24.0833333 17,24.0833333 Z"/>
                  </svg>
                  <span>pre-production</span>`
                    : `${published_lesson_count} video lessons`
                }</div>
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
