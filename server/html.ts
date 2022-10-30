import { escape } from 'html-escaper';
import { ServerResponse } from 'http';

import { prisma } from './prisma';

export async function getEmbedHTML(res: ServerResponse, domain: string, key: string) {
  const link = await prisma.link.findUnique({
    where: { domain_key: { domain, key } },
    select: { title: true, url: true, description: true, image: true }
  });

  if (!link) {
    res.statusCode = 404;
    return 'Not Found';
  }

  res.statusCode = 200;
  return `
    <html>
      <head>
        <title>${escape(link.title)}</title>
        <meta property="og:title" content="${escape(link.title)}" />
        <meta property="og:site_name" content="${escape(link.url)}" />
        <meta property="og:description" content="${escape(link.description)}" />
        <meta property="og:image" content="${escape(link.image)}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="${escape(link.url)}" />
        <meta name="twitter:title" content="${escape(link.title)}" />
        <meta name="twitter:description" content="${escape(link.description)}" />
        <meta name="twitter:image" content="${escape(link.image)}" />
      </head>
      <body>
        <h1>${escape(link.title)}</h1>
        <p>${escape(link.description)}</p>
      </body>
    </html>
  `;
}

export function getPasswordPageHTML(attemptedPassword?: string) {
  const title = 'Password Required';
  const description = 'This link is password protected. Please enter the password to view it.';
  const image = 'https://github.com/steven-tey/dub/raw/3388af74d9f539d347e46f50d6fbd3307b85cf1a/public/_static/password-protected.png';

  return `
    <html>
      <head>
        <title>${title}</title>
        <meta property="og:title" content="${title}" />
        <meta property="og:description" content="${title}" />
        <meta property="og:image" content="${image}" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="${title}" />
        <meta name="twitter:description" content="${description}" />
        <meta name="twitter:image" content="${image}" />
      </head>
      <body>
        <style>
          *, :after, :before, input {
            box-sizing: border-box;
            border: 0 solid #e5e7eb;
            margin: 0;
            padding: 0;
            font-family: ui-sans-serif,system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
          }
          input:focus, button:focus {
            outline: none;
          }
          #password-page {
            background-color: #f9fafb;
            justify-content: center;
            align-items: center;
            width: 100vw;
            height: 100vh;
            display: flex;
          }
          #password-page .box {
            box-shadow: #0000001a 0px 20px 25px -5px, #0000001a 0px 8px 10px -6px;
            border-width: 1px;
            border-radius: 1rem;
            overflow: hidden;
            max-width: 28rem;
            width: 100%;
          }
          #password-page header {
            text-align: center;
            padding-top: 2rem;
            padding-bottom: 1.5rem;
            padding-left: 1rem;
            padding-right: 1rem;
            background-color: #fff;
            border-bottom: 1px solid #e5e7eb;
            justify-content: center;
            align-items: center;
            flex-direction: column;
            display: flex;
            color: #000;
          }
          #password-page h3 {
            font-weight: 600;
            font-size: 1.25rem;
            line-height: 1.75rem;
          }
          #password-page header p {
            color: #6b7280;
            font-size: .875rem;
            line-height: 1.25rem;
            margin-top: 0.75rem;
          }
          #password-page form {
            padding: 2rem 1rem;
            background-color: #f9fafb;
            flex-direction: column;
            display: flex;
          }
          #password-page label {
            color: #4b5563;
            font-size: .75rem;
            line-height: 1rem;
            display: block;
          }
          #password-page .input-outer {
            box-shadow: #0000000d 0px 1px 2px 0px;
            border-radius: 0.375rem;
            margin-top: 0.25rem;
            position: relative;
          }
          #password-page input {
            color: #111827;
            padding: 0.5rem 0.75rem;
            padding-right: 2.5rem;
            border: 1px solid #d1d5db;
            border-radius: 0.375rem;
            width: 100%;
            display: block;
          }
          #password-page input:focus {
            border: 1px solid #6b7280;
            box-shadow: #6b7280 0 0 0 1px;
          }
          #password-page .input-outer.error input {
            border-color: #fca5a5;
            color: #ef4444;
          }
          #password-page .input-outer.error input:focus {
            border: 1px solid #ef4444;
            box-shadow: #ef4444 0 0 0 1px;
          }
          #password-page .input-outer.error input::placeholder {
            color: #ef4444;
          }
          #password-page .input-outer .error-icon {
            display: none;
          }
          #password-page .input-outer.error .error-icon {
            display: block;
            color: #ef4444;
            pointer-events: none;
            position: absolute;
            top: 0;
            bottom: 0;
            right: 0;
            padding-right: 0.75rem;
            align-items: center;
            display: flex;
          }
          #password-page .input-outer:not(.error) + #submit-error {
            display: none;
          }
          #password-page #submit-error {
            font-size: .875rem;
            line-height: 1.25rem;
            margin-top: 0.5rem;
            color: #dc2626;
          }
          #password-page button {
            color: #fff;
            background-color: #000;
            border: 1px solid #000;
            border-width: 1px;
            border-radius: 0.375rem;
            justify-content: center;
            align-items: center;
            width: 100%;
            height: 2.5rem;
            display: flex;
            margin-top: 1rem;
            cursor: pointer;
            transition: all cubic-bezier(.4,0,.2,1) .15s;
          }
          #password-page button:hover {
            color: #000;
            background-color: #fff;
          }
          @media (min-width: 640px) {
            #password-page form {
              padding-left: 4rem;
              padding-right: 4rem;
            }
            #password-page input {
              font-size: .875rem;
              line-height: 1.25rem;
            }
          }
        </style>
        <main id="password-page">
          <div class="box">
            <header>
              <h3>Password Required</h3>
              <p>This link is password protected. Please enter the password to view it.</p>
            </header>
            <form>
              <div>
                <label for="password">PASSWORD</label>
                <div class="input-outer${attemptedPassword ? ' error' : ''}">
                  <input type="password" name="password" id="password" ${
                    attemptedPassword ? `value="${escape(attemptedPassword)}"` : ''
                  } required autofocus autocomplete="link-password">
                  <div class="error-icon">
                    <svg fill="none" shape-rendering="geometricPrecision" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" viewBox="0 0 24 24" width="20" height="20">
                      <circle cx="12" cy="12" r="10" fill="currentColor"></circle>
                      <path d="M12 8v4" stroke="white"></path>
                      <path d="M12 16h.01" stroke="white"></path>
                    </svg>
                  </div>
                </div>
                <p id="submit-error">Incorrect password</p>
                <button id="submit">
                  <p>Authenticate</p>
                </button>
              </div>
            </form>
          </div>
        </main>
      </body>
    </html>
  `;
}
