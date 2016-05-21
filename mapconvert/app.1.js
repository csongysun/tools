
const fs = require('fs');
var MapItem = require('./model/index.js').MapItem;


fs.readFile('data.txt', {encoding:'utf-8'},function(err, data) {
    
    var itemlist = data.split('\r');
    
    for (var x in itemlist) {
        var item = itemlist[x];
       // console.log(x);
        item = item.substring(2, item.length-2)
        var strarry = item.split(',');
        // if(strarry.length !== 7 ) {
        //     console.log(item); 
        //     console.log(strarry);   
        // }
       // console.log(x + '::::' + strarry.length);
       var pics = [];
       pics.push(strarry[3].replace(/\'/g,''));
        var mapitem = new MapItem({
            _id : parseInt(strarry[0]),
            classifyid : parseInt(strarry[1]),
            discription : strarry[2].replace(/\'/g,''),
            pic : pics,
            campusid : parseInt(strarry[6])
        });
        
        try { 
          //  console.log(mapitem._id)
		    mapitem.save(function (err) {
            console.log(err);
        });
	    } catch (e) {
		    console.log(e);
	    }
        
        
       // console.log(mapitem);
       
    }
    
    //console.log(itemlist.length);
    
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

