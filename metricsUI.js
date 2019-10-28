function displayMetrics(tabledata, customFormatter){
  var table = new Tabulator("#res-table", {
    //height:"311px",
    layout:"fitDataFill",
    data:tabledata, //load data into table
    //responsiveLayout:true,
    columns:[
        {title:"Project Name", field:"projectName", sorter:"string", titleFormatter:"textarea", variableHeight:true},
        {title:"Avg. McCabe\nCyclomatic Complexity(CC)", field:"cc", sorter:"string", titleFormatter:"textarea", variableHeight:true},
        
        {title:"Source Lines\nof Code(SLOC)", field:"sloc", sorter:"string", titleFormatter:"textarea"},
        {title:"Comment\nPercentage(CP)", field:"cp", sorter:"string", titleFormatter:"textarea"},
        {title:"Attribute\nHiding Factor(AHF)", field:"ahf", sorter:"string", titleFormatter:"textarea"},
        {title:"Method\nHiding Factor(MHF)", field:"mhf", sorter:"string", titleFormatter:"textarea"},
        {title:"Avg. Weighted Method\nper Class(WMC)", field:"wmc", sorter:"string", titleFormatter:"textarea"},
        {title:"Avg. Depth of\nInheritance Tree(DIT)", field:"dit", sorter:"string", titleFormatter:"textarea"},
        {title:"Avg. Number of\nchildren (NOC)", field:"noc", sorter:"string", titleFormatter:"textarea"},
        {title:"Total Access To\nForeign Data(ATFD)", field:"atfd", sorter:"string", titleFormatter:"textarea"},

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
