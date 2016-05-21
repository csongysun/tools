
const fs = require('fs');
var MapItem = require('./model/index.js').MapItem;


//var aaaStream = fs.createWriteStream('./aaaz');

fs.readFile('aaaz', {encoding:'utf-8'}, function(err, data) {
   
   var itemlist = data.split('\n');
   
   for(var x in itemlist){
     //  var rowarray = itemlist[x].split(',');
       
       
       (function (rowarray) {
           
           MapItem.findById(parseInt(rowarray[0])).then(function (mapitem) {
               mapitem.title = rowarray[1].replace(/\"/g,'');
           mapitem.posx = parseFloat(rowarray[2]);
           mapitem.posy = parseFloat(rowarray[3]);
           mapitem.save();
           });

       })(itemlist[x].split(','));
       
       
       
    //   var mapitem = yield MapItem.findById(parseInt(rowarray[0])).exec();
       
       
       
    //    MapItem.findById(parseInt(rowarray[0]),function(err, mapitem) {
    //        if(err) console.log(e);
    //        mapitem.title = rowarray[1].replace(/\"/g,'');
    //        mapitem.posx = parseFloat(rowarray[2]);
    //        mapitem.posy = parseFloat(rowarray[3]);
    //        console.log(rowarray[1]);
    //       // mapitem.save();
    //    })
   }
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

