var w;
var rule;
var transitionstable;
var rawtable=[18,18,18,19,18,0,19,4,18,0,1,5,2,3,6,11,18,1,18,7,1,8,7,12,19,5,7,10,6,13,14,16,18,2,1,6,0,3,5,11,0,3,8,13,3,9,13,15,19,6,7,14,5,13,10,16,4,11,12,16,11,15,16,17];
var iterate=function(){};
var setw=function(win){//Should be interpreted as "w in"
  w=win;
  if(w>1){
    if(w-2){
      iterate=iterate3;
    }else{
      iterate=iterate2;
    }
  }else{
    if(w){
      iterate=iterate1;
    }else{
      iterate=iterate0;
    }
  }
};
var setrule=function(rin){//But not Len
  rule=rin;
  transitionstable=rawtable.slice();
  //Now set up the table
  for(var i=0;i<64;i++){
    transitionstable[i]=rule[transitionstable[i]];
  }
}
//B0  B1c B1e B2a B1c B2c B2a B3i
//B1c B2c B2k B3n B2n B3c B3q B4n
//B1e B2k B2i B3r B2k B3y B3r B4t
//B2a B3n B3r B4i B3q B4y B4z B5r
//B1c B2n B2k B3q B2c B3c B3n B4n
//B2c B3c B3y B4y B3c B4c B4y B5e
//B2a B3q B3r B4z B3n B4y B4i B5r
//B3i B4n B4t B5r B4n B5e B5r B6i
//Transitions in order of indices
//B2c B2k B2n B3c B3i B3n B3q B3r
//B3y B4c B4i B4n B4t B4y B4z B5e
//B5r B6i 0   1
var updaterow=function(nextrow,n,inv){
  nextrow.push(transitionstable[n]);//Look up the transition and then the transition state.
  inv?inv[rawtable[n]]=1:null;//This is a clever way to update with an operator instead of an if loop
};
var iterate3=function(r0,r1,inv){//If inv is present, it tracks the transitions involved. This function requires that w>=3.
  //Checking for B2c going out of bounds is on you, not me.
  var nextrow=[];
  var n=(r0[0]<<4)|(r0[1]<<3)|(r1[0]<<1)|r1[1];//JS knows enough to not convert back to a double unless you do something like adding 0.1. This contains the first four bits in the form of 0??0??.
  updaterow(nextrow,n,inv);
  n<<=1;//Move the bits left to make it ??0??0. (We can skip the n&=27 for the first iteration of the loop)
  n|=(r0[2]<<3)|r1[2];//Then add the new bits on the right.
  updaterow(nextrow,n,inv);
  for(var i=3;i<w;i++){//This is the bulk of the loop.
    n&=27;//Clear the old bits that we won't be looking at anymore.
    n<<=1;
    n|=(r0[i]<<3)|r1[i];
    updaterow(nextrow,n,inv);
  }//For the last iteration, we can skip adding the new bits on the right, since they'll both be 0.
  n&=27;
  n<<=1;
  updaterow(nextrow,n,inv);
  return nextrow;
};
var iterate2=function(r0,r1,inv){
  var nextrow=[];
  var n=(r0[0]<<4)|(r0[1]<<3)|(r1[0]<<1)|r1[1];
  updaterow(nextrow,n,inv);
  n<<=1;
  updaterow(nextrow,n,inv);//Nothing to add
  return nextrow;
};
var iterate1=function(r0,r1,inv){
  inv?inv[18]=1:null;//18 is unconditional death
  return [0];//Anything else at w1 requires B0, B1e, or B2i, none of which are allowed.
};
var iterate0=function(r0,r1,inv){
  return [];//Um, there's nothing here.
};
var requal=function(r0,r1){//Tests if two rows are equal
  for(var i=0;i<w;i++){
    if(r0[i]!==r1[i]){
      return false;
    }
  }
  return true;
};
var rule2txt=function(rule){
  //Why is this so long
  var r="B2a";
  r=rule[0]?r+"c":r;
  r=rule[1]?r+"k":r;
  r=rule[2]?r+"n":r;
  var b3c=rule[3];
  var b3i=rule[4];
  var b3n=rule[5];
  var b3q=rule[6];
  var b3r=rule[7];
  var b3y=rule[8];
  if(b3c||b3i||b3n||b3q||b3r||b3y){
    r+="3";
    r=b3c?r+"c":r;
    r=b3i?r+"i":r;
    r=b3n?r+"n":r;
    r=b3q?r+"q":r;
    r=b3r?r+"r":r;
    r=b3y?r+"y":r;
  }
  var b4c=rule[9];
  var b4i=rule[10];
  var b4n=rule[11];
  var b4t=rule[12];
  var b4y=rule[13];
  var b4z=rule[14];
  if(b4c||b4i||b4n||b4t||b4y||b4z){
    r+="4";
    r=b4c?r+"c":r;
    r=b4i?r+"i":r;
    r=b4n?r+"n":r;
    r=b4t?r+"t":r;
    r=b4y?r+"y":r;
    r=b4z?r+"z":r;
  }
  var b5e=rule[15];
  var b5r=rule[16];
  if(b5e||b5r){
    r+="5";
    r=b5e?r+"e":r;
    r=b5r?r+"r":r;
  }
  r=rule[17]?r+"6i":r;
  return r;
};
try{
  exports.iterate=(r0,r1,inv)=>iterate(r0,r1,inv);
  exports.requal=(r0,r1)=>requal(r0,r1);
  exports.setw=(win)=>setw(win);
  exports.setrule=(rin)=>setrule(rin);
  exports.rule2txt=(rule)=>rule2txt(rule);
}catch{
  //We are in a browser. In that case, import via <script src="./stripe.js"></script>.
}
