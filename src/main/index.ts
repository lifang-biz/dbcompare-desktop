import { app, BrowserWindow } from 'electron'
import './dialog'
import { Logger } from './logger'
import { initialize } from './services'
import indexPreload from '/@preload/index'
import anotherPreload from '/@preload/another'
import indexHtmlUrl from '/@renderer/index.html'
import sideHtmlUrl from '/@renderer/side.html'
import logoUrl from '/@static/logo.png'

async function main() {
  const logger = new Logger()
  logger.initialize(app.getPath('userData'))
  initialize(logger)
  app.whenReady().then(() => {
    const main = createWindow()
    main.maximize()
  })
}

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    height: 600,
    width: 800,
    webPreferences: {
      preload: indexPreload,
      contextIsolation: true,
      nodeIntegration: true,
      plugins:true,
      // enableRemoteModule: true
    },
    icon: logoUrl
  })

  mainWindow.loadURL(indexHtmlUrl)
  return mainWindow
}

// ensure app start as single instance
if (!app.requestSingleInstanceLock()) {
  app.quit()
}

app.on('window-all-closed', (event) => {
    app.quit()
})

process.nextTick(main)
