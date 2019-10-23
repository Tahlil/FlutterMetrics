const { readdirSync } = require('fs')

const walkSync = function(dir, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = walkSync(dir + file + '/', filelist);
        filelist.push({name: file,isDirectory: true, path: dir + file});  
      }
      else {
        filelist.push({name: file,isDirectory: false, path: dir + file});
      }
    });
    return filelist;
  };
//.filter(dirent => dirent.isDirectory())

checkFlutterPrj = function (folderPath) {
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
  
  return true;
}

module.exports = {
  checkFlutterPrj: checkFlutterPrj
}