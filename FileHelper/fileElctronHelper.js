const { readdirSync } = require('fs')

const walkSync = function(dir, filelist) {
    var fs = fs || require('fs'),
        files = fs.readdirSync(dir);
    filelist = filelist || [];
    files.forEach(function(file) {
      if (fs.statSync(dir + file).isDirectory()) {
        filelist = walkSync(dir + file + '/', filelist);
        filelist.push({name: file,isDirectory: true});  
      }
      else {
        filelist.push({name: file,isDirectory: false});
      }
    });
    return filelist;
  };
//.filter(dirent => dirent.isDirectory())

checkFlutterPrj = function (folderPath) {
  let allFilesAndFolders = walkSync(folderPath+"/");
  console.log("All files: ");
  console.log(allFilesAndFolders);
  return true;
}

module.exports = {
  checkFlutterPrj: checkFlutterPrj
}