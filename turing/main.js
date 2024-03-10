//This is specifically for 3-state 2-symbol machines but it should be adaptable
var turing=require("./turing.js");
var rules=[];
for(var i=2985983;i>=0;i--){
  rules.push(turing.int2rule(i));
}
//rules=[turing.int2rule(84127)];
console.log(rules.length);
var step=function(){
  var symbol=tape[head];
  var index=(state<<1)+1-symbol;//Blame Wolfram Alpha
  var transition=rule[index];
  marked[index]=transition;
  var newstate=transition[0];
  var newsymbol=transition[1];
  var direction=transition[2];
  state=newstate;
  tape[head]=newsymbol;
  head+=direction;
};
var numinteresting=0;
while(rules.length){
  var rule=rules.pop();
  var marked=[[],[],[],[],[],[]];
  //var N=45;
  var N=1000;
  var tape=[];
  for(var i=0;i<2*N+1;i++){
    tape.push(0);
  }
  var head=N;
  var state=0;
  var tapehistory=[tape.slice()];
  var headhistory=[head];
  var statehistory=[state];
  for(var i=0;i<N;i++){
    step();
    tapehistory.push(tape.slice());
    headhistory.push(head);
    statehistory.push(state);
  }
  var int=turing.rule2int(rule);
  var interesting=turing.checkinteresting(tapehistory,headhistory,statehistory,int);
  if(interesting){
    console.log(JSON.stringify(marked));
    console.log("//https://www.wolframalpha.com/input?i=3%2C2+TM+rule+"+int);
  }
  numinteresting+=interesting;
  //Filter out every rule that falls into this rulespace
  var determined=0;
  marked.map(x=>determined+=x.length);
  if(determined<18){//If every transition is determined then the rulespace is one rule and we don't need to check
    var newrules=[];
    for(var i=0;i<rules.length;i++){
      var candidate=rules[i];
      if(!turing.checkequal(candidate,marked)){
        newrules.push(candidate);
      }
    }
    console.log("Filtered "+(rules.length+1)+"->"+newrules.length);
    rules=newrules;
    newrules=[];
  }
}
console.log(numinteresting);