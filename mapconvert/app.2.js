
const fs = require('fs');
var MapItem = require('./model/index.js').MapItem;


var aaaStream = fs.createWriteStream('./aaaz');

fs.readFile('aaa', {encoding:'utf-8'},function(err, data) {
    
    //var itemlist = data.split('\r');
    
    var aaa = data;

    fs.readFile('mapset.txt', {encoding:'utf-8'},function(err, data1) {
        
        var itemlist = data1.split('\r');
        for(var x in itemlist){
            var rowarray = itemlist[x].replace('\r','').replace('\n','').split(',');
            aaa = aaa.replace(rowarray[0].trim(), rowarray[1] + ',' + rowarray[2]);
        }
        
        aaaStream.write(aaa);
        
    });

    
   // console.log(itemlist.length);
    
});



// fs.readFile('data.txt', {encoding:'utf-8'},function(err, data) {
    
//     var itemlist = data.split('\r');
    
//     for (var x in object) {
//         if (object.hasOwnProperty(x)) {
//             var element = object[x];
            
//         }
//     }
    
//     console.log(itemlist.length);
    
// });

