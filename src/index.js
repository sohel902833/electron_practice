const {
  app,
  BrowserWindow,
  ipcRenderer,
  ipcMain,
  Menu,
  dialog,
} = require("electron");
const path = require("path");
const windowStateKeeper = require("electron-window-state");
const isDev = require("electron-is-dev");
const fs = require("fs");
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
    minHeight: 500,
    minWidth: 400,
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
    return "ami paici data";
  });

  ipcMain.handle("create_new_window", (e) => {
    const childWindow = new BrowserWindow({
      height: 300,
      width: 400,
      parent: mainWindow,
      modal: true,
    });
    childWindow.loadURL("http://google.com");
  });
});

let openFilePath = "";
const menuTabs = [
  {
    label: "File",
    submenu: [
      {
        label: "Open",
        click: async () => {
          const { canceled, filePaths } = await dialog.showOpenDialog();
          if (!canceled) {
            const filePath = filePaths[0];
            openFilePath = filePaths[0];
            const fileInfo = fs.readFile(filePath, (error, data) => {
              if (error) {
                return console.log(data);
              } else {
                const fileData = data.toString();
                mainWindow.webContents.send("on_file_open", fileData);
              }
            });
          }
        },
      },
      {
        label: "Save",
        click: async () => {
          mainWindow.webContents.send("on_save_file");
        },
        accelerator: "CmdorCtrl+S",
      },
      {
        label: "Save As",
      },
      {
        label: "Exit",
      },
    ],
  },
  {
    label: "Insert",
  },
];

const appMenu = Menu.buildFromTemplate(menuTabs);
Menu.setApplicationMenu(appMenu);

ipcMain.handle("on_save_file", async (e, data) => {
  if (openFilePath === "") {
    const { canceled, filePath } = await dialog.showSaveDialog();
    if (!canceled) {
      openFilePath = filePath;
    }
  }

  console.log("Data", data, openFilePath);
  fs.writeFile(openFilePath, data, (err) => {
    if (err) {
      return console.log(err);
    } else {
      console.log("File Saved");
    }
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
