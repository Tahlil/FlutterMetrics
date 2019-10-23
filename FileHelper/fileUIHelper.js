
function getFiles(elm) {
  console.log(path);
  console.log("Get all projects");
  var path = document.getElementById("myFile").files[0].path;
  ipcRenderer.send("folder-check", {multipleProject: false, path:path});
}

function getDartFileName(dartFiles) {
  let allDartFileNames = "", index = 0;
  for (; index < dartFiles.length-1; index++){
    allDartFileNames += (dartFiles[index].name + ", ");
  }
  allDartFileNames += dartFiles[index].name;
  return allDartFileNames;
}

function getHTMLforOnePrj(isFlutterProject, dartFiles, projectName) {
  if(isFlutterProject){
    return "<p class='alert alert-primary'>Project Name: <span style='font-size: 2rem; font-weight: bolder;'>"+ projectName + "</span><br>Dart files: <span style='font-size: 1rem; font-weight: bolder;'>" + getDartFileName(dartFiles)+ "</span></p>";
  }
  else{
    return "<h1 class='alert alert-danger'>Not a flutter Project</h1>";
  }
}

ipcRenderer.on("checked-folder", (event, res) => {
  console.log(res);
  $("#main-section").html(getHTMLforOnePrj(res.isFlutterProject, res.dartFiles, res.projectName));
});

const getAllProjects = function(elm){
  console.log("Get all projects");
  var path = document.getElementById("myFiles").files[0].path;
  console.log(path);
  ipcRenderer.send("folder-check", {multipleProject: true, path:path});
}

ipcRenderer.on("checked-folders", (event, res) => {
  let content = "";
  if(res.flutterProjects.length === 0){
    content = getHTMLforOnePrj(false, _);
  }
  else{
    for (let index = 0; index < res.flutterProjects.length; index++) {
      const flutterProject = res.flutterProjects[index];
      content += "<span style='font-size: 2rem; font-weight: bolder;'>"+(index+1)+". </span>" + getHTMLforOnePrj(true, flutterProject.dartFiles, flutterProject.projectName);
    }
  }
  $("#main-section").html(content);
});