function displayMetrics(tabledata, customFormatter){
  var table = new Tabulator("#res-table", {
    //height:"311px",
    layout:"fitColumns",
    data:tabledata, //load data into table
    columns:[
        {title:"Avg. McCabe Cyclomatic Complexity(CC)", field:"cc", sorter:"string", titleFormatter:"textarea"},
        {title:"Project Name", field:"projectName", sorter:"string", width:200, titleFormatter:"textarea"},
        {title:"Source Lines of Code (SLOC)", field:"sloc", sorter:"string", titleFormatter:"textarea"},
        {title:"Comment Percentage (CP)", field:"cp", sorter:"string", titleFormatter:"textarea"},
        {title:"Attribute Hiding Factor (AHF)", field:"ahf", sorter:"string", titleFormatter:"textarea"},
        {title:"Method Hiding Factor (MHF)", field:"mhf", sorter:"string", titleFormatter:"textarea"},
        {title:"Weighted Method per Class (WMC)", field:"wmc", sorter:"string", titleFormatter:"textarea"},

        // {title:"Success", field:"hasPredicted", formatter:"tickCross", align:"center", width:100}
    ]
});
}

ipcRenderer.on('project-metrics', (event, res) => {
  var customFormatter = function(cell, formatterParams, onRendered){
    cell.getElement().css({"background-color":"#A6A6DF"});
  }
  console.log(res);
  

  displayMetrics(res, customFormatter);
  // currentProject = {projectName: res.projectName, dartFiles: res.dartFiles}
  // $("#main-section").html(getMetricButtons(true)+  getHTMLforOnePrj(res.isFlutterProject, res.dartFiles, res.projectName));
});
