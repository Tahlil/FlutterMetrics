function displayMetrics(tabledata){
  var table = new Tabulator("#res-table", {
    //height:"311px",
    layout:"fitColumns",
    data:tabledata, //load data into table
    columns:[
        {title:"Project Name", field:"projectName", sorter:"string", width:200},
        {title:"Source Lines of Code (SLOC)", field:"sloc", sorter:"string"},
        {title:"Comment Percentage (CP)", field:"cp", sorter:"string"},
        // {title:"Success", field:"hasPredicted", formatter:"tickCross", align:"center", width:100}
    ],
});
}

ipcRenderer.on('project-metrics', (event, res) => {
  console.log(res);
  displayMetrics(res);
  // currentProject = {projectName: res.projectName, dartFiles: res.dartFiles}
  // $("#main-section").html(getMetricButtons(true)+  getHTMLforOnePrj(res.isFlutterProject, res.dartFiles, res.projectName));
});

ipcRenderer.on("mult-projects-metrics", (event, res) => {
  console.log(res);
  displayMetrics(res);
  // currentProject = {projectName: res.projectName, dartFiles: res.dartFiles}
  // $("#main-section").html(getMetricButtons(true)+  getHTMLforOnePrj(res.isFlutterProject, res.dartFiles, res.projectName));
});