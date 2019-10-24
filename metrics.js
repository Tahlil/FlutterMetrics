const fileHelper = require('./FileHelper/fileElectronHelper');

// // //mood
// // const calculateMHF = function () {  }
// // const calculateAHF = function () {  }
// // const calculateMIF = function () {  }
// // const calculateAIF = function () {  }
// // const calculatePOF = function () {  }
// // const calculateCOF = function () {  }

// // //ck
// // const calculateWMC = function () {  }
// // const calculateDIT = function () {  }
// // const calculateNOC = function () {  }
// // const calculateCBO = function () {  }
// // const calculateRFC = function () {  }
// // const calculateLCOM = function () {  }

// // //traditional
// // const calculateCC = function (dartFilePaths) { 
  
// // }

const calculateSLOC = function (linesInProjects) { 
  let totalLines=0;
  for (let index = 0; index < linesInProjects.length; index++) {
    totalLines += linesInProjects[index].length;    
  }
  return totalLines;
}

const calculateCP = function (linesInProjects, sloc) { 
  let numberOfCommentLine = 0;
  for (let index = 0; index < linesInProjects.length; index++) {
    const lines = linesInProjects[index];
    let multiLine = false;
    for (let j = 0; j < lines.length; j++) {
      if (lines[j].startsWith("//") && !multiLine) {
        numberOfCommentLine++;
      }
      else if(lines[j].startsWith("/*") && !multiLine){
        multiLine = true;
      }
      if(multiLine){
        numberOfCommentLine++;
        if (lines[j].endsWith("*/")) {
          multiLine = false; 
        }
      }
    }    
  }
  return (numberOfCommentLine/sloc).toFixed(5)+"%";
}

const calculateTraditionalMetrics = function(dartFilePaths){
  let cc, sloc, cp;
  let linesInProjects = [];
  for (let index = 0; index < dartFilePaths.length; index++) {
    const path = dartFilePaths[index];
    linesInProjects.push(fileHelper.getAllLines(path));    
  }
  sloc = calculateSLOC(linesInProjects);
  cp = calculateCP(linesInProjects, sloc)
  return {
    sloc: sloc,
    cp: cp
  }  
}

const calculateMOODMetrics =function(dartFilePaths){
  let mhf, ahf, mif, aif, pof, cof;
}
const calculateCKMetrics = function(dartFilePaths){
  let wmc, dit, noc, cbo, rfc, lcom;
}

module.exports = {
  calculateTraditionalMetrics: calculateTraditionalMetrics,
  calculateMOODMetrics: calculateMOODMetrics,
  calculateCKMetrics: calculateCKMetrics
}