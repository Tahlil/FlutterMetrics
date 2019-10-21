
function getFilename(elm) {
  var path = document.getElementById("myFile").files[0].path;
  ipcRenderer.send("folder-check", path);

  console.log(path);
}

ipcRenderer.on("checked-folder", (event, res) => {

});
