import { getMessenger } from '~/messengers'
import { windowStorage } from '../../storage'

const backgroundMessenger = getMessenger({
  connection: 'background <> contentScript',
})

export async function injectWallet() {
  const extensionId: string = await backgroundMessenger.send(
    'extensionId',
    undefined,
  )

  // Inject wallet elements
  const container = injectContainer()
  injectIframe({ container, extensionId })

  const handle = injectHandle({ container })
  setupHandleListeners({ container, handle })
  setupToggleListeners({ container, handle })
}

/////////////////////////////////////////////////////////////////////

function injectContainer() {
  const container = document.createElement('div')
  container.id = '__dev-wallet'
  container.style.width = '0px'
  container.style.height = '100vh'
  container.style.position = 'fixed'
  container.style.top = '0'
  container.style.right = '0'
  container.style.border = 'none'
  container.style.zIndex = '2147483646'
  document.body.appendChild(container)
  return container
}

function injectIframe({
  container,
  extensionId,
}: { container: HTMLElement; extensionId: string }) {
  const iframe = document.createElement('iframe')
  iframe.src = `chrome-extension://${extensionId}/src/index.html`
  iframe.style.width = '100%'
  iframe.style.height = '100%'
  iframe.style.border = 'none'
  iframe.style.margin = '0px'
  iframe.style.padding = '0px'
  container.appendChild(iframe)
  return iframe
}

function injectHandle({ container }: { container: HTMLElement }) {
  const handle = document.createElement('div')
  handle.style.display = 'none'
  handle.style.width = '24px'
  handle.style.height = '100%'
  handle.style.position = 'absolute'
  handle.style.top = '0'
  handle.style.right = `${parseInt(container.style.width) - 16}px`
  handle.style.cursor = 'ew-resize'
  container.appendChild(handle)
  return handle
}

function setupHandleListeners({
  container,
  handle,
}: { container: HTMLElement; handle: HTMLElement }) {
  let isDragging = false
  let startX = 0
  let startWidth = 0

  handle.addEventListener('mousedown', (e) => {
    container.style.pointerEvents = 'none'
    isDragging = true
    startX = e.pageX
    startWidth = parseInt(
      document.defaultView?.getComputedStyle(container).width ?? '0',
      10,
    )
  })

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return
    const width = startWidth + startX - e.pageX
    container.style.width = `${width}px`
    handle.style.right = `${width - 16}px`
  })

  document.addEventListener('mouseup', () => {
    container.style.pointerEvents = 'inherit'
    isDragging = false
  })
}

function setupToggleListeners({
  container,
  handle,
}: {
  container: HTMLElement
  handle: HTMLElement
}) {
  let open = Boolean(windowStorage.local.getItem('open')) || false

  async function listener(
    args: { open?: boolean; useStorage?: boolean } | void = {},
  ) {
    if (args?.useStorage && windowStorage.local.getItem('open'))
      open = Boolean(windowStorage.local.getItem('open'))
    else open = args?.open ?? !open

    if (!open) {
      container.style.width = '0px'
      handle.style.display = 'none'
    } else {
      container.style.width = '360px'
      handle.style.display = 'block'
      handle.style.right = '344px'
    }

    if (typeof args?.open === 'undefined')
      windowStorage.local.setItem('open', open)
  }

  backgroundMessenger.reply('toggleWallet', listener)
  listener({ open })
}