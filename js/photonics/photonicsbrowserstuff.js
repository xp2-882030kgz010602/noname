var inputbox=document.getElementById("input");
var consolebox=document.getElementById("console");
var outputbox=document.getElementById("output");
var pbox=document.getElementById("p");
var wbox=document.getElementById("w");
var B2cbox=document.querySelector('input[value="B2c"]');
var B2kbox=document.querySelector('input[value="B2k"]');
var B2nbox=document.querySelector('input[value="B2n"]');
var B3cbox=document.querySelector('input[value="B3c"]');
var B3ibox=document.querySelector('input[value="B3i"]');
var B3nbox=document.querySelector('input[value="B3n"]');
var B3qbox=document.querySelector('input[value="B3q"]');
var B3rbox=document.querySelector('input[value="B3r"]');
var B3ybox=document.querySelector('input[value="B3y"]');
var B4cbox=document.querySelector('input[value="B4c"]');
var B4ibox=document.querySelector('input[value="B4i"]');
var B4nbox=document.querySelector('input[value="B4n"]');
var B4tbox=document.querySelector('input[value="B4t"]');
var B4ybox=document.querySelector('input[value="B4y"]');
var B4zbox=document.querySelector('input[value="B4z"]');
var B5ebox=document.querySelector('input[value="B5e"]');
var B5rbox=document.querySelector('input[value="B5r"]');
var B6ibox=document.querySelector('input[value="B6i"]');
var boxes=[B2cbox,B2kbox,B2nbox,B3cbox,B3ibox,B3nbox,B3qbox,B3rbox,B3ybox,B4cbox,B4ibox,B4nbox,B4tbox,B4ybox,B4zbox,B5ebox,B5rbox,B6ibox];
for(var i=0;i<18;i++){
  boxes[i].addEventListener("change",()=>{
    var inputtext=inputbox.value.split("\r").join("").split("\n");
    var inputrule=[];
    for(var j=0;j<18;j++){
      inputrule.push(boxes[j].checked*1);
    }
    inputtext[2]=inputrule.join("");
    inputbox.value=inputtext.join("\n");
  });
};
inputbox.addEventListener("input",()=>{
  var inputtext=inputbox.value.split("\r").join("").split("\n");
  pbox.value=inputtext[0];
  var inputw=inputtext[1];
  wbox.value=inputw;
  inputbox.cols=Math.max(18,inputw*1);
  inputbox.rows=Math.max(4,inputtext.length);
  var inputrule=inputtext[2].split("").map(x=>x*1);
  for(var i=0;i<18;i++){
    boxes[i].checked=inputrule[i];
  }
});
pbox.addEventListener("input",()=>{
  var inputtext=inputbox.value.split("\r").join("").split("\n");
  inputtext[0]=pbox.value;
  inputbox.value=inputtext.join("\n");
});
wbox.addEventListener("input",()=>{
  var inputtext=inputbox.value.split("\r").join("").split("\n");
  var inputw=wbox.value;
  inputtext[1]=inputw;
  inputbox.value=inputtext.join("\n");
  inputbox.cols=Math.max(18,inputw*1);
});
var loadbutton=document.getElementById("load");
loadbutton.addEventListener("click",function(event){
  event.preventDefault();
  loadinput(inputbox.value);
});
var upload=document.getElementById("upload");
var uploadbutton=document.getElementById("uploadbutton");
uploadbutton.addEventListener("click",function(event){
  event.preventDefault();
  upload.click();
});
var download=function(filename,txt){//https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
  var element=document.createElement("a");
  element.setAttribute("href","data:text/plain;charset=utf-8,"+encodeURIComponent(txt));
  element.setAttribute("download",filename);
  element.style.display="none";
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
};
var downloadtxtbutton=document.getElementById("downloadtxt");
downloadtxtbutton.addEventListener("click",function(event){
  event.preventDefault();
  download("input-"+Date.now()+".txt",inputbox.value);
});
var downloadjsonbutton=document.getElementById("downloadjson");
downloadjsonbutton.addEventListener("click",function(event){
  event.preventDefault();
  download("backup-"+Date.now()+".json",createbackup());//Defined in photonics.js
});
upload.addEventListener("change",function(){
  var file=this.files;
  file[0].text().then(data=>{
    loadinput(data);//Defined in photonics.js
  });
});
var clearbutton=document.getElementById("clear");
clearbutton.addEventListener("click",function(event){
  event.preventDefault();
  consolebox.value="";
  consolebox.cols=22;
});
var paused=true;
var pausebutton=document.getElementById("search");
pausebutton.addEventListener("click",function(event){
  event.preventDefault();
  paused=!paused;
  if(paused){
    pausebutton.text="Search";
  }else{
    pausebutton.text="Pause";
    t0=Date.now();//Defined in photonics.js
    statusreport();//Defined in photonics.js
    searchwrapper();//Defined in photonics.js
  }
});
