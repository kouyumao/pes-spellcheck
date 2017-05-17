const SpellChecker = require('spellchecker');
const program = require('../package.json');
const fs = require('fs');
const colors = require('colors');
const commander = require('commander');
require('console.table');


commander.description('Spell Checker for KouYuMao PES').usage('--input <dir ...>').version(program.version).option('-i, --input <dir>', '待检测的目录').option('-w, --whitelist <file>', '单词白名单').parse(process.argv);


var flist = function(dir) {
    return [
        dir+'/warm up.txt',
        dir+'/speak up.md',
        dir+'/sum up.md'
    ];
}
var whiteList = [];

var loadWhiteList = function(file='white-list.txt') {
    if(!fs.existsSync(file)){
        return;
    }
    var content = fs.readFileSync(file, {encoding: "utf-8", flag: 'r'});
    var words = content.split("\n");
    words.forEach(function(word) {
        whiteList.push(word.trim());
    });
    return;
    
/*
    words.forEach(function(word) {
        SpellChecker.add(word);
    });
*/
}

var check_file = function(file) {
    var content = fs.readFileSync(file, {encoding: "utf-8", flag: 'r'});
    var lines = content.split("\n");
    var resultWords = [];
    lines.forEach(function(line){
        line = line.trim();
        var words = line.split(' ');
        
        words.forEach(function(word){
            word = word.replace(/([*?.,:!();]+)$/g, '').replace(/^([*?.,:!();]+)/g, '').replace(/’/g, "'");
            if(!word) {
                return;
            }
            if(!/[a-zA-Z]/.test(word)) {
                return;
            }
            if(whiteList.indexOf(word) > -1) {
                return;
            }
            if(SpellChecker.isMisspelled(word)) {
                resultWords.push({
                    Word: word.underline.red,
                    Suggest: SpellChecker.getCorrectionsForMisspelling(word).slice(0, 3).join(',').green,
                    File: file,
                });
            }
        });
    });
    return resultWords;
}

var whitelist = commander.whitelist || 'white-list.txt';
loadWhiteList(whitelist);

var path = commander.input || '.';

var tables = [];
fs.readdirSync(path).forEach(dir => {
  if(/(\d+)_(\d+)(.+)/.test(dir)) {
      var files = flist(dir);
      files.forEach(function(file){
          var words = check_file(path+'/'+file);
          if(words) {
              words.forEach(function(word){
                tables.push(word);
              });
          }
      })
  }
});
console.table(tables);
