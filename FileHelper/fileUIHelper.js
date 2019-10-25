let currentProject, projects;
function getFiles(elm) {
  console.log(path);
  console.log("Get all projects");
  var path = document.getElementById("myFile").files[0].path;
  ipcRenderer.send("folder-check", {multipleProject: false, path:path});
}

const getMetricButtons = function (hasOneProject) {
  let usedMethod = hasOneProject ? "getMetricsForProject" : "getMetricsForProjects";
  //"+usedMethod+"(" + "" + "+")"+"
  return `<div class="row">
    <div class="col-3 offset-1" ><button class="btn btn-info" onclick="${usedMethod}('mood')">Get MOOD metrics</button></div>
    <div class="col-3"><button class="btn btn-primary" onclick="${usedMethod}('ck')">Get CK metrics</button></div>
    <div class="col-3"><button class="btn btn-secondary" onclick="${usedMethod}('trd')">Get Traditional metrics</button></div>
  </div>
  <div class="row">
    <div class="col-3 offset-1">
      <p class="badge badge-info">Method Hiding Factor (MHF)</p>
      <p class="badge badge-info">Attribute Hiding Factor (AHF)</p>
      <p class="badge badge-info">Method Inheritance Factor (MIF)</p>
      <p class="badge badge-info">Attribute Inheritance Factor (AIF)</p>
      <p class="badge badge-info">Polymorphism Factor (POF)</p>
      <p class="badge badge-info">Coupling Factor (COF)</p>
    </div>
    <div class="col-3">
      <p class="badge badge-primary">Weighted Method per Class (WMC)</p>
      <p class="badge badge-primary">Depth of Inheritance Tree (DIT)</p>
      <p class="badge badge-primary">Number of children (NOC)</p>
      <p class="badge badge-primary">Coupling between objects (CBO)</p>
      <p class="badge badge-primary">Response for a Class (RFC)</p>
      <p class="badge badge-primary">Lack of Cohesion in Methods (LCOM)</p>
      </div>
    <div class="col-3">
      <p class="badge badge-secondary">McCabe Cyclomatic Complexity (CC)</p>
      <p class="badge badge-secondary">Source Lines of Code (SLOC)</p>
      <p class="badge badge-secondary">Comment Percentage (CP)</p>
    </div>
  </div>
  <div class="row">
    <div class="col-6 offset-5"><button class="btn btn-success" onclick="${usedMethod}('all')">Get ALL Metrics</button></div>
  </div>`
}

function filterPaths(dartFiles) {
  return dartFiles.map(file => file.path);
}

function getMetricsForProject(metricType) {
  console.log("metrics: " + metricType);
  console.log(currentProject.dartFiles);
  ipcRenderer.send('metric', {hasOneProject: true, dartFilePaths:filterPaths(currentProject.dartFiles), metricType: metricType, projectName:currentProject.projectName});
}

function getMetricsForProjects(metricType) {
  console.log("Projects metric: " + metricType);
  console.log(projects);
  ipcRenderer.send("metric", {hasOneProject: false, metricType: metricType, projects:projects.flutterProjects});
  
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
  currentProject = {projectName: res.projectName, dartFiles: res.dartFiles}
  $("#main-section").html(getMetricButtons(true)+  getHTMLforOnePrj(res.isFlutterProject, res.dartFiles, res.projectName));
});

const getAllProjects = function(elm){
  console.log("Get all projects");
  var path = document.getElementById("myFiles").files[0].path;
  console.log(path);
  ipcRenderer.send("folder-check", {multipleProject: true, path:path});
}

ipcRenderer.on("checked-folders", (event, res) => {
  let content = getMetricButtons(false);
  if(res.flutterProjects.length === 0){
    content = getHTMLforOnePrj(false, _);
  }
  else{
    projects = {flutterProjects: [...res.flutterProjects]};
    //console.log(projects);
    for (let index = 0; index < res.flutterProjects.length; index++) {
      const flutterProject = res.flutterProjects[index];
      content += "<span style='font-size: 2rem; font-weight: bolder;'>"+(index+1)+". </span>" + getHTMLforOnePrj(true, flutterProject.dartFiles, flutterProject.projectName);
    }
  }
  $("#main-section").html(content);
});