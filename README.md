stringfplus
===========

Stringf è una classe che gestisce la formattazione del testo.

Può essere usata per generare qualsiasi file di testo.
(txt,html,documenti)

plus è dovuto, rispetto alla classe base stringf, per il fatto di avere
supporto a codice js e altre funzioni particolari.

Creazione istanza

let mystr = **new**
**stringfplus**("stringa",opt?:{languageDefault?:'en\_gb',

throwOnMissing?:false,

languageFieldName?:'type',

languageId?:'language',

splitter?:'@@',

isHtml?:false});

// opt è opzionale, opzioni per la classe

//language è opzionale, il valore di defaultr è 'en\_gb', indica la
lingua di default per la compilazione

//splitter è opzionale e il valore di default è '@@', indica i caratteri
da cercare per effettuare la sostituzione/interpretazione dei valori

// throwOnMissing è opzionale e il valore di default è false. Indica se,
durante il format della stringa, deve generare degli errori nel caso
mancassero uno o più fields inseriti nella stringa di formata

// isHtml è opzionale e il valore di default è false. Indica se il testo
da formattare è html. Esegue l'escape delle stringhe quando si utilizza
@@field

// languageFieldName è opzionale e il valore di default è 'type'.

// languageId è opzionale e il valore di default è 'language'.

Per poter formattare correttamente un oggetto che contiene informazioni
sulla lingua, bisogna indicare come poter capire che tale oggetto è o
non è un oggetto da gestire come "lingua".

{

type:'language' derivato da =&gt; languageFieldName:languageId

en\_gb: any, //il codice è stato leggermente straformato per essere un
attributo valido.

...

}

lista codici lingua:
<https://msdn.microsoft.com/en-us/library/ee825488(v=cs.20).aspx>

per formattare il valore

let result = mystr.**format**(arg ,language = 'languageDefault');

//arg è un json/interface es. {test:'ciao'}

//language rappresenta la lingua in cui si vuole formattare la stringa,
default = languageDefault

console.log(result);

### Creare un 'codice' formattabile

Leggenda:

**\[separator\]**: valore del separatore, default '@@'

**arg**: oggetto passato alla funzione **format.**

Dentro le espressioni js si può accedere a questo oggetto direttamente.\
Esempio: arg.field.

**language**: oggetto passato alla funzione **format.**

Dentro le espressioni js si può accedere a questo oggetto direttamente.\
Esempio: @@if( language === 'en\_gb')....

**exp: **qualuqnue** **espressione js.

**text**: testo, stringa, che può essere formattato.

{}: oggetto/interface

\[separator\]field
==================

stampa il valore di **arg**.**field.**

**Esempio**:

**arg** = {test:'test',len:10};

**str** = \`questo è un @@test.

Il valore di len è \[@@len\]

\`;

let mystr = new stringfplus(str);

ler risultato = mystr.**format**(**arg**);

/\*il valore di risultato sarà:

questo è un test.

Il valore di len è \[10\]

\*/

\[separator\]echo(exp)
======================

stampa il valore di **exp **cosi com'è.

**Esempio**:

**arg** = {test:'test',len:10};

**str** = \`

@@echo("ciao")

@@echo(1 === 1)

\`;

let mystr = new stringfplus(str);

ler risultato = mystr.**format**(**arg**);

/\*il valore di risultato sarà:

ciao

true

\*/

\[separator\]if(exp){
=====================

text
====

}else{
======

text
====

}
=

Valuta l'espressione, se **true**, stampa il testo (e lo formatta se
necessario) tra le {}.

else, opzionale, nel caso l'espressione fosse **false**.

**Esempio**:

**arg** = {test:'test',len:10};

**str** = \`

@@if( @@len === 10 ){

il valore di len è 10

}else{

il valore di len è diverso da 10

}

@@if( arg.test === 'test' ){

il valore di test \[@@test\] fa schifo!

}

\`;

let mystr = new stringfplus(str);

ler risultato = mystr.**format**(**arg**);

/\*il valore di risultato sarà:

il valore di len è 10

il valore di test \[test\] fa schifo!

\*/

\[separator\]for(exp){
======================

text
====

}
=

Esegue un ciclo for js.

**Esempio**:

**arg** = {test:'test',len:10};

**str** = \`

@@for(let i =0;i&lt;arg.len;i++){

@@test:@echo(i)

}

\`;

let mystr = new stringfplus(str);

ler risultato = mystr.**format**(**arg**);

/\*il valore di risultato sarà:

test:0

test:1

test:2

test:3

test:4

test:5

test:6

test:7

test:8

test:9

\*/

\[separator\]{ exp }
====================

Esegue del codice js, cosi come viene fornito.

la funzione **echo **si può utilizzare per stampare qualcosa.

**arg** è disponibile.

**Esempio**:

**arg** = {test:'test',len:10};

**str** = \`

@@{

//il mio codice js!

If (arg.len &gt;10)

arg.len = 5; // ho modificato il valore di len

echo("ciao da {}");

if (@@len === 5) echo('io funziono!');

}

@@len

\`;

let mystr = new stringfplus(str);

ler risultato = mystr.**format**(**arg**);

/\*il valore di risultato sarà:

ciao da {}io funziono!

5

\*/

\[separator\]&lt;name:value,...,nameN:valueN&gt;
================================================

Imposta un valore di default per il **field** \[name\] con il valore
\[value\].

Con questo metodo è possibile impostare/creare **field**.

**Esempio**:

**arg** = {};

**str** = \`

@@&lt;len:0 , test:'test'&gt;

@@len

@@test

\`;

let mystr = new stringfplus(str);

ler risultato = mystr.**format**(**arg**);

/\*il valore di risultato sarà:

0

test

\*/

\[separator\]name({}){
======================

text
====

}
=

Esegue una funzione interna e passa un oggetto come parametro.

Text viene stampato dopo l'esecuzione della funzione, alcune funzioni
prevedono una parte di testo

finale da aggiungere, per questo bisogna utilizzare {}

**Esempio**:

**arg** = {test:'test',len:10};

**str** = \`

@@a({href:'\#top'}){

cliccami

}

\`;

let mystr = new stringfplus(str);

ler risultato = mystr.**format**(**arg**);

/\*il valore di risultato sarà:

&lt;a href="\#top"&gt;

cliccami

&lt;/a&gt;

\*/

Funzioni Html
=============

Hanno il nome del tag di origine, tutte le chiavi del parametro della
funzione vengono stampate nel tag html.
