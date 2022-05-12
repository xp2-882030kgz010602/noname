var resolve=function(item,input,fns,i,relevant){
  var type=typeof item;
  if(type==="number"){//This is a state
    return item;
  }
  var rule=fns[i];
  if(type==="string"){//This is a transition
    var state=rule.transitions[item];
    if(relevant!==undefined){//Log this if it's here
      relevant[item]=state;
    }
    return state;
  }
  //Ok, we're dealing with an indexed thing.
  var indextype=item[0];
  if(indextype===1){//Input index
    item=input[item[1]];
    return resolve(item,input,fns,i,relevant);
  }
  if(indextype===5){//Sum index
    item=rule.sums[item[1]];
    return resolve(item,input,fns,i,relevant);
  }
  if(indextype===7){//Function index
    item=item.slice();//Prevent this from sticking to the rule
    for(var j=2;j<item.length;j++){
      item[j]=resolve(item[j],input,fns,i,relevant);
    }
    return evalfn(item.slice(2),fns,item[1],relevant);
  }
};
var evalfn=function(input,fns,i,relevant){
  var rule=fns[i];
  //First layer
  var table=rule.weights;
  var sum=0;
  for(var j=0;j<input.length;j++){
    sum+=table[input[j]][j];
  }
  //Second layer
  var item=rule.sums[sum];
  return resolve(item,input,fns,i,relevant);//This also handles the third layer
};
var evolve=function(pattern,rule,relevant){
  var bkgd=pattern[0];
  var pat=pattern[1];
  var neighborhood=rule.neighborhood;
  var fns=rule.functions;
  var blank=[];
  for(var i=0;i<neighborhood.length;i++){//By assuming that unspecified cells are in the background state instead of simply being 0, we can run B0 stuff with ease.
    blank.push(bkgd);
  }
  var neighborhoods={};
  var aoe=[];
  pat.map(cell=>{//Let's build the neighborhoods.
    var x=cell[0];
    var y=cell[1];
    var s=cell[2];
    for(var i=0;i<neighborhood.length;i++){
      var dxy=neighborhood[i];
      var position=[x-dxy[0],y-dxy[1]];
      if(neighborhoods[position]===undefined){
        neighborhoods[position]=blank.slice();//By doing this, we account for the background not necessarily being 0.
        aoe.push(position);
      }
      neighborhoods[position][i]=s;
    }
  });
  bkgd=evalfn(blank,fns,0,relevant);//Now we need the background of the next generation.
  var nextgen=[];
  aoe.map(position=>{//Actually run the rule and see what cells we need to keep. Cells with states identical to the new background can be thrown away.
    var neighborhood=neighborhoods[position];
    var state=evalfn(neighborhood,fns,0,relevant);
    //console.log(position);
    //console.log(state);
    if(state!==bkgd){
      position.push(state);
      nextgen.push(position);
    }
  });
  return [bkgd,nextgen];
};
var print=function(pat){
  var states=".#o";
  var bkgd=states[pat[0]];
  pat=pat[1];
  var first=pat[0];
  var minx=first[0];
  var miny=first[1];
  pat.map(pos=>{
    var x=pos[0];
    var y=pos[1];
    minx=Math.min(x,minx);
    miny=Math.min(y,miny);
  });
  var centered=pat.map(pos=>[pos[0]-minx,pos[1]-miny,pos[2]]);
  first=centered[0];
  var maxx=first[0];
  var maxy=first[1];
  centered.map(pos=>{
    var x=pos[0];
    var y=pos[1];
    maxx=Math.max(x,maxx);
    maxy=Math.max(y,maxy);
  });
  var board=[];
  for(var i=0;i<=maxx;i++){
    var row=[];
    for(var j=0;j<=maxy;j++){
      row.push(bkgd);
    }
    board.push(row);
  }
  centered.map(pos=>board[pos[0]][pos[1]]=states[pos[2]]);
  board=board.map(x=>x.join(""));
  return board.join("\n");
};
try{
  exports.print=(pat)=>print(pat);
  exports.evolve=(pattern,rule,relevant)=>evolve(pattern,rule,relevant);
}catch{
  //We are in a browser. In that case, import via <script src="./cobalt.js"></script>,
}
