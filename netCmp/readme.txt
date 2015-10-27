<<<<<<< HEAD
language:

letter = {a | ... | z | _ | A | ... | Z}
digit = {0 | ... | 9}
ident = letter {letter | digit}
intNumber = digit {digit}
floatNumber = intNumber . intNumber
strVal = "\"" {letter | digit | syntax} "\""
boolVal = {true | false}
relationalOp = {== | =< | => | > | < | !=}
constant = intNumber | floatNumber | boolVal | strVal
designator = ident { "[" {number | ident} "]" }
variable = designator { "." designator }
obj = variable | constant
factor = obj | "(" logicExp ")" | funcCall
modFactor = factor "mod" constant
term = modFactor {("*" | "/" ) modFactor}
exp = term {("+" | "-") term}
logicTerm = exp {"&&" exp}
logicExp = logicTerm {"||" logicTerm}
assignmentExp = designator "=" exp
assignment = "let" assignmentExp
funcArgList = logicExp { "," logicExp }
funcCall = "call" variable ":" ident "(" [ funcArgList ] ")"
ifStmt = "if" logicExp "{" stmtSeq "}" [ "else" "{" stmtSeq "}" ]
whileStmt = "while" logicExp "{" stmtSeq "}"
returnStmt = "return" [ logicExp ]
basicType = "bool" | "int" | "real" | "string"
typeName = basicType | ident
templateType = "array" "<" typeName ">" | "hash" "<" typeName "," typeName ">"
varType = basicType | templateType
varDeclStmt = "var" varType assignmentExp { "," assignmentExp } ";"
breakStmt = "break" ";"
continueStmt = "continue" ";"
stmt = assignment | funcCall | ifStmt | whileStmt | returnStmt | varDeclStmt | breakStmt | continueStmt
stmtSeq = stmt { ";" stmt }
objField = varDeclStmt | funcDecl
objDecl = "object" ident "{" objField { "," objField  "}" ";"
funcType = varType | "void"
funcParamElem = varType ident
funcParam = "(" [ funcParamElem { "," funcParamElem } ] ")"
funcDecl = funcType "function" ident funcParam "{" stmtSeq "}" ";"
includeStmt = "include" strVal ";"
startStmt = "start" ":" ident			//"ident" here refers to function name that takes no parameters and returns nothing, i.e. void main() {...}
program = includeStmt | funcDecl | objDecl | startStmt
=======
implementing lexer
------------------------------------------------------------
branch was merged, synced, tested, and closed on 2015-09-30.
>>>>>>> 80c7d55bb4acb4c22cd7a7bda6c3a9b9b3e10e97
