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

const isVariableName = function(name){
  let valid = true;
  for (const character of name) {
    if(!isValidCharacter){
      valid = false;
      break;
    }
  }
  return !keywords.includes(name) && valid;  
}

const containsSemicolon = function(line){
  let hasFirstQuote = false, hasSecondQuote = false;
  for (const c of line) {
    if(c === "\'"){
      hasFirstQuote = !hasFirstQuote;
    }
    else if(c === "\""){
      hasSecondQuote = !hasSecondQuote;
    }
    else if(c === ";" && !hasFirstQuote && !hasSecondQuote){
      return true;
    }
  }
  return false;
}

function checkArrowFunctions(lines) {
  let publicArrowFunc=[], privateArrowFunc=[];
  for (let index = 0; index < lines.length; index++) {
    let line = "";
    if(lines[index]){
      line = lines[index].trim();
    }
    else{
      continue;
    }
    // if(name === "ChatScreen"){
    //   console.log("Line:   " + line);
    // }
    let splitedLine = line.split(" "), methodName = "";
    if(splitedLine[2]){
      if(isTypeName(splitedLine[0]) && isVariableName(splitedLine[1]) && (splitedLine[2] === "async" || splitedLine[2][0] === "(")){
        if(line.split(")")[1]){
          if(line.split(")")[1].trim().startsWith("=>")){
            methodName = splitedLine[1]
            console.log("One space");

          }
        }
      } 
      if(isTypeName(splitedLine[0]) && isVariableName(splitedLine[1].split("(")[0])){
        if(line.split(")")[1]){
          if(line.split(")")[1].trim().startsWith("=>")){
            methodName = splitedLine[1].split("(")[0]
            console.log("One space");   
          }
        }
      }
    }
    if(methodName !== ""){
      let methodLines = [];
      while(index < lines.length){
        methodLines.push(line);
        line = lines[index];
        if(containsSemicolon(line)){
          break;
        }
        index++;
      }
      if(methodName.startsWith("_")){
        privateArrowFunc.push({methodName: methodName, lines: methodLines});
      }
      else{
        publicArrowFunc.push({methodName: methodName, lines: methodLines});
      }
    }  
  } 
  return {publicArrowFunctions: publicArrowFunc, privateArrowFunctions:privateArrowFunc}
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

function isMethodSignature(line, methods){
  let splitedLine = line.split(" ");
  if(splitedLine[1]){
    if(methods.includes(splitedLine[1]) && (splitedLine[2] === "async" || splitedLine[2][0] === "(")) 
      return {isMethod: true, methodName: splitedLine[1]};
    if(methods.includes(splitedLine[1].split("(")[0]))
      return {isMethod: true, methodName: splitedLine[1].split("(")[0]};
  }
  return {isMethod: false};
}

function getMethods(linesInClass, methods){
  let methodsInFile = [];
  for (let index = 0; index < linesInClass.length; index++) {
    let line = linesInClass[index];
    let checkMethod = isMethodSignature(line, methods); 
    if(checkMethod.isMethod){
        let methodInFile;
        let opening2BrkFound = false, bracket=0, endMethod = false;
        methodInFile = {name: checkMethod.methodName, lines: []};
        while (index < linesInClass.length) {
          for (const character of line) {
            if(character === '{'){
              opening2BrkFound = true;
              bracket++;
            }
            else if(character === '}'){
              bracket--;
            }
            if(opening2BrkFound && bracket === 0){
              endMethod = true;
              break; 
            }
          }
          methodInFile.lines.push(line);
          if (endMethod) {
            methodsInFile.push(methodInFile);
            break;
          }
          index++;
          line = linesInClass[index].trim();  
        }
    }
  }
  return methodsInFile;
}

function getMethodCount(singleline){
  let reverse_method_name = '';
  let method_name = '';
  for(let i=singleline.length-1; i>=0; i--){
      if(singleline[i]==' '){
          if(reverse_method_name.length>0) {
              break;
          } continue;
      }
      else if(isValidCharacter(singleline[i])){
          reverse_method_name += singleline[i];
      } else {
          return '';
      }
  } 
  for(let i=reverse_method_name.length-1; i>=0; i--){
      method_name += reverse_method_name[i];
  }
  for(let i=0; i<keywords.length; i++){
      if(method_name==keywords[i]){
          return '';
      }
  }
  return method_name;
}

function findMethod(lines){
  let public_methods = [];
  let private_methods = [];
  for(let k=0; k<lines.length; k++) {
      let singleline = cleanLineBeforeProcessing(lines[k]);
      let found = false;
      let i;
      for(i=singleline.length-1; i>=0; i--){
          if(singleline[i]==' ') continue;
          else {
              if(singleline[i]=='{'){
                  found=true; 
              } break;
          }
      }
      if(!found) {
          continue;
      }
      let left_bracket_cnt=0, right_bracket_cnt=0;
      for(--i; i>=0; i--) {
          if(singleline[i]==' ') continue;
          if(singleline[i]==')') {
              right_bracket_cnt++;
          } else if(singleline[i]=='(' && right_bracket_cnt>left_bracket_cnt){
              left_bracket_cnt++;
          } 
          if(right_bracket_cnt>0 && right_bracket_cnt==left_bracket_cnt){
              break;
          }
      }
      if(!(left_bracket_cnt>0 && right_bracket_cnt>0 && left_bracket_cnt==right_bracket_cnt)){
          continue;
      }
      let method = getMethodCount(singleline.substring(0, i));
      if(method.length>0){
          if(method[0]=='_'){
              private_methods.push(method);
          } else {
              public_methods.push(method);
          }
      }
  }
  return [public_methods, private_methods];  
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
const calculateMHF = function (linesWithoutCommentsInFiles, fileNames) {    
  let totalPrivate=0, total=0;  
  for (let index = 0; index < linesWithoutCommentsInFiles.length; index++) {
    //console.log("File name: " + fileNames[index]);
    let methods = findMethod(linesWithoutCommentsInFiles[index]);
    let numPrivateAttribute = methods[0].length, numTotalAttributes = methods[0].length + methods[1].length;
    if (numTotalAttributes === 0) {
      continue;
    }
    totalPrivate += numPrivateAttribute;
    total += numTotalAttributes;    
  }
  return total === 0 ? 0.00+"%" : (totalPrivate/total*100).toFixed(2)+"%";
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
  return total === 0 ? 0.00+"%" : (totalPrivate/total*100).toFixed(2)+"%";
}
const calculateMIF = function () { 
  
}
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
    //console.log("File name: " + fileNames[index]);
    //console.log("classes: ");
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

function getMethodsInFiles(classesInFiles,linesWithoutCommentsInFiles){
  let methodsInFiles = [];
  for (let index = 0; index < classesInFiles.length; index++) {
    //console.log(classesInFiles[index]);
    const classes = classesInFiles[index].classes;
    const lines = linesWithoutCommentsInFiles[index];
    const allMethods = findMethod(lines);
    let methods = [...allMethods[0], ...allMethods[1]];
    let currentFileName = classesInFiles[index].fileName;
    //console.log("File name : " + classesInFiles[index].fileName);
    for (let j = 0; j < classes.length; j++) {
      const oneClass = classes[j];
      //console.log("Class name: " + oneClass.name);
      let methodsInFile = getMethods(oneClass.lines, methods);
      //console.log(methodsInFile.map(method => method.name));
      methodsInFiles.push({fileName: currentFileName, className: oneClass.name, methodsInFile: methodsInFile})
    }
  }
  return methodsInFiles;
}

const calculateTraditionalMetrics = function(dartFiles){
  let cc, sloc, cp;
  let linesInFiles = getLinesInFiles(dartFiles);
  sloc = calculateSLOC(linesInFiles);
  let cpInfos = calculateCP(linesInFiles, sloc);
  let fileNames = dartFiles.map(file => file.name);
  let classesInFiles = getClassesFromAllFile(cpInfos.linesWithoutCommentsInFiles, fileNames);
  let methodsInFiles = getMethodsInFiles(classesInFiles, cpInfos.linesWithoutCommentsInFiles);
  //console.log("Methods in Files: ");
  //console.log(classesInFiles);
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
  let fileNames = dartFiles.map(file => file.name);

  let linesWithoutCommentsInFiles = cpInfos.linesWithoutCommentsInFiles;
  let classesInFiles = getClassesFromAllFile(linesWithoutCommentsInFiles, fileNames);

  for (let index = 0; index < classesInFiles.length; index++) {
    const classes = classesInFiles[index].classes;
    console.log("File Name: " + fileNames[index]);    
    for (let j = 0; j < classes.length; j++) {
      const oneClass = classes[j];
      console.log("Class name: " + oneClass.name);
      let linesInClass = oneClass.lines;
      let arrowFunctions = checkArrowFunctions(linesInClass);
      console.log(arrowFunctions);
    }
  }
  ahf = calculateAHF(linesWithoutCommentsInFiles);
  mhf = calculateMHF(linesWithoutCommentsInFiles, fileNames); 
  return {ahf: ahf, mhf: mhf}
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