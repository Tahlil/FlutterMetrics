const { readdirSync, readFileSync } = require('fs')

//.map(chunk => chunk.replace(/(?!\r)\n/g, '\n\r'))
const getAllLines = function (filePath) { 
  //console.log("filePath");
  //console.log(filePath);
  return readFileSync(filePath, 'utf-8').split('\n').map(chunk => chunk.replace('\r', '')).filter(line => {
    //console.log("line: " + line);
    return line !== "" ;
  });
}

const getDirectories = source =>
  readdirSync(source, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => source+"\\"+dirent.name)

const walkSync = function(dir, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = walkSync(dir + file + '\\', filelist);
        filelist.push({name: file,isDirectory: true, path: dir + file});  
      }
      else {
        filelist.push({name: file,isDirectory: false, path: dir + file});
      }
    });
    return filelist;
  };
//.filter(dirent => dirent.isDirectory())

const getAllDartFiles = function (flutterProjectPath) {
  let filesInLib = walkSync(flutterProjectPath), dartFiles = [];
  for (let index = 0; index < filesInLib.length; index++) {
    const file = filesInLib[index];
    if(file.name.endsWith('.dart')){
      dartFiles.push( {name: file.name,path: file.path});
    }
  }
  return dartFiles;
}

const checkFlutterPrj = function (folderPath) {
  let allFilesAndFolders = walkSync(folderPath+"/");
  console.log("All files: ");
  //console.log(allFilesAndFolders);
  let hasPubspecFile=false, hasLibFolder=false, pathToPubspec, pathToLib;
  for (let index = 0; index < allFilesAndFolders.length; index++) {
    const file = allFilesAndFolders[index];
    if(file.name === "lib" && file.isDirectory){    
      hasLibFolder = true;
      pathToLib = file.path;
    }
    else if(file.name === "pubspec.yaml" && !file.isDirectory){
      hasPubspecFile = true;
      pathToPubspec = file.path;
    }
    if(hasLibFolder && hasPubspecFile) break;
  }
  console.log("Pubspec: " + pathToPubspec);
  console.log("lib: " + pathToLib) ;
  let isFlutterProject = hasLibFolder && hasPubspecFile, dartFiles = [];
  if (isFlutterProject) {
    //pathToLib[pathToLib.length-1] = "\\";
    console.log(pathToLib);
    pathToLib = pathToLib.replace("/", "\\");
    console.log(pathToLib);
    dartFiles = getAllDartFiles(pathToLib+"\\");
  }
  return {isFlutterProject: isFlutterProject,  pathToLib: pathToLib, pathToPubspec: pathToPubspec, dartFiles: dartFiles};
}

module.exports = {
  checkFlutterPrj: checkFlutterPrj,
  getDirectories: getDirectories, 
  getAllLines: getAllLines
}