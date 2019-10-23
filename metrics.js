function displayMetrics(tabledata){
  var table = new Tabulator("#res-table", {
    height:"311px",
    layout:"fitColumns",
    data:tabledata, //load data into table
    columns:[
        {title:"Project Name", field:"projectName", sorter:"string", width:200},
        {title:"Predicted Gender", field:"predicted", sorter:"string"},
        {title:"Actual Gender", field:"actual", sorter:"string"},
        // {title:"Success", field:"hasPredicted", formatter:"tickCross", align:"center", width:100}
    ],
});
}