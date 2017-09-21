"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class JoinCode {
    static Join(arr) {
        let result = '';
        for (let i of arr) {
            let code = i.trim();
            if (code.length === 0)
                continue;
            result += code;
            let ch = i[i.length - 1];
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
    static AnyOf() {
    }
}
class GenSubCode {
    constructor(cod) {
        this.code = [];
        this.code = cod;
    }
    push(code, format = null) {
        if (code == null)
            return this;
        this.code.push(format != null ? new stringf(code, true).format(format) : code);
        return this;
    }
    compile(format = null) {
        let result = '';
        result += JoinCode.Join(this.code);
        return format != null ? new stringf(result, true).format(format) : result;
    }
    format(format = null) {
        let code = this.compile(format);
        this.code.splice(0, this.code.length);
        this.code.push(code);
    }
}
class GenCode {
    constructor() {
        this.code = [];
        this.codesection = new Map();
        this.createSection('default');
    }
    sectionExists(name) {
        let sect;
        if ((sect = this.codesection.get(name)) == null)
            return false;
        return true;
    }
    createSection(name) {
        let index = this.code.length;
        if (this.codesection.get(name) != null)
            throw new Error('code section exists');
        this.codesection.set(name, index);
        this.code.push([]);
        return this;
    }
    getSection(name) {
        let index = this.code.length;
        let sect;
        if ((sect = this.codesection.get(name)) == null)
            throw new Error('code section not exists [' + name + ']');
        return new GenSubCode(this.code[sect]);
    }
    asArray() {
        return this.code;
    }
    format(name, format = null) {
        throw new Error('missing implementation');
    }
    pushDefaul(code, format = null) {
        return this.push('default', code, format);
    }
    pushCreate(name, code, format = null) {
        if (this.codesection.get(name) != null)
            this.createSection(name);
        return this.push(name, code, format);
    }
    push(name, code, format = null) {
        if (code == null)
            return this;
        let index;
        if ((index = this.codesection.get(name)) == null)
            throw new Error('code section not exists [' + name + ']');
        let arr = this.code[index];
        arr.push(format != null ? new stringf(code, true).format(format) : code);
        return this;
    }
    compile(format = null) {
        let result = '';
        for (let codeList of this.code) {
            result += JoinCode.Join(codeList);
        }
        return format != null ? new stringf(result, true).format(format) : result;
    }
    clone(name, baseobj = null) {
        let obj = baseobj == null ? new GenCode() : baseobj;
        obj.code = this.code.slice();
        for (let i = 0; i < obj.code.length; i++) {
            obj.code[i] = obj.code[i].slice();
        }
        obj.codesection = new Map(this.codesection);
        return obj;
    }
}
class stringf {
    constructor(value, throwOnMissing = false, splitter = '@@') {
        this.throwOnMissing = throwOnMissing;
        this.splitter = splitter;
        this.compile(value);
    }
    compile(value) {
        let fun = '("")';
        fun += this.parse(value);
        this.compileFunction = new Function('o', 'return ' + fun);
    }
    skipSpace(val) {
        if ((val.index - val.start) === 0 && (val.value[val.index] === ' ' ||
            val.value[val.index] === '\n' ||
            val.value[val.index] === '\r')) {
            while (((val.value[val.index] === ' ' ||
                val.value[val.index] === '\n' ||
                val.value[val.index] === '\r')) && val.index < val.value.length)
                val.index++;
        }
    }
    parse(value) {
        let val = { value: value, index: 0, start: 0 };
        let fun = '';
        if (val.value == null || val.value == '')
            return '+("")';
        let index;
        if ((index = val.value.indexOf(this.splitter)) >= 0) {
            let rest = val.value.substring(0, index);
            if (rest != null && rest.length > 0)
                fun += '+' + JSON.stringify(rest);
            val.start = index + this.splitter.length;
            val.index = index + this.splitter.length;
        }
        else {
            return '+' + JSON.stringify(val.value);
        }
        let noname = true;
        for (; val.index <= val.value.length; val.index++) {
            this.skipSpace(val);
            if (val.value[val.index] === this.splitter[0] ||
                val.value[val.index] === ' ' ||
                val.value[val.index] === ';' ||
                val.value[val.index] === '\n' ||
                val.value[val.index] === '\r' ||
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
                val.value[val.index] === "\\" ||
                val.value[val.index] === "+" ||
                val.value[val.index] === "-" ||
                val.value[val.index] === "*" ||
                val.value[val.index] === "/" ||
                val.value[val.index] === ">" ||
                val.value[val.index] === "<" ||
                val.index === (val.value.length)) {
                if (val.value[val.index] === this.splitter[0] &&
                    val.value.indexOf(this.splitter, val.index) < 0) {
                    continue;
                }
                fun += '+' + this.parseText(val);
                break;
            }
            else
                noname = false;
        }
        return fun;
    }
    parseText(val) {
        let fun = '';
        let tok = val.value.slice(val.start, val.index);
        if (tok == '')
            throw new Error('invalid name for [' + this.splitter + ']');
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
    format(opt) {
        if (this.compileFunction == null)
            return '';
        return this.compileFunction(opt);
    }
}
exports.stringf = stringf;
class stringfplus {
    constructor(value, op) {
        this.tokenList = new Map();
        this.splitter = '@@';
        this.throwOnMissing = false;
        this.languageFieldName = 'type';
        this.languageId = 'language';
        this.languageDefault = 'en_gb';
        this.isHtml = false;
        if (op != null) {
            if (op.splitter != null) {
                this.splitter = op.splitter;
            }
            if (op.throwOnMissing != null) {
                this.throwOnMissing = op.throwOnMissing;
            }
            if (op.languageFieldName != null) {
                this.languageFieldName = op.languageFieldName;
            }
            if (op.languageId != null) {
                this.languageId = op.languageId;
            }
            if (op.languageDefault != null) {
                this.languageDefault = op.languageDefault;
            }
            if (op.isHtml != null) {
                this.isHtml = op.isHtml;
            }
        }
        this.compile(value);
    }
    static addBIF(bif) {
        if (bif.code_head == null)
            bif.code_head = '';
        if (bif.code_tail == null)
            bif.code_tail = '';
        if (bif.argname == null)
            bif.argname = 'arg';
        bif.code_head = bif.code_head.replace(/echo/g, '_r+=');
        bif.code_tail = bif.code_tail.replace(/echo/g, '_r+=');
        stringfplus.BIF.set(bif.name, bif);
    }
    addToken(tok, replace = false, nosub = false) {
        if (!nosub) {
            let all = tok.name.split('.');
            if (all.length > 1) {
                let name = '';
                for (let i = 0; i < all.length; i++) {
                    if (name != '')
                        name += '.';
                    name += all[i];
                    this.addToken({
                        name: name,
                        value: '""'
                    }, false, true);
                }
                return;
            }
            else {
            }
        }
        if (replace) {
            this.tokenList.set(tok.name, tok);
            return;
        }
        if (this.tokenList.get(tok.name) == null) {
            this.tokenList.set(tok.name, tok);
        }
    }
    compile(value) {
        let fun = 'let _r="";';
        let code = this.parse(value);
        let checkCode = new GenCode();
        const entry = this.tokenList.entries();
        while (true) {
            const iterator = entry.next();
            if (iterator == null)
                break;
            const t = iterator.value;
            if (t == null || t.length == 0)
                break;
            let obj = t[0].split('.');
            if (!checkCode.sectionExists(obj[0]))
                checkCode.createSection(obj[0]);
            if (!checkCode.sectionExists('a' + obj[0]))
                checkCode.createSection('a' + obj[0]);
            if (!checkCode.sectionExists('else' + obj[0]))
                checkCode.createSection('else' + obj[0]);
            if (!checkCode.sectionExists('b' + obj[0]))
                checkCode.createSection('b' + obj[0]);
            let funcode = checkCode.getSection(obj[0]);
            checkCode.getSection('a' + obj[0]);
            let elsefuncode = checkCode.getSection('else' + obj[0]);
            checkCode.getSection('b' + obj[0]);
            if (obj.length === 1) {
                funcode.push('if (arg.@@field == null){arg.@@field=@@value;}', {
                    field: t[0],
                    value: t[1].value
                });
                checkCode.getSection('a' + obj[0]).push('else{');
                checkCode.getSection('b' + obj[0]).push('}');
            }
            elsefuncode.push('if (arg.@@field == null){arg.@@field=@@value;}', {
                field: t[0],
                value: t[1].value
            });
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
            if (this.isHtml)
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
        this.compileFunction = new Function('arg', 'language', '__native', fun);
    }
    skipSpace(val) {
        if ((val.index - val.start) === 0 && (val.value[val.index] === ' ' ||
            val.value[val.index] === '\n' ||
            val.value[val.index] === '\r')) {
            while (((val.value[val.index] === ' ' ||
                val.value[val.index] === '\n' ||
                val.value[val.index] === '\r')) && val.index < val.value.length)
                val.index++;
        }
    }
    EndLine(val) {
        if (val.value[val.index] === this.splitter[0] ||
            val.value[val.index] === ' ' ||
            val.value[val.index] === ';' ||
            val.value[val.index] === '\n' ||
            val.value[val.index] === '\r' ||
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
            val.value[val.index] === "\\" ||
            val.value[val.index] === "+" ||
            val.value[val.index] === "-" ||
            val.value[val.index] === "*" ||
            val.value[val.index] === "/" ||
            val.value[val.index] === ">" ||
            val.value[val.index] === "<" ||
            val.index === (val.value.length))
            return true;
        return false;
    }
    parse(value) {
        let val = { value: value, index: 0, start: 0 };
        let fun = ';_r+=';
        if (val.value == null || val.value == '')
            return '';
        let index;
        if ((index = val.value.indexOf(this.splitter)) >= 0) {
            let rest = val.value.substring(0, index);
            if (rest != null && rest.length > 0)
                fun += JSON.stringify(rest) + '+';
            val.start = index + this.splitter.length;
            val.index = index + this.splitter.length;
        }
        else {
            return fun + JSON.stringify(val.value) + ';';
        }
        let noname = true;
        for (; val.index <= val.value.length; val.index++) {
            this.skipSpace(val);
            if (this.EndLine(val)) {
                if (val.value[val.index] === this.splitter[0] &&
                    val.value.indexOf(this.splitter, val.index) < 0) {
                    continue;
                }
                if (val.value[val.index] === ".") {
                    val.index++;
                    if (this.EndLine(val)) {
                        val.index--;
                    }
                    else
                        continue;
                }
                if (noname && val.value[val.index] === '{') {
                    if (fun === ';_r+=' || fun === ';_r+=;')
                        fun = '';
                    if (fun[fun.length - 1] == '+')
                        fun = fun.slice(0, fun.length - 1);
                    fun += this.codeToFun(val);
                }
                else if (noname && val.value[val.index] === '<') {
                    if (fun === ';_r+=' || fun === ';_r+=;')
                        fun = '';
                    if (fun[fun.length - 1] == '+')
                        fun = fun.slice(0, fun.length - 1);
                    fun += this.parseDefault(val);
                }
                else if (noname === false && val.value[val.index] === '(') {
                    if (fun === ';_r+=' || fun === ';_r+=;')
                        fun = '';
                    if (fun[fun.length - 1] == '+')
                        fun = fun.slice(0, fun.length - 1);
                    fun += this.parseFunction(val);
                }
                else
                    fun += this.parseText(val);
                break;
            }
            else
                noname = false;
        }
        if (fun === ';_r+=' || fun === ';_r+=;')
            return '';
        return fun;
    }
    parseText(val) {
        let fun = '';
        let tok = val.value.slice(val.start, val.index);
        if (tok == '')
            throw new Error('invalid name for [' + this.splitter + ']');
        tok = tok.trim();
        let rest = val.value.slice(val.index);
        fun += '(arg.' + tok + ')';
        this.addToken({ name: tok, value: '""' });
        if (rest != null && rest.length > 0)
            fun += this.parse(rest);
        return fun;
    }
    parseDefault(val) {
        let code = this.getCode('<', '>', val);
        let toklist = code.split(',');
        let rest = val.value.slice(val.index);
        for (let t of toklist) {
            let spl = t.split(':');
            if (spl.length <= 1)
                throw new Error('invalid syntax [key:value]');
            this.addToken({ name: spl[0], value: spl[1] }, true);
        }
        if (rest != null && rest.length > 0)
            return this.parse(rest);
        return '';
    }
    parseFunction(val) {
        let fun = '';
        let tok = val.value.slice(val.start, val.index);
        if (tok == '')
            throw new Error('invalid name for [' + this.splitter + ']');
        tok = tok.trim();
        let code = this.getCode('(', ')', val);
        code = code.trim();
        let subcode = '';
        let elsecode = '';
        code = code.replace(/@@/g, 'arg.');
        switch (tok) {
            case 'if':
                subcode = this.getCode('{', '}', val);
                if (subcode == null || subcode.length < 0)
                    throw new Error('missing {} for [if]');
                subcode = this.parse(subcode);
                this.skipSpace(val);
                if (val.value.indexOf('else') === val.index) {
                    val.index += 4;
                    elsecode += this.parse(this.getCode('{', '}', val));
                }
                fun += ';if(' + code + '){' + subcode + '}else{' + elsecode + '}';
                break;
            case 'for':
                subcode = this.getCode('{', '}', val);
                if (subcode == null || subcode.length < 0)
                    throw new Error('missing {} for [for]');
                subcode = this.parse(subcode);
                fun += ';for(' + code + '){' + subcode + '}';
                break;
            case 'echo':
                fun += ';_r+=(' + code + ');';
                break;
            default:
                let bif = stringfplus.BIF.get(tok);
                if (bif == null)
                    throw new Error('invalid function [' + tok + ']');
                if (code === '')
                    code = 'null';
                fun += ';{let ' + bif.argname + '=' + code;
                this.skipSpace(val);
                if (val.value[val.index] === '{') {
                    elsecode = this.parse(this.getCode('{', '}', val));
                }
                fun += this.parse(bif.code_head != null ? bif.code_head : '');
                if (bif.fnative_head != null)
                    fun += ";_r+=__native('" + bif.name + "','head'," + bif.argname + ");";
                fun += elsecode;
                if (bif.fnative_code != null)
                    fun += ";_r+=__native('" + bif.name + "','code'," + bif.argname + ");";
                fun += this.parse(bif.code_tail != null ? bif.code_tail : '');
                if (bif.fnative_tail != null)
                    fun += ";_r+=__native('" + bif.name + "','tail'," + bif.argname + ");";
                fun += '}';
        }
        let rest = val.value.slice(val.index);
        if (rest != null && rest.length > 0)
            fun += this.parse(rest);
        return fun;
    }
    getCode(starch, stopch, val) {
        this.skipSpace(val);
        let codestart = -1, codestop = -1;
        codestart = val.index;
        let par = 1;
        val.index++;
        while (par >= 1 && val.index <= val.value.length) {
            if (val.value[val.index] === starch)
                par++;
            if (val.value[val.index] === stopch)
                par--;
            val.index++;
        }
        if (par >= 1)
            throw new Error('missing [' + stopch + '] at ' + val.value.substring(val.index, 10));
        codestop = --val.index;
        val.index++;
        let code = val.value.slice(codestart + 1, codestop);
        return code;
    }
    codeToFun(val) {
        let fun = '';
        let code = this.getCode('{', '}', val);
        code = code.replace(/@@/g, 'arg.');
        code = code.replace(/echo/g, '_r+=');
        let rest = val.value.slice(val.index);
        fun += ';' + code + ';';
        if (rest != null && rest.length > 0)
            fun += this.parse(rest);
        return fun;
    }
    genFun(code, args = 'o', body = '') {
        let fun = '';
        let fun_pars = 'args';
        if (body != '') {
            fun_pars += ',body';
            args += ',' + body;
        }
        code = "var _strecho = '';function echo(str){_strecho+=str;};" + code + " return _strecho;";
        if (this.throwOnMissing == false)
            fun += '+\n((function(' + fun_pars + '){try {' + code + '}catch(err){return "";}})(' + args + '))\n';
        else
            fun += '+(o==null?(function(){throw new Error("undefined ["+' + JSON.stringify('argument') + '+"]")})():((function(' + fun_pars + '){try {' + code + '}catch(err){return "";}})(' + args + '))';
        return fun;
    }
    format(opt, ...objlist) {
        if (this.compileFunction == null)
            return '';
        if (opt == null)
            opt = {};
        if (opt.language == null || opt.language === '')
            opt.language = this.languageDefault;
        const gargs = Object.assign({}, ...objlist);
        return this.compileFunction(gargs, opt.language, (code, type, arg) => {
            const BIF = stringfplus.BIF.get(code);
            if (BIF == null) {
                console.error("stringfplus: native call of non existing BIF [%s]", code);
                return '';
            }
            switch (type) {
                case 'head':
                    if (BIF.fnative_head == null) {
                        console.error("stringfplus: native call of non existing 'head' function for BIF [%s]", code);
                        return '';
                    }
                    return BIF.fnative_head(gargs, arg);
                case 'tail':
                    if (BIF.fnative_tail == null) {
                        console.error("stringfplus: native call of non existing 'tail' function for BIF [%s]", code);
                        return '';
                    }
                    return BIF.fnative_tail(gargs, arg);
                case 'code':
                    if (BIF.fnative_code == null) {
                        console.error("stringfplus: native call of non existing 'code' function for BIF [%s]", code);
                        return '';
                    }
                    return BIF.fnative_code(gargs, arg);
            }
            return '';
        });
    }
}
stringfplus.BIF = new Map();
exports.stringfplus = stringfplus;
let htmlTag = ['a', 'div', 'article', 'p', 'i', 'b', 'ul',
    'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'title', 'style',
    'head', 'html', 'body', 'span'];
for (let tag of htmlTag) {
    stringfplus.addBIF({
        name: tag,
        argname: 'farg',
        code_head: `@@{
        echo("<` + tag + `");
        if (farg != null)
        for (let k of Object.keys(farg)) {
            if (farg[k] != null)
            echo(' ' + k + '="' + farg[k]+'"');
            else
            echo(' ' + k);
        }
        echo('>');}`,
        code_tail: '@@{echo("</' + tag + '>")}',
    });
}
stringfplus.addBIF({
    name: 'img',
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
