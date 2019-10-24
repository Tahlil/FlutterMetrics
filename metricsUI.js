function displayMetrics(tabledata){
  var table = new Tabulator("#res-table", {
    height:"311px",
    layout:"fitColumns",
    data:tabledata, //load data into table
    columns:[
        {title:"Project Name", field:"projectName", sorter:"string", width:200},
        {title:"Predicted Gender", field:"sloc", sorter:"string"},
        {title:"Actual Gender", field:"cp", sorter:"string"},
        // {title:"Success", field:"hasPredicted", formatter:"tickCross", align:"center", width:100}
    ],
});
}

ipcRenderer.on('project-metrics', (event, res) => {
  console.log(res);
  // currentProject = {projectName: res.projectName, dartFiles: res.dartFiles}
  // $("#main-section").html(getMetricButtons(true)+  getHTMLforOnePrj(res.isFlutterProject, res.dartFiles, res.projectName));
});

ipcRenderer.on("mult-projects-metrics", (event, res) => {
  // console.log(res);
  // currentProject = {projectName: res.projectName, dartFiles: res.dartFiles}
  // $("#main-section").html(getMetricButtons(true)+  getHTMLforOnePrj(res.isFlutterProject, res.dartFiles, res.projectName));
});