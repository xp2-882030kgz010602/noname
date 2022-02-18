//See definitions.txt for notes and definitions
var isnode;
try{
  process;
  isnode=true;
}catch{
  isnode=false;//Then we are in a browser
}
var maxlength=function(str){
  var l=0;
  str=str.split("\r").join("").split("\n");
  for(var i=0;i<str.length;i++){
    l=Math.max(l,str[i].length);
  }
  return l;
};
var addtoconsole=function(str){
  if(isnode){
    console.log(str);
  }else{
    consolebox.value+=str+"\n";//console.log adds \n automatically, but adding it to a box does not. consolebox is defined in photonicsbrowserstuff.js.
    consolebox.cols=Math.max(consolebox.cols,maxlength(str));
  }
};
var addtooutput=function(str){
  if(isnode){
    console.log(str);
  }else{
    outputbox.value+=str+"\n";//Same as above
    outputbox.cols=Math.max(outputbox.cols,maxlength(str));
  }
};
var r2p=function(p0,r){
  var r0=r.slice();
  var panel=[r0];
  for(var i=0;i<p;i++){
    var ri=p0[i];
    if(B2c&&((ri[0]&&r[0])||(ri[w1]&&r[w1]))){//Expanded out of width
      return false;
    }
    r=iterate(ri,r);//Step
    panel.push(r);
  }
  if(!requal(r,r0)){
    return false;
  }
  panel.pop();
  return panel;
};
var fs;
var iterate;//This doesn't wipe anything
var requal;
var setw;
var setrule;
var txtrule;
if(isnode){
  fs=require("fs");
  var stripe=require("./stripe.js");
  iterate=stripe.iterate;
  requal=stripe.requal;
  setw=stripe.setw;
  setrule=stripe.setrule;
}
var p;//Default settings for browser
var w;
var rule;
var tree;
var w1;
var B2c;
var panels;//This is for quicker access.
var txtifyrule=function(){
  if(isnode){
    txtrule=stripe.rule2txt(rule);
  }else{
    txtrule=rule2txt(rule);
  }
};
var createbackup=function(){
  return JSON.stringify({p:p,w:w,rule:rule,tree:tree,panels:panels});
};
var iterations=0;
var loadinput=function(input){
  iterations=0;
  try{//Try loading it as a JSON backup
    input=JSON.parse(input);
    p=input.p;
    w=input.w;
    rule=input.rule;
    tree=input.tree;
    panels=input.panels;
    setw(w);
    setrule(rule);
    if(!isnode){
      inputbox.value=p+"\n"+w+"\n"+rule.slice(0,18).join("");
      inputbox.dispatchEvent(new Event("input"));
    }
  }catch{
    if(!isnode){
      inputbox.value=input;
      inputbox.dispatchEvent(new Event("input"));
    }
    input=input.split("\r").join("").split("\n");
    if(input[input.length-1]===""){
      input.pop();
    }
    p=1*input[0];
    w=1*input[1];
    rule=input[2].split("").map(x=>1*x).concat([0,1]);//Convert strings to numbers, then add the 0 and 1 at the end
    setw(w);
    setrule(rule);
    var p0=[];
    var ri=3;
    for(var i=0;i<p;i++){
      p0.push(input[ri].split("").map(x=>1*(x!==".")));//Dots are dead, everything else is alive
      ri+=1;
    }
    panels=[p0];
    while(ri<input.length){
      panels.push(input[ri].split("").map(x=>1*(x!==".")));
      ri+=1;
    }
    for(var i=1;i<panels.length;i++){//.map doesn't work since we need the previous entry each time
      var panel=r2p(panels[i-1],panels[i]);
      if(!panel){
        addtoconsole("Invalid row");
        return;
      }else{
        panels[i]=panel;
      }
    }
    tree=panels.map(x=>[x]);//Build the tree
  }
  w2=w-1;
  B2c=rule[0];
  txtifyrule();
  if(!isnode){
    addtoconsole("All good!");
  }
};
var backupfile="./backup.json";
if(isnode){///process.argv
  var inputfile="";
  for(var i=2;i<process.argv.length;i++){
    var arg=process.argv[i];
    if(arg.substring(0,6)==="input="){
      inputfile=arg.substring(6);
    }else if(arg.substring(0,7)==="backup="){
      backupfile=arg.substring(7);
    }
  }
  if(inputfile===""){
    console.log("Proper usage: node photonics.js input=<filename>");
    console.log("You can also specify a backup location with backup=<filename>. (default is ./backup.json)")
    process.exit();
  }
  var input=fs.readFileSync(inputfile,"utf-8");
  loadinput(input);
}
var pequal=function(p0,p1){//Test panel equality up to rotation.
  rotation:
  for(var di=0;di<p;di++){
    for(var i=0;i<p;i++){
      var idi=(i+di)%p;
      if(!requal(p0[i],p1[idi])){//No, it's not equal
        continue rotation;
      }
    }
    return true;//Every row has to be equal for us to get here
  }
  return false;//No rotation matches
};
var inlist=function(p,plist){//Test if a panel is in a list of panels, up to rotation
  for(var i=0;i<plist.length;i++){
    if(pequal(p,plist[i])){
      return true;
    }
  }
  return false;
};
var isblank=function(panel){
  for(var i=0;i<p;i++){
    for(var j=0;j<w;j++){
      if(panel[i][j]){
        return false;
      }
    }
  }
  return true;
};
var printpanels=function(panels){
  var height=panels.length;
  var h1=height-1;
  addtooutput("x="+w+",y="+(2*height-1)+",rule="+txtrule);
  for(var i=0;i<height;i++){
    var line="";
    line+=panels[i][0].map(x=>".o"[x]).join("");
    if(i<h1){
      line+="$$";
    }else{
      line+="!";
    }
    addtooutput(line);
  }
};
var search=function(){
  var item=tree.pop();
  var panel=panels.pop();
  var backtrack=!item.length;
  while(!item.length&&tree.length){//Pop until we reach a branch with stuff on it
    item=tree.pop();
    panel=panels.pop();
  }
  var l=tree.length;
  if(!l&&!item.length){//Nothing left to pop, and our current item is blank, we're done
    return true;
  }
  tree.push(item);//Put this back
  panels.push(panel);//Now we have the correct panel to extend from
  if(backtrack){//This means we fall back to the next partial on the list
    item.pop();
    var l1=item.length;
    if(l1){
      panels.pop();
      panel=item[l1-1];
      panels.push(panel);
    }else{
      return;//The item will be blank, so it will be backtracked the next time around
    }
  }
  var solutions=[];
  var row=[];
  for(var i=0;i<w;i++){
    row.push(1);//We move downwards.
  }
  while(true){
    var p1=r2p(panel,row);
    if(!p1||inlist(p1,panels)||inlist(p1,solutions)){//Skip invalid rows and duplicate solutions
      continue;
    }
    solutions.push(p1);
    var i=0;//Step downwards from all 1s
    while(!row[i]&&i<w){
      row[i]=1;//Regroup
      i+=1;
    }
    if(i===w){//We're done
      break;
    }
    row[i]=0;
  }
  var last=solutions.pop();
  if(last){//If there are any solutions at all
    if(isblank(last)){
      addtoconsole("Spaceship found");
      if(!isnode){
        paused=true;//Defined in photonicsbrowserstuff.js
        pausebutton.text="Search";//Defined in photonicsbrowserstuff.js
        outputbox.value="";//Defined in photonicsbrowserstuff.js
      }
      printpanels(panels);
    }else{
      solutions.push(last);
    }
  }
  tree.push(solutions);
  if(solutions.length){
    panels.push(solutions[solutions.length-1]);
  }else{
    panels.push(null);//If solutions is blank, this will be backtracked anyways, so we can get away with just adding a null.
  }
};
var printmemory=function(){
  if(isnode){
    addtoconsole("Memory usage: "+process.memoryUsage().rss/1000000+" MB");
  }else{
    if(performance){
      addtoconsole("Memory usage: "+performance.memory.totalJSHeapSize/1000000+" MB");
    }
  }
}
var statusreport=function(){
  var size=0;
  for(var i=0;i<tree.length;i++){
    size+=tree[i].length;
  }
  addtoconsole("Iterations completed: "+iterations);
  addtoconsole("Tree size: "+size);
  printmemory();
}
var t0=Date.now();
var backupinterval=30000;
var searchwrappernode=function(){
  while(!search()){
    iterations+=1;
    var t1=Date.now();
    if(t1>t0+backupinterval){
      statusreport();
      fs.writeFileSync(backupfile,createbackup());
      t0=t1;
    }
  }
  statusreport();
  addtoconsole("No more objects");
};
var browsertimer=Date.now();
var searchwrapperbrowser=function(){
  while(!search()){
    iterations+=1;
    var t1=Date.now();
    if(t1>t0+backupinterval){
      statusreport();
      t0=t1;
    }
    if(paused){//Defined in photonicsbrowserstuff.js
      return;
    }
    if(t1>browsertimer+100){//"Pause" every 100ms to stop the tab from freezing
      browsertimer=t1;
      setTimeout(()=>{searchwrapperbrowser()},0);
      return;
    }
  }
  statusreport();
  addtoconsole("No more objects");
  paused=true;
  pausebutton.text="Search";
};
var searchwrapper=isnode?searchwrappernode:searchwrapperbrowser;
if(isnode){
  statusreport();
  searchwrapper();
}
