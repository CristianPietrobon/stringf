//import {GenCode} from "./common";
/**
 * Created by crist on 03/07/2017.
 */

//@TODO bug placing/not placing ';' if a piece of code is 'formatted' (lot of code on single array bucket)
class JoinCode{
    public static Join(arr:string[]):string{
        let result = '';
        for(let i of arr){
            let code = i.trim();
            if (code.length ===0 ) continue;
            result += code;
            let ch = i[i.length-1];
            /*if (ch == ')')
                if (code.indexOf('buildCreate') >=0)
                    console.log(code + ' index:'+code.indexOf('if '));*/
            if (ch !== ';'
                && ch != '{'
                && ch != '}'
                && ch != '['
                && ch != '(' && (ch != ')' && code.indexOf('if ') === 0)) {
                result += ';';
            }
            result += '\n';
        }
        return result;
    }

    public static AnyOf(){

    }
}

class GenSubCode{
    protected code:string[] = []; //code section

    constructor(cod:string[]){
        this.code = cod;
    }

    public push(code:string | null,format:object|null = null):GenSubCode{
        if (code == null) return this;
        this.code.push(format != null?new stringf(code,true).format(format):code);
        return this;
    }

    public compile(format:object|null = null):string{
        let result ='';
        result += JoinCode.Join(this.code);
        return format != null?new stringf(result,true).format(format):result;
    }

    public format(format:object|null = null){
        //if (format == null) return;
        let code = this.compile(format);
        this.code.splice(0,this.code.length);
        this.code.push(code);
        /*let len = this.code.length;
        for(let i=0;i<len;i++){
            let str = new stringf(this.code[i],true);
            this.code.push(str.format(format));
        }
        this.code.splice(0,len);*/
    }
}

class GenCode{
    protected code:string[][] = []; //code section
    protected codesection:Map<string,number> = new Map();

    constructor(){
        this.createSection('default');
    }

    public sectionExists(name:string):boolean{
        let sect;
        if ((sect = this.codesection.get(name)) == null) return false;
        return true;
    }

    public createSection(name:string):GenCode{
        let index = this.code.length;
        if (this.codesection.get(name) != null) throw new Error('code section exists');
        this.codesection.set(name,index);
        this.code.push([]);
        return this;
    }

    public getSection(name:string):GenSubCode{
        let index = this.code.length;
        let sect;
        if ((sect = this.codesection.get(name)) == null) throw new Error('code section not exists ['+name+']');
        return new GenSubCode(this.code[sect]);
    }

    public asArray():string[][]{
        return this.code;
    }

    public format(name:string,format:object|null = null){
        throw new Error('missing implementation');
    }

    public pushDefaul(code:string | null,format:object|null = null):GenCode{
        return this.push('default',code,format);
    }

    public pushCreate(name:string,code:string | null,format:object|null = null):GenCode{
        if (this.codesection.get(name) != null)
            this.createSection(name);
        return this.push(name,code,format);
    }

    public push(name:string,code:string | null,format:object|null = null):GenCode{
        if (code == null) return this;
        let index;
        if ((index = this.codesection.get(name)) == null) throw new Error('code section not exists ['+name+']');
        let arr = this.code[index];
        arr.push(format != null?new stringf(code,true).format(format):code);
        return this;
    }

    public compile(format:object|null = null):string{
        let result ='';
        for(let codeList of this.code){
            result += JoinCode.Join(codeList);
        }
        return format != null?new stringf(result,true).format(format):result;
    }

    public clone(name:string,baseobj:GenCode | null = null):GenCode{
        let obj = baseobj == null?new GenCode():baseobj;
        obj.code = this.code.slice();
        for(let i=0;i<obj.code.length;i++){
            obj.code[i] = obj.code[i].slice();
        }
        obj.codesection = new Map(this.codesection);
        return obj;
    }
}

interface strIndex{
    value:string,
    index:number,
    start: number
}

export class stringf{
    private compileFunction:(opt:object)=>string;

    constructor(value:string,public throwOnMissing = false,public splitter = '@@'){
        //this.val = value;
        this.compile(value);
    }

    private compile(value:string){
        let fun = '("")';
        fun += this.parse(value);
        this.compileFunction = <(opt:object)=>string>new Function('o','return ' +fun);
    }

    private skipSpace(val:strIndex){
        if ((val.index - val.start) ===0 && (val.value[val.index] === ' ' ||
                val.value[val.index] === '\n' ||
                val.value[val.index] === '\r')) {
            while (((val.value[val.index] === ' ' ||
                val.value[val.index] === '\n' ||
                val.value[val.index] === '\r')) && val.index < val.value.length)val.index++; //skip all space
        }
    }

    private parse(value:string):string{
        let val:strIndex = {value:value,index:0,start:0};

        let fun = '';

        if (val.value == null || val.value == '')
            return '+("")';

        let index;
        if ((index = val.value.indexOf(this.splitter)) >=0){
            let rest = val.value.substring(0,index);
            if (rest != null && rest.length>0)
                fun += '+'+JSON.stringify(rest);
            val.start = index + this.splitter.length;
            val.index = index + this.splitter.length;
        }else{ // no tokens
            return '+'+JSON.stringify(val.value);
        }

        let noname = true;
        for(;val.index<=val.value.length;val.index++){

            this.skipSpace(val);

            if (val.value[val.index] === this.splitter[0]  ||
                val.value[val.index] === ' ' ||
                val.value[val.index] === ';' ||
                val.value[val.index] === '\n'||
                val.value[val.index] === '\r'||
                val.value[val.index] === '=' ||
                val.value[val.index] === '?' ||
                val.value[val.index] === '!' ||
                val.value[val.index] === '@' ||
                val.value[val.index] === '#' ||
                val.value[val.index] === ':' ||
                val.value[val.index] === '"' ||
                val.value[val.index] === "'" ||
                val.value[val.index] === "," ||
                val.value[val.index] === "-" ||
                val.value[val.index] === "_" ||
                val.value[val.index] === "." ||
                val.value[val.index] === "(" ||
                val.value[val.index] === ")" ||
                val.value[val.index] === "{" ||
                val.value[val.index] === "[" ||
                val.value[val.index] === "]" ||
                val.value[val.index] === "}" ||
                val.value[val.index] === "\\"||
                val.value[val.index] === "+" ||
                val.value[val.index] === "-" ||
                val.value[val.index] === "*" ||
                val.value[val.index] === "/" ||
                val.value[val.index] === ">" ||
                val.value[val.index] === "<" ||
                val.index === (val.value.length)){

                if (val.value[val.index] === this.splitter[0] &&
                    val.value.indexOf(this.splitter,val.index) < 0){
                    continue;
                }

                fun += '+'+this.parseText(val);

                break;
            }else noname = false;
        }
        return fun;
    }

    private parseText(val:strIndex):string{
        let fun = '';
        let tok = val.value.slice(val.start, val.index);
        if (tok == '') throw new Error('invalid name for [' + this.splitter + ']');
        tok = tok.trim();
        let rest = val.value.slice(val.index);
        if (this.throwOnMissing == false)
            fun += '(o.' + tok + '==null?"":o.' + tok + ')';
        else
            fun += '(o.' + tok + '==null?(function(){throw new Error("undefined ["+' + JSON.stringify(tok) + '+"]")})():o.' + tok + ')';
        if (rest != null && rest.length > 0)
            fun += this.parse(rest);

        return fun;
    }

    public format(opt:object):string{
        if (this.compileFunction == null) return '';
        return this.compileFunction(opt);
    }
}

export interface stirngfBIF{
    name:string,
    argname?:string,
    code_head?:string,
    code_tail?:string,
    fnative_head?:(global_arg:any,arg:any)=>string; // function used for execute external code
    fnative_tail?:(global_arg:any,arg:any)=>string; // function used for execute external code
    fnative_code?:(global_arg:any,arg:any)=>string; // function used for execute external code
}

interface stringfToken{
    name:string,
    value:string
}

export class stringfplus{
    private compileFunction:(opt:object,language:string,__native:(code:string,type:string,arg:any)=>string)=>string;

    public static BIF:Map<string,stirngfBIF> = new Map();
    private tokenList:Map<string,stringfToken> = new Map();

    public splitter = '@@';
    public throwOnMissing = false;
    public languageFieldName = 'type';
    public languageId = 'language';
    public languageDefault = 'en_gb';
    public isHtml = false;

    constructor(value:string, op?:{
        splitter?:string,
        throwOnMissing?: boolean,
        languageFieldName? : string,
        languageId?: string,
        languageDefault?:string,
        isHtml?:boolean
    }){
        if (op != null){
            if (op.splitter!= null){
                this.splitter = op.splitter;
            }
            if (op.throwOnMissing!= null){
                this.throwOnMissing = op.throwOnMissing;
            }
            if (op.languageFieldName!= null){
                this.languageFieldName = op.languageFieldName;
            }
            if (op.languageId!= null){
                this.languageId = op.languageId;
            }
            if (op.languageDefault!= null){
                this.languageDefault = op.languageDefault;
            }
            if (op.isHtml!= null){
                this.isHtml = op.isHtml;
            }
        }

        this.compile(value);
    }

    public static addBIF(bif:stirngfBIF){
        if (bif.code_head == null) bif.code_head='';
        if (bif.code_tail == null) bif.code_tail='';
        if (bif.argname == null) bif.argname='arg'; //shadow global arg

        bif.code_head = bif.code_head.replace(/echo/g,'_r+=');
        bif.code_tail = bif.code_tail.replace(/echo/g,'_r+=');
        stringfplus.BIF.set(bif.name,bif);
    }

    private addToken(tok:stringfToken,replace:boolean = false,nosub:boolean = false){
        //add also all subobject
        if (!nosub) {
            let all = tok.name.split('.');
            if (all.length > 1) {
                let name = '';
                for (let i = 0; i < all.length; i++) {
                    if (name != '') name += '.';
                    name += all[i];
                    this.addToken({
                        name: name,
                        value: '""'
                    }, false, true);
                }
                return;
            }else{

            }
        }

        if (replace){
            this.tokenList.set(tok.name,tok);
            return;
        }
        if (this.tokenList.get(tok.name) == null){
            this.tokenList.set(tok.name,tok);
        }
    }

    private compile(value:string){
        let fun = 'let _r="";';
        let code = this.parse(value);

        let checkCode:GenCode = new GenCode();
        const entry = this.tokenList.entries();
        while(true){
            const iterator = entry.next();
            if (iterator == null) break;
            const t = iterator.value;
            if (t == null || t.length == 0) break;

            let obj = t[0].split('.');

            if (!checkCode.sectionExists(obj[0]))
                checkCode.createSection(obj[0]);

            if (!checkCode.sectionExists('a'+obj[0]))
                checkCode.createSection('a'+obj[0]);

            if (!checkCode.sectionExists('else'+obj[0]))
                checkCode.createSection('else'+obj[0]);

            if (!checkCode.sectionExists('b'+obj[0]))
                checkCode.createSection('b'+obj[0]);


            let funcode = checkCode.getSection(obj[0]);
            checkCode.getSection('a'+obj[0]);
            let elsefuncode = checkCode.getSection('else'+obj[0]);
            checkCode.getSection('b'+obj[0]);

            if (obj.length === 1) {
                funcode.push('if (arg.@@field == null){arg.@@field=@@value;}', {
                    field: t[0],
                    value: t[1].value
                });
                checkCode.getSection('a'+obj[0]).push('else{');
                checkCode.getSection('b'+obj[0]).push('}');
            }
            elsefuncode.push('if (arg.@@field == null){arg.@@field=@@value;}', {
                field: t[0],
                value: t[1].value
            });
            //language selection
            let temp = `while (typeof arg.name === "object" && arg.name.flang==="value"){
                    if (arg.name[language] == null){
                        arg.name = arg.name["default"];
                        if (arg.name == null) arg.name = '';
                    }else
                        arg.name = arg.name[language];
                }`;

            temp = temp.replace(/name/g, t[0]);
            temp = temp.replace(/flang/g, this.languageFieldName);
            temp = temp.replace(/value/g, this.languageId);
            temp = temp.replace(/default/g, this.languageDefault);

            elsefuncode.push(temp);

            if (this.isHtml) //escape
                elsefuncode.push(`if (typeof arg.@@field === "string"){
        let cp = '';
        let ch = '';
        for(let i=0;i<arg.@@field.length;i++){
            if ((ch = arg.@@field[i]) === '<') cp += '&lt;';
            else
            if (ch === '>') cp += '&gt;';
            else
            if (ch === '&') cp += '&amp;';
            else
                cp += ch;
        }
        arg.@@field = cp;
            }`, {
                    field: t[0],
                });

        }
        fun += checkCode.compile();
        fun += code;
        fun += ';return _r;';
        //console.log(fun);
        this.compileFunction = <(opt:object)=>string>new Function('arg','language','__native',fun);
    }

    private skipSpace(val:strIndex){
        if ((val.index - val.start) ===0 && (val.value[val.index] === ' ' ||
                val.value[val.index] === '\n' ||
                val.value[val.index] === '\r')) {
            while (((val.value[val.index] === ' ' ||
                val.value[val.index] === '\n' ||
                val.value[val.index] === '\r')) && val.index < val.value.length)val.index++; //skip all space
        }
    }

    private EndLine(val:strIndex):boolean{
        if (val.value[val.index] === this.splitter[0]  ||
            val.value[val.index] === ' ' ||
            val.value[val.index] === ';' ||
            val.value[val.index] === '\n'||
            val.value[val.index] === '\r'||
            val.value[val.index] === '=' ||
            val.value[val.index] === '?' ||
            val.value[val.index] === '!' ||
            val.value[val.index] === '@' ||
            val.value[val.index] === '#' ||
            val.value[val.index] === ':' ||
            val.value[val.index] === '"' ||
            val.value[val.index] === "'" ||
            val.value[val.index] === "," ||
            val.value[val.index] === "-" ||
            val.value[val.index] === "_" ||
            val.value[val.index] === "." ||
            val.value[val.index] === "(" ||
            val.value[val.index] === ")" ||
            val.value[val.index] === "{" ||
            val.value[val.index] === "[" ||
            val.value[val.index] === "]" ||
            val.value[val.index] === "}" ||
            val.value[val.index] === "\\"||
            val.value[val.index] === "+" ||
            val.value[val.index] === "-" ||
            val.value[val.index] === "*" ||
            val.value[val.index] === "/" ||
            val.value[val.index] === ">" ||
            val.value[val.index] === "<" ||
            val.index === (val.value.length)) return true;
        return false;
    }

    private parse(value:string):string{
        let val:strIndex = {value:value,index:0,start:0};

        let fun = ';_r+=';

        if (val.value == null || val.value == '')
            return '';

        let index;
        if ((index = val.value.indexOf(this.splitter)) >=0){
            let rest = val.value.substring(0,index);
            if (rest != null && rest.length>0)
                fun += JSON.stringify(rest)+'+';
            val.start = index + this.splitter.length;
            val.index = index + this.splitter.length;
        }else{ // no tokens
            return fun+JSON.stringify(val.value)+';';
        }

        let noname = true;
        for(;val.index<=val.value.length;val.index++){

            this.skipSpace(val);

            if (this.EndLine(val)){

                if (val.value[val.index] === this.splitter[0] &&
                    val.value.indexOf(this.splitter,val.index) < 0){
                    continue;
                }

                if (val.value[val.index] === "."){
                    val.index++;
                    if (this.EndLine(val)){ //used as class access?!
                        val.index--; //no
                    }else
                        continue;
                    //yes
                }

                if (noname && val.value[val.index] === '{'){ //code
                    if (fun === ';_r+=' || fun === ';_r+=;') fun ='';
                    if (fun[fun.length-1] == '+') fun = fun.slice(0,fun.length-1);
                    fun += this.codeToFun(val);
                }else
                if (noname && val.value[val.index] === '<'){
                    if (fun === ';_r+=' || fun === ';_r+=;') fun ='';
                    if (fun[fun.length-1] == '+') fun = fun.slice(0,fun.length-1);
                    fun += this.parseDefault(val);
                }
                else
                if (noname === false && val.value[val.index] === '('){ //code
                    if (fun === ';_r+=' || fun === ';_r+=;') fun ='';
                    if (fun[fun.length-1] == '+') fun = fun.slice(0,fun.length-1);
                    fun += this.parseFunction(val);
                }else
                    fun += this.parseText(val);

                break;
            }else noname = false;
        }
        if (fun === ';_r+=' || fun === ';_r+=;') return '';
        return fun;
    }

    private parseText(val:strIndex):string{
        let fun = '';
        let tok = val.value.slice(val.start, val.index);
        if (tok == '') throw new Error('invalid name for [' + this.splitter + ']');
        tok = tok.trim();
        let rest = val.value.slice(val.index);
        fun += '(arg.' + tok + ')';
        this.addToken({name:tok,value:'""'});
        if (rest != null && rest.length > 0)
            fun += this.parse(rest);
        return fun;
    }

    private parseDefault(val:strIndex):string{
        let code = this.getCode('<','>',val);
        let toklist = code.split(',');
        let rest = val.value.slice(val.index);
        for(let t of toklist){
            let spl = t.split(':');
            if (spl.length <= 1) throw new Error('invalid syntax [key:value]');
            this.addToken({name:spl[0],value:spl[1]},true);
        }
        if (rest != null && rest.length > 0)
            return this.parse(rest);
        return '';
    }

    private parseFunction(val:strIndex):string{
        let fun = '';
        let tok = val.value.slice(val.start, val.index);
        if (tok == '') throw new Error('invalid name for [' + this.splitter + ']');
        tok = tok.trim();

        let code = this.getCode('(',')',val);
        code = code.trim();
        //let rest = val.value.slice(val.index);
        let subcode ='';
        let elsecode = '';

        code = code.replace(/@@/g,'arg.');

        switch (tok){
            case 'if':
                subcode = this.getCode('{','}',val);
                if (subcode == null || subcode.length <0) throw new Error('missing {} for [if]');

                subcode = this.parse(subcode);

                this.skipSpace(val);
                if (val.value.indexOf('else') === val.index){
                    val.index+=4;
                    elsecode += this.parse(this.getCode('{','}',val));
                }

                fun += ';if('+code+'){'+subcode+'}else{'+elsecode+'}';
                break;

            case 'for':
                subcode = this.getCode('{','}',val);
                if (subcode == null || subcode.length <0) throw new Error('missing {} for [for]');

                subcode = this.parse(subcode);

                fun += ';for('+code+'){'+subcode+'}';
                break;

            case 'echo':
                fun += ';_r+=('+code+');';
                break;

            default:
                let bif = stringfplus.BIF.get(tok);
                if (bif == null)
                    throw new Error('invalid function ['+tok+']');

                if (code === '') code = 'null';

                fun +=';{let '+bif.argname+'='+code;

                this.skipSpace(val);
                if (val.value[val.index] === '{') {
                    elsecode = this.parse(this.getCode('{', '}', val));
                }

                fun+=/*bif.code_head*/this.parse(bif.code_head!=null?bif.code_head:'');
                if (bif.fnative_head != null)
                    fun+=";_r+=__native('"+bif.name+"','head',"+bif.argname+");";

                fun+= elsecode;
                if (bif.fnative_code != null)
                    fun+=";_r+=__native('"+bif.name+"','code',"+bif.argname+");";

                fun+=/*bif.code_tail*/this.parse(bif.code_tail!=null?bif.code_tail:'');
                if (bif.fnative_tail != null)
                    fun+=";_r+=__native('"+bif.name+"','tail',"+bif.argname+");";

                fun +='}';
        }

        let rest = val.value.slice(val.index);
        if (rest != null && rest.length > 0)
            fun += this.parse(rest);

        return fun;
    }

    private getCode(starch:string,stopch:string,val:strIndex):string{
        this.skipSpace(val);

        let codestart = -1,codestop = -1;
        codestart = val.index;
        let par = 1;
        val.index++;
        while(par >= 1 && val.index<=val.value.length){
            if (val.value[val.index] === starch) par++;
            if (val.value[val.index] === stopch) par--;
            val.index++;
        }
        if (par >=1) throw new Error('missing ['+stopch+'] at '+val.value.substring(val.index,10));
        codestop = --val.index;

        val.index++;
        let code = val.value.slice(codestart+1,codestop);
        return code;
    }

    private codeToFun(val:strIndex):string{
        let fun = '';
        let code = this.getCode('{','}',val);
        code = code.replace(/@@/g,'arg.');
        code = code.replace(/echo/g,'_r+=');
        let rest = val.value.slice(val.index);
        fun += ';'+code+';';
        if (rest != null && rest.length > 0)
            fun += this.parse(rest);
        return fun;
    }

    private genFun(code:string,args:string = 'o',body:string = ''):string{
        let fun = '';
        let fun_pars = 'args';
        if (body != '') {
            fun_pars += ',body';
            args += ','+body;
        }

        code = "var _strecho = '';function echo(str){_strecho+=str;};"+code+" return _strecho;"; //echo variable
        if (this.throwOnMissing == false)
            fun += '+\n((function('+fun_pars+'){try {'+code+'}catch(err){return "";}})('+args+'))\n';
        else
            fun += '+(o==null?(function(){throw new Error("undefined ["+'+JSON.stringify('argument')+'+"]")})():((function('+fun_pars+'){try {'+code+'}catch(err){return "";}})('+args+'))';
        return fun;
    }

    public format(opt?:{
        language?:string,
    }, ...objlist: object[]):string{
        if (this.compileFunction == null) return '';
        if (opt == null) opt = {};
        if (opt.language ==null || opt.language === '') opt.language = this.languageDefault;
        const gargs = Object.assign({},...objlist);
        return this.compileFunction(gargs,opt.language,(code:string,type:string,arg:any)=>{
            //call native code
            const BIF = stringfplus.BIF.get(code);
            if (BIF == null){
                console.error("stringfplus: native call of non existing BIF [%s]",code);
                return '';
            }

            switch (type){
                case 'head':
                    if (BIF.fnative_head == null){
                        console.error("stringfplus: native call of non existing 'head' function for BIF [%s]",code);
                        return '';
                    }
                    return BIF.fnative_head(gargs,arg);
                case 'tail':
                    if (BIF.fnative_tail == null){
                        console.error("stringfplus: native call of non existing 'tail' function for BIF [%s]",code);
                        return '';
                    }
                    return BIF.fnative_tail(gargs,arg);
                case 'code':
                    if (BIF.fnative_code == null){
                        console.error("stringfplus: native call of non existing 'code' function for BIF [%s]",code);
                        return '';
                    }
                    return BIF.fnative_code(gargs,arg);
            }

            return '';
        });
    }
}

/*export class StringFormatter{

    public static format(str:string,opt:any):string{

    }
}*/

let htmlTag= ['a','div','article','p','i','b','ul',
    'li','h1','h2','h3','h4','h5','h6','title','style',
    'head','html','body','span'];

for(let tag of htmlTag){
    stringfplus.addBIF({
        name:tag,
        argname: 'farg',
        code_head: `@@{
        echo("<`+tag+`");
        if (farg != null)
        for (let k of Object.keys(farg)) {
            if (farg[k] != null)
            echo(' ' + k + '="' + farg[k]+'"');
            else
            echo(' ' + k);
        }
        echo('>');}`,
        code_tail: '@@{echo("</'+tag+'>")}',
    });
}

stringfplus.addBIF({
    name:'img',
    argname: 'farg',
    code_head: `@@{
        echo("<img");
        if (farg != null)
        for (let k of Object.keys(farg)) {
            if (farg[k] != null)
            echo(' ' + k + '="' + farg[k]+'"');
            else
            echo(' ' + k);
        }
        echo('>');}`,
    code_tail: '',
});