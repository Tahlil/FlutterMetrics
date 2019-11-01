function displayMetrics(tabledata, customFormatter){
  var table = new Tabulator("#res-table", {
    //height:"311px",
    layout:"fitDataFill",
    data:tabledata, //load data into table
    //responsiveLayout:true,
    columns:[
        {title:"Project Name", field:"projectName", sorter:"number", titleFormatter:"textarea", variableHeight:true},
        {title:"Avg. McCabe\nCyclomatic Complexity(CC)", field:"cc", sorter:"number", titleFormatter:"textarea", variableHeight:true},
        
        {title:"Source Lines\nof Code(SLOC)", field:"sloc", sorter:"number", titleFormatter:"textarea"},
        {title:"Comment\nPercentage(CP)", field:"cp", sorter:"number", titleFormatter:"textarea"},
        {title:"Attribute\nHiding Factor(AHF)", field:"ahf", sorter:"number", titleFormatter:"textarea"},
        {title:"Method\nHiding Factor(MHF)", field:"mhf", sorter:"number", titleFormatter:"textarea"},
        {title:"Avg. Weighted Method\nper Class(WMC)", field:"wmc", sorter:"number", titleFormatter:"textarea"},
        {title:"Avg. Depth of\nInheritance Tree(DIT)", field:"dit", sorter:"number", titleFormatter:"textarea"},
        {title:"Avg. Number of\nchildren (NOC)", field:"noc", sorter:"number", titleFormatter:"textarea"},
        {title:"Total Access To\nForeign Data(ATFD)", field:"atfd", sorter:"number", titleFormatter:"textarea"},
        {title:"Total Tight Class\nCohesion(TCC)", field:"tcc", sorter:"number", titleFormatter:"textarea"},
        // {title:"Success", field:"hasPredicted", formatter:"tickCross", align:"center", width:100}
    ]
});
}

function displayGodClasses(tabledata, id){
  var table = new Tabulator("#"+id, {
    layout:"fitDataFill",
    data:tabledata, //load data into table
    //responsiveLayout:true,
    columns:[
        {title:"Class Name", field:"className", sorter:"string", titleFormatter:"textarea", variableHeight:true},
        {title:"Avg. Weighted Method per Class(WMC)", field:"wmc", sorter:"number", titleFormatter:"textarea"},
        {title:"WMC >= 47", field:"wmcGte47", sorter:"string", titleFormatter:"textarea", formatter: 'tickCross'},
        {title:"Access To Foreign Data(ATFD)", field:"atfd", sorter:"number", titleFormatter:"textarea"},
        {title:"ATFD > 5", field:"atfdGt5", sorter:"string", titleFormatter:"textarea", formatter: 'tickCross'},
        {title:"Tight Class Cohesion(TCC)", field:"tcc", sorter:"number", titleFormatter:"textarea"},
        {title:"TCC < 33%", field:"tccLt33", sorter:"string", titleFormatter:"textarea", formatter: 'tickCross'},
        {title:"Is God Class", field:"isGodClass", sorter:"string", titleFormatter:"textarea", formatter: 'tickCross'},
        
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

ipcRenderer.on('smell-detected', (event, res) => {
  $('smell-table').html('');
  for (let index = 0; index < res.length; index++) {
    const finalRes = res[index].finalResult;
    const projectName = res[index].projectName;
    const id =  "sml" + (index+1);
    $('#smell-table').append("<h5 class='badge badge-primary mt-5'>" + projectName+ "</h5><div id='"+ id + "'></div>");
    //setTimeout(() => {
    displayGodClasses(finalRes, id);      
    //}, 1000);
  }
  //$('smell-table').append
});