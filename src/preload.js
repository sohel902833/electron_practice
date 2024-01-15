const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("test", "Hello World!!");

ipcRenderer.on("main_process", (event, data) => {
  console.log("Preload main", data);
});

contextBridge.exposeInMainWorld("main_methods", {
  send: (data) => {
    console.log("Test");

    ipcRenderer.invoke("preload_main", data);
  },
});
