const { app, BrowserWindow, ipcRenderer, ipcMain } = require("electron");
const path = require("path");
const windowStateKeeper = require("electron-window-state");
const isDev = require("electron-is-dev");
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  const mainWindowState = windowStateKeeper({
    defaultWidth: 800,
    defaultHeight: 600,
  });
  // Create the browser window.
  mainWindow = new BrowserWindow({
    x: mainWindowState.x,
    y: mainWindowState.y,
    width: mainWindowState.width,
    height: mainWindowState.height,
    title: "HELLO 234",
    webPreferences: {
      // nodeIntegration: true,
      // contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
      // contextIsolation: false,
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, "index.html"));

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  mainWindowState.manage(mainWindow);
  // Open the DevTools.
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow();

  setTimeout(() => {
    mainWindow.webContents.send("main_process", "Main Process value");
  }, 3000);
  ipcMain.handle("preload_main", (e, data) => {
    console.log("From preload", data);
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.