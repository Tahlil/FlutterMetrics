const fileHelper = require('./FileHelper/fileElectronHelper');
const typesInDart = [""];


var keywords = [
  'dynamic', 'show', 'as', 'import', 'static', 'assert', 'enum', 'in', 'super','async', 
  'export', 'switch', 'await', 'extends',	'sync', 'external', 'library', 'case', 'factory',
  'mixin', 	'throw','catch', 'try', 'finally', 'on', 'for', 'operator', 'covariant',
  'Function', 'part', 'get','rethrow', 'while', 'deferred', 'hide','with', 'if', 'set', 'yield', 'int', 'float', 'var' 
];

function isValidCharacter(character) {
  let condition = character=='_';
  condition |= character>='a' && character<='z';
  condition |= character>='A' && character<='Z';
  condition |= character>='0' && character<='9';
  return condition;
}

function cleanLineBeforeProcessing(singleline) {
  let str=' ';
  for(let i=0; i<singleline.length; i++){
      if(isValidCharacter(singleline[i]) || singleline[i]==' ') {
          str += singleline[i]; 
      } else {
          str += ' ';
          str += singleline[i];
          str += ' ';
      }
  }  
  return str;
}

const isABuiltInType = function (name) {
  return (name === 'void' || name === 'int' || name === 'double'|| name === 'bool' || name === 'dynamic')
}

const isTypeName = function(name){
  return name[0] === name[0].toUpperCase() || (isABuiltInType(name));
}

const isVariableName = function(){
  return nam  
}

function containsDataType(singleline) {
  let is_return='';
  for(let i=0; i<singleline.length; i++){
      if( !(isValidCharacter(singleline[i]) ||
          singleline[i]==' ' || singleline[i]==',' ||
          singleline[i]=='<' || singleline[i]=='>')
      ) {
          return false;
      }
      if(isValidCharacter(singleline[i])){
          is_return += singleline[i];
      } else {
          if(is_return=='return') return false;
          is_return = '';
      }
  }
  if(is_return=='return') return false;
  let datatype_len_cnt=0; // has there any datatype or doesn't.
  for(let i=0; i<singleline.length; i++){
      if(isValidCharacter(singleline[i])){
          datatype_len_cnt++;
      } else {
          if(datatype_len_cnt>0){
              return true;
          }
      }
  }
  return false;
}

function reverse_this(str) {
  let temp = '';
  for(let i=str.length-1; i>=0; i--){
      temp += str[i];
  }
  return temp;
}

function findAttribute(lines) {
  let public_attributes = [];
  let private_attributes = [];
  for(let k=0; k<lines.length; k++){
      let singleline = cleanLineBeforeProcessing(lines[k]);
      let equalCnt=0;
      let semicolon=false;
      let skip_line = false;
      let pos=singleline.length-1;
      for(let i=singleline.length-1; i>=0; i--){
          if(singleline[i]=='='){
              equalCnt++;
              pos=i;
              if(equalCnt>1){
                  skip_line=true;
                  break;
              }
          } else if(singleline[i]==';'){
              semicolon=true;
          }
      }
      if(skip_line || !semicolon) continue;
      let attribute = '';
      if(pos!=singleline.length-1) pos--;
      for(; pos>=0; pos--){
          if(singleline[pos]==';'){
              continue;
          } else if(singleline[pos]==' '){
              if(attribute.length>0){
                  if(containsDataType(singleline.substring(0, pos+1))){
                      attribute = reverse_this(attribute);
                      if(attribute[0]=='_'){
                          private_attributes.push(attribute);
                      } else {
                          public_attributes.push(attribute);
                      }
                  }
                  break;
              }
          } else if(isValidCharacter(singleline[pos])){
              attribute += singleline[pos];
          } else {
              break;
          }
      }
  }
  return [public_attributes, private_attributes];
}


function findMethod(lines){

}

function classIdentify(line) {
  return line.startsWith("class");
}

function getClassName(line) {
  return line.split(" ")[1];
}

function findClasses(lines) {
  let classes = [], numberOfClass = 0;
  for (let index = 0; index < lines.length; index++) {
    let line = lines[index].trim();
    if(classIdentify(line)){
      let opening2BrkFound = false, bracket=0, endClass = false;
      classes[numberOfClass] = {name: getClassName(line), lines: []};
      while (index < lines.length) {
        for (const character of line) {
          if(character === '{'){
            opening2BrkFound = true;
            bracket++;
          }
          else if(character === '}'){
            bracket--;
          }
          if(opening2BrkFound && bracket === 0){
            endClass = true;
            break; 
          }
        }
        classes[numberOfClass].lines.push(line);
        if (endClass) {
          numberOfClass++;
          break;
        }
        index++;
        line = lines[index].trim();  
      }
    }
  } 
  return classes;
}
// //mood
const calculateMHF = function () { 
  let all_methods = findMethod(file_path);    
  return [all_methods[1].length, (all_methods[0].length+all_methods[1].length)];
}

const calculateAHF = function (linesWithoutCommentsInFiles) { 
  let totalPrivate=0, total=0;
  for (let index = 0; index < linesWithoutCommentsInFiles.length; index++) {
    const lines = linesWithoutCommentsInFiles[index];
    let attributes = findAttribute(lines);
    let numPrivateAttribute = attributes[0].length, numTotalAttributes = attributes[0].length + attributes[1].length;
    if (numTotalAttributes === 0) {
      continue;
    }
    totalPrivate += numPrivateAttribute;
    total += numTotalAttributes; 
    //console.log(attributes);
  }
  return total === 0 ? 0.0+"%" : (totalPrivate/total*100).toFixed(2)+"%";
}
const calculateMIF = function () {  }
const calculateAIF = function () {  }
const calculatePOF = function () {  }
const calculateCOF = function () {  }

// // //ck
// // const calculateWMC = function () {  }
// // const calculateDIT = function () {  }
// // const calculateNOC = function () {  }
// // const calculateCBO = function () {  }
// // const calculateRFC = function () {  }
// // const calculateLCOM = function () {  }

function getClassesFromAllFile(linesInFiles, fileNames){
  let classesInFiles = [];
  for (let index = 0; index < linesInFiles.length; index++) {
    const classes = findClasses(linesInFiles[index]);
    console.log("File name: " + fileNames[index]);
    console.log("classes: ");
    //console.log(classes);
    classesInFiles.push({fileName: fileNames[index], classes: classes});
  }
  return classesInFiles;
}

// // //traditional
const calculateCC = function () { 
  let nodes = 0, edges = 0;
  
}

const calculateSLOC = function (linesInFiles) { 
  let totalLines=0;
  for (let index = 0; index < linesInFiles.length; index++) {
    totalLines += linesInFiles[index].length;    
  }
  return totalLines;
}

const calculateCP = function (linesInFiles, sloc) { 
  let numberOfCommentLine = 0, linesWithoutCommentsInFiles=[];
  for (let index = 0; index < linesInFiles.length; index++) {
    const lines = linesInFiles[index];
    linesWithoutCommentsInFiles.push([]);
    let multiLine = false;
    for (let j = 0; j < lines.length; j++) {
      if (lines[j].startsWith("//") && !multiLine) {
        numberOfCommentLine++;
        continue;
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
      else{
        linesWithoutCommentsInFiles[index].push(lines[j])
      }
    }    
  }
  return {
    cp: (numberOfCommentLine/sloc*100).toFixed(2)+"%",
    linesWithoutCommentsInFiles: linesWithoutCommentsInFiles
  }
}

const getLinesInFiles= function (dartFiles) {
  let linesInFiles = [];
  for (let index = 0; index < dartFiles.length; index++) {
    const path = dartFiles[index].path;
    linesInFiles.push(fileHelper.getAllLines(path));    
  }
  return linesInFiles;
} 

const calculateTraditionalMetrics = function(dartFiles){
  let cc, sloc, cp;
  let linesInFiles = getLinesInFiles(dartFiles);
  sloc = calculateSLOC(linesInFiles);
  let cpInfos = calculateCP(linesInFiles, sloc);
  let fileNames = dartFiles.map(file => file.name);
  let classesInFiles = getClassesFromAllFile(cpInfos.linesWithoutCommentsInFiles, fileNames);
  let methodInFiles = [];
  for (let index = 0; index < classesInFiles.length; index++) {
    const classes = classesInFiles[index].classes;
    // for (let j = 0; j < array.length; j++) {
    //   const element = array[j];
      
    // }
  }
  
  //cc = calculateCC()
  cp = cpInfos.cp
  return {
    sloc: sloc,
    cp: cp
  }  
}

const calculateMOODMetrics =function(dartFiles){
  let mhf, ahf, mif, aif, pof, cof;
  let linesInFiles = getLinesInFiles(dartFiles);
  sloc = calculateSLOC(linesInFiles);
  let cpInfos = calculateCP(linesInFiles, sloc);
  let linesWithoutCommentsInFiles = cpInfos.linesWithoutCommentsInFiles;
  ahf = calculateAHF(linesWithoutCommentsInFiles);
  return {ahf: ahf}
}
const calculateCKMetrics = function(dartFiles){
  let wmc, dit, noc, cbo, rfc, lcom;
  return {};
}

module.exports = {
  calculateTraditionalMetrics: calculateTraditionalMetrics,
  calculateMOODMetrics: calculateMOODMetrics,
  calculateCKMetrics: calculateCKMetrics
}