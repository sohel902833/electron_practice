const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("test", "Hello World!!");

window.addEventListener("DOMContentLoaded", () => {
  const fileData = document.getElementById("fileData");
  ipcRenderer.on("on_file_open", (e, data) => {
    fileData.value = data;
  });

  ipcRenderer.on("on_save_file", () => {
    ipcRenderer.invoke("on_save_file", fileData.value);
  });
});

ipcRenderer.on("main_process", (event, data) => {
  console.log("Preload main", data);
});

contextBridge.exposeInMainWorld("main_methods", {
  send: async (data) => {
    console.log("Test");

    const response = await ipcRenderer.invoke("preload_main", data);

    console.log("Main Response", response);
  },
  createWindow: () => {
    ipcRenderer.invoke("create_new_window", "yes");
  },
});
