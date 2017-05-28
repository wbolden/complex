/*
 * Complex Math Grammar
 * ==========================
 *
 * Outputs an expression that can be evaluated in GLSL
 * Compile with 'use results cache' enabled to avoid duplicates
 */
 {
var funcount = 0;
var decls = '';
var iters = '';
var uniforms = {};
var functions = {};

function make_sum(expr, max='n') {
  var funcall = 'fun_'+funcount+'_sum(z,'+max+')';
  var funbody = 'complex fun_'+funcount+'_sum(complex z, complex _max_){\n';
    funbody += "complex _sum_ = zero;\n";
    funbody += "for(float rn = 1.0; rn < 9999.0; rn++) {\n";
    funbody += "if(rn > length(_max_)) break;\n";
    funbody += "complex n = complex(rn,0.0);\n";
    funbody += "_sum_ += "+expr+";\n";
    funbody += "}\n return _sum_;";
    funbody += "}\n";
  functions[funcount++] = funbody;
    return funcall;
}

function make_integral(body, lower='zero', upper='z', wrt='z', iteramt='iteramt') {
  var funcall = 'fun_'+funcount+'_integral(z,'+lower+','+upper+')';
    var funbody = '';
    funbody += 'complex fun_'+funcount+'_integral(complex zin, complex lower, complex upper){\n';
    funbody += 'complex z = zin;\n'
    if(wrt == 'z') {
      funbody += 'z = lower;\n';
    } else {
      funbody += 'complex '+wrt+' = lower;\n';
    }
    funbody += 'complex _sum_ = zero;\n';
    funbody += 'complex _step_ =(upper-lower)/'+iteramt+';\n';
    funbody += 'for(float _iter_ =0.0; _iter_ < '+iteramt+'; _iter_+=1.0){\n';
    funbody += '_sum_ += mul('+body+',_step_);\n';
    funbody +=  wrt+' += _step_;\n';
    funbody += '}\n';
    funbody += 'return _sum_;\n';
     funbody += '}';
    functions[funcount++] = funbody;
  return funcall;    
}

function make_derivative(body, wrt='z') {
    //var regex = new RegExp("([^a-z])("+wrt+")([^a-z])\\1","g")
        //var regex = /(?:[^a-z])(z)(?:[^a-z])/g
    //var funcall = "(("+body.replace(regex,wrt+"+cepsilon")+")-("+body+"))/epsilon"
    
    
      var funcall = 'fun_'+funcount+'_derivative(z, _zprime_, cepsilon)';
        var funbody = '';
        funbody += 'complex fun_'+funcount+'_derivative(complex zin, complex _zprime_, complex epsilon){\n';
        funbody += 'complex z = zin;\n' 
        funbody += 'complex _difference_ = zero;\n';
        funbody += '_difference_ -= '+body+';\n';
        funbody += wrt+' += epsilon;\n';
        funbody += '_difference_ += '+body+';\n';
        funbody += 'return div(_difference_, epsilon);\n';
        funbody += '}';
        
        
        functions[funcount++] = funbody;
        return funcall;
}



function getDebugstr() {
   var str ='';
   str += 'Uniforms: ';
  var key;
   for(key in uniforms) {
    str += key + ' ';
   }
   str += '\n';
   str += 'Functions: \n'
   for(key in functions) {
    str += functions[key] +"\n";
   }
   return str;
}

function genResults() {
  var results = {};
    var key;
    results['functions'] = '';
    for(key in functions) {
      results['functions'] += functions[key] +"\n";
   }
   results['uniforms'] = '';
   results['uniform_names'] = [];
   for(key in uniforms) {
    results['uniforms'] += 'uniform complex ' +key + ';\n';
    results['uniform_names'].push(key);
   }
   
   return results;
}


 }
 
start = _ expr:(Expression)+ com* {
   //var str = getDebugstr();
  var results = genResults();
    //var str = results['uniforms'] + results['functions'];
  results['parsed'] = expr;
    return results;
  //return str+'\n' + '_zresult_ = '+expr+';';
}

Expression
  =  hsign:("-" / "") _ head:Term tail:(_ ("+" / "-") _ ("-" / "") _ Term _)* {
      var result = hsign +head, i;
      

      for (i = 0; i < tail.length; i++) {
        if (tail[i][1] === "+") { result = result+"+"+tail[i][3]+tail[i][5]; }
        if (tail[i][1] === "-") { result = result+"-"+tail[i][3]+tail[i][5]; }
      }

      return result;
    }
    / _ "-" _ tail:Term _ {
      return "-"+tail;
    }

  
Term
  = 
    head:Fterm tail:(_ ((("*" / "/") _ ("-" / ""))/("" _ (""))) _ Fterm _)* {
      var result = head, i;

      for (i = 0; i < tail.length; i++) {
        if (tail[i][1][0] === "*") { result = "mul("+result+","+tail[i][1][2]+tail[i][3]+")"; }
        if (tail[i][1][0] === "") { result = "mul("+result+","+tail[i][1][2]+tail[i][3]+")"; }
        if (tail[i][1][0] === "/") { result = "div("+result+","+tail[i][1][2]+tail[i][3]+")"; }
      }

      return result;
    }
  
    
Fterm 
  = head:Cterm tail:(_ ("^") _ ("-"/"") _ Cterm _)+ {
      var i = tail.length-1;
    var result = ""+tail[i][3]+""+tail[i][5];

      //Make right associative 
      for (i = tail.length-1; i >= 0; i--) {
        if(i == 0) {
          result = "pow("+head+","+result+")";
        } else {
          result = "pow("+tail[i-1][3]+tail[i-1][5]+","+result+")";
        } 
      }

      return result;
    }
    / head:Cterm {
      return head;
    }
    
Cterm = 
    head:Factor _ '*' _ !(Fterm /"-"/"+")  {
        return "conjugate("+head+")"; 
    }
    / head:Factor _ '!' _ {
      return "factorial("+head+")";
    }
    /head:Factor _ "'" _ {
    return make_derivative(head);
    }
    / '$' _ '[' _ lower:Expression _ ',' _ upper:Expression _ ',' wrt:[a-zA-Z] _ ',' iters:Integer ']'_ body:Factor _ {
      return make_integral(body, lower, upper, wrt, iters+".0");
    }
    / '$' _ '[' _ lower:Expression _ ',' _ upper:Expression _ ',' wrt:[a-zA-Z] _ ']'_ body:Factor _ {
      return make_integral(body, lower, upper, wrt);
    }
    / '$' _ '[' _ lower:Expression _ ',' _ upper:Expression _ ']'_ body:Factor _ {
      return make_integral(body, lower, upper);
    }
    / '$' _ '[' _ lower:Expression _ ']'_ body:Factor _ {
      return make_integral(body, lower);
    }
    / '$'  _ body:Factor _ {
      return make_integral(body);
    }
    / head:Factor _ {
        return head;
    }

Factor
  =  "(" _ expr:Expression  _ ")" { return expr; }
  / "|" _ expr:Expression _ "|" {return "clen("+expr+")";}
  / Sum
  / Function
  / I
  / Imaginary
  / Float
  / SpecialPrime
  / Special
  / Uniform
  / Iter


I 'i'
 = 'i' {return "complex(0,"+text().replace("i","1")+")";}

Imaginary "imaginary"
  = Float'i' {return "complex(0,"+text().substring(0, text().length-1)+")";}

Float "float"
  = ([0-9]+('.'[0-9]+)?('e'[+-]?[0-9]+)?/'e'/'pi') {return "complex("+text()+",0)"; }
  
Integer 'integer'
  = [0-9]+ {return text();}
  
SpecialPrime 'special character prime'
   = Special"'" {return ('_'+text().toLowerCase().replace("'", "prime"))+'_';}
  
Special 'special character'
  = [zZ] {return text().toLowerCase();}
  
 //e, i, and z are reserved
Uniform 'uniform'
  = [a-df-hj-y] {uniforms[text()]='';return text();}
  
Sum = 'sum(' _ expr:Expression _ ',' _ max:Expression _ ')' {
  return make_sum(expr, max);
}
  
Iter
 =  '{'  asg1exp:Expression   ',' _ asg2exp:Expression  _ ',' _ count:Factor _ '}' {
   var asg2var = "_zprime_";
   var asg1var = "_zprime_";
   var funcall ='fun_'+funcount+'_iter(z,'+asg2exp+')';
   
   var funbody = '';
   funbody += 'complex fun_'+funcount+'_iter(complex z, complex _zprime0_) {\n';
   funbody += 'complex '+ asg2var + '= _zprime0_;\n';
   
   funbody += 'for(int iter = 0; iter < int('+count+'.x); iter++){\n';
   
   //Maybe add handling for multiple vars?
   funbody += asg1var +'='+ asg1exp+';'; //expr.replace(regex, asg2var+declcount);
   funbody +='\n}\n';
   funbody += 'return '+asg1var+';';
   funbody += '\n}';
   funbody += '\n';
   
   functions[funcount] = funbody;
   
   //var regex = new RegExp(asg1var, "g");
   //loopbody = loopbody.replace(regex, asg1var+itercount);
   funcount++;
   //iters += loopbody;
   return funcall;
 }
 / '{' _ asg1var:(SpecialPrime / Uniform) _ '=' _ asg1exp:(Expression _)+  _ ',' _ asg2var:(SpecialPrime / Uniform) _ '=' _ asg2exp:(Expression _)+  _ ',' _ count:Factor _ '}' {
   
   var funcall ='fun_'+funcount+'_iter(z,'+asg2exp[0][0]+')';
   
   var funbody = '';
   funbody += 'complex fun_'+funcount+'_iter(complex z, complex _zprime0_) {\n';
   funbody += 'complex '+ asg2var + '= _zprime0_;\n';
   
   funbody += 'for(int iter = 0; iter < int('+count+'.x); iter++){\n';
   
   //Maybe add handling for multiple vars?
   funbody += asg1var +'='+ asg1exp[0][0]+';'; //expr.replace(regex, asg2var+declcount);
   funbody +='\n}\n';
   funbody += 'return '+asg1var+';';
   funbody += '\n}';
   funbody += '\n';
   
   functions[funcount] = funbody;
   
   //var regex = new RegExp(asg1var, "g");
   //loopbody = loopbody.replace(regex, asg1var+itercount);
   funcount++;
   //iters += loopbody;
   return funcall;
 }
 

  Function
  = [A-Za-z][A-Za-z]+'()' {return text();}
  / head:[A-Za-z] tail:[A-Za-z]+'(' expr:Expression exprs:(_ ',' _ Expression _)*')' {
      var i =0;

      var result = '';

      for(i = 0; i < head.length; i++) {
        result +=head[i];
      }
      
      for(i = 0; i < tail.length; i++) {
        result +=tail[i];
      } 
      
      result += '(';
      for (i = 0; i < expr.length; i++) {
        result = result+expr[i][0]; 
      }
      for (i = 0; i < exprs.length; i++) {
        result = result+","+exprs[i][3]; 
      }
      result += ')'
      return result;
    }


_ "whitespace"
  = [ \t\n\r]*
  
com = "//".* 
