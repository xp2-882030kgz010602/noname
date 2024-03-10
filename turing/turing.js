//This is specifically for 3-state 2-symbol machines but it should be adaptable
//var known=[];
var checkequal=function(rule,rulespace){
  for(var i=0;i<6;i++){
    var rulespacetransition=rulespace[i];
    if(!rulespacetransition.length){//This is a wildcard; we don't care
      continue;
    }
    var ruletransition=rule[i];
    for(j=0;j<3;j++){
      if(rulespacetransition[j]!==ruletransition[j]){
        return 0;
      }
    }
  }
  return 1;
};
exports.checkequal=(a,b)=>checkequal(a,b);
var int2rule=function(int){
  var rule=[];
  for(var i=0;i<6;i++){
    var digit=int%12;//Each base12 digit is a rule
    int-=digit;
    int/=12;
    var direction=((digit&1)<<1)-1;//Representing direction with -1 and +1 lets us just add the direction to the head position
    var newsymbol=(digit&2)>>1;
    var newstate=digit>>2;
    rule.push([newstate,newsymbol,direction]);
  }
  rule.reverse();
  return rule;
};
exports.int2rule=(a)=>int2rule(a);
var rule2int=function(rule){
  var int=0;
  for(var i=0;i<6;i++){
    var transition=rule[i];
    var direction=transition[2];
    var newsymbol=transition[1];
    var newstate=transition[0];
    int*=3;
    int+=newstate;
    int<<=1;
    int+=newsymbol;
    int<<=1;
    int+=(direction+1)>>1;
  }
  return int;
}
exports.rule2int=(a)=>rule2int(a);
var checkblankdir=function(tape,i,di){//Helper function for checkinteresting
  while(i>=0&&i<tape.length){//Checks if the tape is blank starting from a starting index and a given direction
    if(tape[i]){
      return 0;
    }
    i+=di;
  }
  return 1;
};
var checkequalzone=function(tape0,tape1,i0,i1,left,right){//Helper function for checkinteresting
  for(var di=left;di<=right;di++){//Checks if two regions of two tapes are equal; said regions are [i0+left,i0+right] on tape0 and [i1+left,i1+right] on tape1
    if(tape0[i0+di]!==tape1[i1+di]){
      return 0;
    }
  }
  return 1;
};
var checkvelocity=function(tapehistory,headhistory,statehistory,numerator,denominator,direction){
  var N=tapehistory.length;
  var temp=N-1;
  var endtape=tapehistory[temp];
  var endhead=headhistory[temp];
  var endstate=statehistory[temp];
  temp-=denominator;
  var starttape=tapehistory[temp];
  var starthead=headhistory[temp];
  var startstate=statehistory[temp];
  if(endstate!==startstate){//If the head is in the wrong state, then it obviously fails
    return 0;
  };
  if(endhead!==starthead+numerator*direction){//If the head is in the wrong place, then it obviously fails
    return 0;
  }
  /*console.log("test"+denominator);
  console.log(starthead);
  console.log(endhead);*/
  //Example for c/3 "envelope":
  //  v
  // abc
  // ???
  //???
  //abc
  // ^
  //Example for c/7 "envelope":
  //    v
  // abcdefg
  // ab???fg
  // a?????g
  // ???????
  //???????
  //a?????g
  //ab???fg
  //abcdefg
  //   ^
  var width=(denominator-numerator)>>1;
  //console.log(direction);
  //Check that there are no rogue 1s in the direction we're testing the head
  //We don't need to check the same condition for endtape simply because the head can't get far enough to the right to write a rogue 1 while still returning to its final position
  if(!checkblankdir(starttape,starthead+(width+1)*direction,direction)){
    return 0;
  }
  return checkequalzone(starttape,endtape,starthead,endhead,-width,width);//If the head writes the same data within the width of the envelope then it'll do the same thing
};
var checkinteresting=function(tapehistory,headhistory,statehistory,int){
  var N=tapehistory.length;
  //Check 1: Blank tape rule
  //If the tape is blank at two occasions where the head is also in the same state, then the turing machine is just a spaceship, which is boring.
  var statecounter=[0,0,0];
  for(var i=0;i<N;i++){
    var tape=tapehistory[i];
    var sum=0;
    tape.map(x=>sum+=x);
    if(sum){//There's a 1 somewhere on the tape
      continue;
    }
    var state=statehistory[i];//It's blank
    statecounter[state]+=1;
    for(var j=0;j<3;j++){
      if(statecounter[j]>=2){
        return 0;
      }
    }
  }
  //Check 2: Repeating tape rule
  //If there are two different points in time where the tape, head, and state are equal, then the turing machine is just an oscillator, which is boring.
  var lasttape=tapehistory[N-1];
  var lasthead=headhistory[N-1];
  var laststate=statehistory[N-1];
  for(var i=N-3;i>=0;i-=2){//For parity reasons, we only need to check every other generation
    var tape=tapehistory[i];
    var head=headhistory[i];
    var state=statehistory[i];
    if(head!==lasthead||state!==laststate){//Might as well do the O(1) check before the O(n) check to improve average performance
      continue;
    }
    var tapesequal=1;
    for(var j=0;j<2*N+1;j++){
      if(tape[j]!==lasttape[j]){
        tapesequal=0;
        break;
      }
    }
    if(tapesequal){
      return 0;
    }
  }
  //Check 3: Threefold repetition rule
  //If the head moves in the same direction three times in a row through 0 symbols, and there are no 1 symbols in the direction that the head moved,
  //then the head will continue to move in that direction forever, which is boring. Intuitively, the tape can never influence the head,
  //and the head will never be able to reach a state that causes it to turn around.
  for(var z=0;z<1;z++){//The for loop exists so that I can break whenever necessary
    var a=headhistory[N-1];
    var b=headhistory[N-2];
    var c=headhistory[N-3];
    var d=headhistory[N-4];
    var direction=a-b;
    if(b-c!==direction||c-d!==direction){//Check threefold repetition
      break;
    }
    if(tapehistory[N-2][b]|tapehistory[N-3][c]|tapehistory[N-4][d]){//Check that said threefold repetition goes through zeroes only
      //console.log(int);
      break;
    }
    var tape=tapehistory[N-1];
    var canstop=0;
    for(var i=a;i>=0&&i<2*N+1;i+=direction){//Check that there are no 1 symbols where the head is/in the direction that the head is moving
      if(tape[i]){
        canstop=1;
        break;
      }
    }
    if(!canstop){
      return 0;
    }
  }
  //Check 4: More complicated movement rules
  //Consider these 4 steps where the tape looks like this.
  //0 and 1 are well, 0 and 1, but a, b, c, and d are variables.
  //v and ^ point to the positions where the head is at the first and last step respectively.
  //In addition, the head is in the same state at the first and last steps.
  //Finally, everything to the left of what's shown is also 0.
  //  v
  //0abc
  //0???
  //???
  //abc
  // ^
  //The result is that this turing machine will continue to print c forever while moving left at c/3. The head can only ever read cells marked with question marks, but we always end up with the same configuration shifted left, meaning that we have a loop. The only thing that could break it would be a rogue 1 somewhere to the left, but that was disallowed by one of our assumptions.
  //    v
  //000abc
  //000???
  //00???
  //00abc
  //00???
  //0???
  //0abc
  //0???
  //???
  //abc
  // ^
  //Lightspeed motion is caught by the third check
  //High-period mechanisms won't get caught simply because they won't print enough 1s for this check to recognize them as periodic
  //for(var denominator=3;denominator<20;denominator++){
  for(var denominator=3;denominator<100;denominator++){//100 is probably excessive but I might as well
    for(var numerator=2-(denominator&1);numerator<denominator;numerator+=2){//Only checking numerators with the same parity since turing machine head has parity too
      if(checkvelocity(tapehistory,headhistory,statehistory,numerator,denominator,-1)){//Check left
        //console.log(int+" failed check 4");
        return 0;
      }
      if(checkvelocity(tapehistory,headhistory,statehistory,numerator,denominator,+1)){//Check right
        //console.log(int+" failed check 4");
        return 0;
      }
    }
  }
  return 1;
};
exports.checkinteresting=(a,b,c,d)=>checkinteresting(a,b,c,d);