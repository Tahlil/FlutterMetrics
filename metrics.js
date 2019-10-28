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
            //console.log("One space");

          }
        }
      } 
      if(isTypeName(splitedLine[0]) && isVariableName(splitedLine[1].split("(")[0])){
        if(line.split(")")[1]){
          if(line.split(")")[1].trim().startsWith("=>")){
            methodName = splitedLine[1].split("(")[0]
            //console.log("One space");   
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

const isArrowMethod = function(line, arrowMethods){
  let splitedLine = line.split(" ");
  let arrowMethodNames = arrowMethods.map(method => method.methodName);
  if(splitedLine[1]){
    if(arrowMethodNames.includes(splitedLine[1]) && (splitedLine[2] === "async" || splitedLine[2][0] === "(")){
      let lines = arrowMethods.filter(method => method.methodName === splitedLine[1])[0].lines;
      return {isMethod: true, methodName: splitedLine[1], lines: lines};
    }
    if(arrowMethodNames.includes(splitedLine[1].split("(")[0])){
      let lines = arrowMethods.filter(method => method.methodName === splitedLine[1].split("(")[0])[0].lines;
      return {isMethod: true, methodName: splitedLine[1].split("(")[0], lines: lines};
    }
  }
  return {isMethod: false};
}

function getMethods(linesInClass, methods, arrowMethods){
  let methodsInFile = [];
  for (let index = 0; index < linesInClass.length; index++) {
    let line = linesInClass[index];
    let checkMethod = isMethodSignature(line, methods);
    let checkArrowMethod = isArrowMethod(line, arrowMethods); 
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
          if(!linesInClass[index])
            break;
          line = linesInClass[index].trim();  
        }
    }
    else if(checkArrowMethod.isMethod){
      methodsInFile.push({name: checkArrowMethod.methodName, lines: checkArrowMethod.lines});
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
  let splitted = line.split(" ");
  return line.startsWith("class") || (splitted[0] === "abstract" && splitted[0] === "class");
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
// mood
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
const calculateWMC = function (linesWithoutCommentsInFiles, fileNames) { 
  let wmc = 0;
  let classesInFiles = getClassesFromAllFile(linesWithoutCommentsInFiles, fileNames);
  let numberOfClasses = getNumberOfClasses(classesInFiles);
  let ccInfos = calculateCC(linesWithoutCommentsInFiles, fileNames)
  let ccs = ccInfos.map(ccInfo => ccInfo.cc);
  let cc = ccs.reduce((total, current) => {
    return total + current
  });
  wmc = (cc/numberOfClasses).toFixed(2);
  return wmc
}

const calculateDIT = function (childParentMap) {
  let classToDITMap = {}; 
  console.log(childParentMap);
  let children = Object.keys(childParentMap);
  for (const child of children) {
    let currentChildDIT = 1;
    let currentParent = childParentMap[child];
    let tempChildren = [...children];
    while(currentParent.length !== 0){
      currentChildDIT++;
      let currentChild = currentParent[0];
      currentParent = [];
      console.log("Child: "+child);
      //console.log("currentChild: " + currentChild);
      //console.log("Child: "+children);      
      if(tempChildren.includes(currentChild)){
        //console.log("h;saf;sfj;slfjsl;fjs;lfjfjlfj;");
        currentParent = childParentMap[currentChild];
        console.log(currentParent);        
      }
    }
    classToDITMap[child] = currentChildDIT;
  }
  console.log(classToDITMap);
  let totalDIT = Object.values(classToDITMap).reduce((total, current) => {
    return total + current;
  }, 0);
  const averageDIT = totalDIT / Object.values(classToDITMap).length;
  return averageDIT.toFixed(2);
}

const calculateNOC = function (childParentMap) { 
  let classToNOPMap = {}; 
  console.log(childParentMap);
  
  let children = Object.keys(childParentMap);
  let parents = Object.values(childParentMap).map(value => value[0]);
  //console.log(children);
  //console.log(parents);
  let allClasses = [...children, ...parents];
  console.log(allClasses);
  function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
}
  let allUniqueClasses = allClasses.filter(onlyUnique);
  console.log("Number of classes: " + allClasses.length);
  console.log("Number of classes set: " + allUniqueClasses.length);
  //console.log(allClasses);
  //console.log(allUniqueClasses);
  for (const parent of parents) {
    if(classToNOPMap.hasOwnProperty(parent)){
      classToNOPMap[parent]++;
    }
    else{
      classToNOPMap[parent] = 1;
    }
  }
  console.log(classToNOPMap);
  let totalNOP = Object.values(classToNOPMap).reduce((total, current) => {
    return total + current;
  }, 0); 
  return (totalNOP/allUniqueClasses.length).toFixed(2);
}

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

const checkStartsWithMethod = function(part, methodNames){
  let methodFound = false, method = "";
  for (const methodName of methodNames) {
    if(part.startsWith(methodName)){
      method = methodName;
      methodFound = true;
    }
  }
  return {method: method, methodFound:methodFound};
}

const ccFromOtherMethodCall = function(line, allMethods){
  //console.log(allMethods);
  let cc = 0, allMethodNames = Object.keys(allMethods), splittedLine;
  if(allMethodNames.length === 0)
    return 0; 
  line = line.replace(/  +/g, ' ');
  if(line.includes('\"')){
    splittedLine = line.split('\"');
  }
  else if(line.includes('\'')){
    splittedLine = line.split('\'');    
  }
  else{
    splittedLine = line.split('\"');
  }
  let i = 0;
  while(i < splittedLine.length){
    let splitBySpace = splittedLine[i].split(' ');
    for (let index = 0; index < splitBySpace.length; index++) {
      const splited = splitBySpace[index];
      let checkedMethod = checkStartsWithMethod(splited, allMethodNames); 
      if(checkedMethod.methodFound){
        let lines = allMethods[checkedMethod.method];
        delete allMethods[checkedMethod.method];
        cc += getCCOfAMethod(lines, allMethods);
      }
    }
    i+=2;
  }
  return cc;
}

function getCCOfAMethod(linesOfMethod, allMethods) {
  let nodes = 1, edges = 0, cc = 0;
  if(linesOfMethod){
    for (let index = 0; index < linesOfMethod.length; index++) {
      const line = linesOfMethod[index];
      if(line.startsWith("else if") || line.startsWith("if")){
        nodes += 2;
        edges += 3;
      }
      else if(line.startsWith("else")){
        nodes ++;
        edges ++;
      }
      else if(line.startsWith("while") || line.startsWith("do")  || line.startsWith("for")){
        nodes += 2;
        edges += 4;
      }
      else if(line.startsWith("case")){
        nodes ++;
        edges += 2;
      }
      if(index !== 0)
        cc += ccFromOtherMethodCall(line, allMethods);
    }
  }
  
  cc += (edges - nodes + 2);
  return cc;
}

function getAllMethods(methodsInFiles) {
  let methods = {};
  for (let index = 0; index < methodsInFiles.length; index++) {
    const methodsInFile = methodsInFiles[index];
    for (let j = 0; j < methodsInFile.methodsInFile.length; j++) {
      const method = methodsInFile.methodsInFile[j];
      methods[method.name] = method.lines;
    }  
  }
  return methods;  
}

//traditional
const calculateCC = function (linesWithoutCommentsInFiles, fileNames) { 
  let classesInFiles = getClassesFromAllFile(linesWithoutCommentsInFiles, fileNames);
  let methodsInFiles = getMethodsInFiles(classesInFiles, linesWithoutCommentsInFiles);
  //console.log("Methods in Files: ");
  //console.log(methodsInFiles);
  let allMethods = getAllMethods(methodsInFiles);
  let allCCs = [];
  for (let index = 0; index < methodsInFiles.length; index++) {
    const methodsInFile = methodsInFiles[index];
    //console.log("FIle name: " + methodsInFile.fileName);
    for (let j = 0; j < methodsInFile.methodsInFile.length; j++) {
      const method = methodsInFile.methodsInFile[j];
      //console.log("Cyclometic complexity of " + method.name + " is:");
      //console.log(allMethods);
      let ccOfAMethod = getCCOfAMethod(method.lines, allMethods);
      allCCs.push({cc: ccOfAMethod, methodName: method.name});
    }
  }
  return allCCs;
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
    let currentFileName = classesInFiles[index].fileName;
    //console.log("File name : " + classesInFiles[index].fileName);
    for (let j = 0; j < classes.length; j++) {
      const oneClass = classes[j];
      const allMethods = findMethod(oneClass.lines);
    let arrowFunctions = checkArrowFunctions(oneClass.lines);
    let methods = [...allMethods[0], ...allMethods[1]];
    let arrowMethods = [...arrowFunctions.publicArrowFunctions, ...arrowFunctions.privateArrowFunctions];
      //console.log("Class name: " + oneClass.name);
      //console.log(methods);
      let methodsInFile = getMethods(oneClass.lines, methods, arrowMethods);
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
  let linesWithoutCommentsInFiles = cpInfos.linesWithoutCommentsInFiles;
  //console.log(classesInFiles);
  let ccInfos = calculateCC(linesWithoutCommentsInFiles, fileNames)
  let ccs = ccInfos.map(ccInfo => ccInfo.cc);
  cc = ccs.reduce((total, current) => {
    return total + current
  }, 0)/ccs.length;
  cp = cpInfos.cp
  return {
    cc: cc.toFixed(2),
    sloc: sloc,
    cp: cp,
  }  
}

const getParents = function (firstLine, className) {
  let parents = [];
  if(firstLine.split(className)[1].trim().startsWith("extends")){
    let splitByComma = firstLine
              .split('extends')[1]
              .replace(/\s/g,'')
              .replace('{','')
              .split(',');
    for (let index = 0; index < splitByComma.length; index++) {
      const parent = splitByComma[index];
      if(parent.endsWith('>')){
        let splited = parent.split('<');
        //parents.push(splited[0]);
        parents.push(splited[1].replace('>', ''));
        continue;
      }
      parents.push(parent);
    }
    return parents;
  }
  else{
    return [];
  }
}

const getChildParentMap = function (classesInFiles) {
  let childParentMap = {};
  for (let index = 0; index < classesInFiles.length; index++) {
    const classes = classesInFiles[index].classes;
    for (let j = 0; j < classes.length; j++) {
      const oneClass = classes[j];
      let parents = getParents(oneClass.lines[0], oneClass.name);
      childParentMap[oneClass.name] = parents;
    }
  }
  return childParentMap;
}

const getNumberOfClasses = function(classesInFiles){
  let totalNumberOfClass = 0;
  for (let index = 0; index < classesInFiles.length; index++) {
    const numberOfClasses = classesInFiles[index].classes.length;
    totalNumberOfClass += numberOfClasses;
  }
  return totalNumberOfClass;
}

const calculateMOODMetrics =function(dartFiles){
  let mhf, ahf, mif, aif, pof, cof;
  let linesInFiles = getLinesInFiles(dartFiles);
  sloc = calculateSLOC(linesInFiles);
  let cpInfos = calculateCP(linesInFiles, sloc);
  let fileNames = dartFiles.map(file => file.name);

  let linesWithoutCommentsInFiles = cpInfos.linesWithoutCommentsInFiles;
  let classesInFiles = getClassesFromAllFile(linesWithoutCommentsInFiles, fileNames);

  // for (let index = 0; index < classesInFiles.length; index++) {
  //   const classes = classesInFiles[index].classes;
  //   console.log("File Name: " + fileNames[index]);    
  //   for (let j = 0; j < classes.length; j++) {
  //     const oneClass = classes[j];
  //     console.log("Class name: " + oneClass.name);
  //     let linesInClass = oneClass.lines;
  //     let arrowFunctions = checkArrowFunctions(linesInClass);
  //     console.log(arrowFunctions);
  //   }
  // }
  ahf = calculateAHF(linesWithoutCommentsInFiles);
  mhf = calculateMHF(linesWithoutCommentsInFiles, fileNames); 
  return {ahf: ahf, mhf: mhf}
}
const calculateCKMetrics = function(dartFiles){
  let wmc, dit, noc, cbo, rfc, lcom;

  let linesInFiles = getLinesInFiles(dartFiles);
  sloc = calculateSLOC(linesInFiles);
  let cpInfos = calculateCP(linesInFiles, sloc);
  let fileNames = dartFiles.map(file => file.name);
  let linesWithoutCommentsInFiles = cpInfos.linesWithoutCommentsInFiles;
  //console.log(classesInFiles);
  let classesInFiles = getClassesFromAllFile(linesWithoutCommentsInFiles, fileNames);
  wmc = calculateWMC(linesWithoutCommentsInFiles, fileNames);
  let childParentMap = getChildParentMap(classesInFiles);
  console.log("Child Parent Map: ");
  console.log(childParentMap);
  dit = calculateDIT(childParentMap);
  noc = calculateNOC(childParentMap);
  return {wmc: wmc, dit: dit, noc: noc};
}

module.exports = {
  calculateTraditionalMetrics: calculateTraditionalMetrics,
  calculateMOODMetrics: calculateMOODMetrics,
  calculateCKMetrics: calculateCKMetrics
}