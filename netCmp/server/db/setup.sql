--to enable database in PHP, see: https://justcheckingonall.wordpress.com/2008/02/09/how-to-enable-mysql-in-php5-on-windows/

--create database for this project
create database netcmp;

--create admin user to access only this database
create user 'cmpadmin'@'localhost' identified by 'hu6r6a1196ku552n';
grant all privileges on netcmp.* to 'cmpadmin'@'localhost' identified by 'hu6r6a1196ku552n';

--setup encryption/decryption key constant, see: http://thinkdiff.net/mysql/encrypt-mysql-data-using-aes-techniques/
--set @NetCmpEncCert = 'gHrRrrrY71xabYHh366101uuip7909gGi';

--create result entity type constants
set @NetCmpRET_Blk = 2;		--block
set @NetCmpRET_Scp = 3;		--scope
set @NetCmpRET_Cmd = 4;		--command
set @NetCmpRET_Symb = 5;	--symbol
set @NetCmpRET_Type = 6;	--type
set @NetCmpRET_Val = 7;		--value
set @NetCmpRET_Func = 10;	--functinoid
set @NetCmpRET_Prg = 11;	--program
set @NetCmpRET_Token = 99;	--token
set @NetCmpRET_Error = 98;	--error

--create scope type constants
set @NetCmpScp_Func = 1;	--scope: functinoid
set @NetCmpScp_Cond = 2;	--scope: condition
set @NetCmpScp_While = 3;	--scope: while loop
set @NetCmpScp_Obj = 4;		--scope: object definition
set @NetCmpScp_Glob = 5;	--scope: global
set @NetCmpScp_Foreach = 6;	--scope: foreach loop

--create command type constants
set @NetCmpCmd_Nop = 1;		--command: nop
set @NetCmpCmd_Push = 2;	--command: push
set @NetCmpCmd_Pop = 3;		--command: pop
set @NetCmpCmd_Null = 4;	--command: null
set @NetCmpCmd_Load = 5;	--command: load
set @NetCmpCmd_Store = 6;	--command: store
set @NetCmpCmd_Adda = 7;	--command: adda
set @NetCmpCmd_Ret = 8;		--command: return
set @NetCmpCmd_Phi = 9;		--command: phi
set @NetCmpCmd_Add = 10;	--command: add
set @NetCmpCmd_Sub = 11;	--command: sub
set @NetCmpCmd_Mul = 12;	--command: mul
set @NetCmpCmd_Div = 13;	--command: div
set @NetCmpCmd_Mod = 14;	--command: mod
set @NetCmpCmd_Cmd = 15;	--command: cmp
set @NetCmpCmd_Beq = 16;	--command: beq
set @NetCmpCmd_Bgt = 17;	--command: bgt
set @NetCmpCmd_Ble = 18;	--command: ble
set @NetCmpCmd_Blt = 19;	--command: blt
set @NetCmpCmd_Bne = 20;	--command: bne
set @NetCmpCmd_Bge = 21;	--command: bge
set @NetCmpCmd_Bra = 22;	--command: bra
set @NetCmpCmd_Call = 24;	--command: call
set @NetCmpCmd_Extern = 25;	--command: external
set @NetCmpCmd_Quit = 27;	--command: exit
set @NetCmpCmd_IsNext = 28;	--command: isNext
set @NetCmpCmd_Next = 29;	--command: next

--create symbol type constants
set @NetCmpSymb_Singleton = 1;	--symbol: singleton
set @NetCmpSymb_Array = 2;		--symbol: array
set @NetCmpSymb_Tree = 3;		--symbol: b+ tree

--create object type constants
set @NetCmpType_Void = 1;	--type: void
set @NetCmpType_Int = 2;	--type: integer
set @NetCmpType_Real = 3;	--type: real
set @NetCmpType_Text = 4;	--type: text
set @NetCmpType_Bool = 5;	--type: boolean
set @NetCmpType_Array = 6;	--type: array
set @NetCmpType_Tree = 7;	--type: b+ tree
set @NetCmpType_Drw = 8;	--type: drawing
set @NetCmpType_Custom = 9;	--type: custom
set @NetCmpType_Point = 10;	--type: point
set @NetCmpType_Dt = 11;	--type: datetime
set @NetCmpType_FP = 12;	--type: file properties
set @NetCmpType_File = 13;	--type: file
set @NetCmpType_Timer = 14;	--type: timer
set @NetCmpType_Math = 15;	--type: math
set @NetCmpType_Cast = 16;	--type: cast

--file permissions
set @NetCmpFile_Perm_Read = 1;		--perm: read
set @NetCmpFile_Perm_Write = 2;		--perm: write
set @NetCmpFile_Perm_Delete = 4;	--perm: delete
set @NetCmpFile_Perm_Move = 8;		--perm: move/rename

--file type
set @NetCmpFile_Type_Text = 1;	--file type: text file
set @NetCmpFile_Type_Image = 2;	--file type: image file
set @NetCmpFile_Type_Code = 3;	--file type: code file
set @NetCmpFile_Type_Cfg = 4;	--file type: CFG (control flow graph)

--error type
set @NetCmpError_Type_Lex = 1;		--error type: lexer
set @NetCmpError_Type_Pars = 2;		--error type: parser
set @NetCmpError_Type_PreProc = 3;	--error type: preprocessor
set @NetCmpError_Type_Interp = 4;	--error type: interpreter
set @NetCmpError_Type_Lib = 5;		--error type: library
set @NetCmpError_Type_Viz = 6;		--error type: visualizer

--token type
set @NetCmpToken_Type_IntType = 1;		--token type: integer type keyword
set @NetCmpToken_Type_TextType = 2;		--token type: text string type keyword
set @NetCmpToken_Type_BoolType = 3;		--token type: boolean type keyword
set @NetCmpToken_Type_ArrType = 4;		--token type: array type keyword
set @NetCmpToken_Type_TreeType = 5;		--token type: B+ tree type keyword
set @NetCmpToken_Type_VoidType = 6;		--token type: void type keyword
set @NetCmpToken_Type_RealType = 7;		--token type: real type keyword
set @NetCmpToken_Type_Function = 8;		--token type: function
set @NetCmpToken_Type_Object = 9;		--token type: object
set @NetCmpToken_Type_True = 10;		--token type: true value
set @NetCmpToken_Type_False = 11;		--token type: false value
set @NetCmpToken_Type_Number = 12;		--token type: numeric value
set @NetCmpToken_Type_Text = 13;		--token type: text string value
set @NetCmpToken_Type_NullArray = 14;	--token type: empty array value
set @NetCmpToken_Type_Real = 16;		--token type: real value
set @NetCmpToken_Type_NewLine = 17;		--token type: new line
set @NetCmpToken_Type_DoubleQuote = 18;	--token type: double quote
set @NetCmpToken_Type_SingleQuote = 19;	--token type: single quote
set @NetCmpToken_Type_Var = 20;			--token type: var keyword
set @NetCmpToken_Type_Let = 21;			--token type: let keyword
set @NetCmpToken_Type_If = 22;			--token type: if keyword
set @NetCmpToken_Type_Else = 23;		--token type: else keyword
set @NetCmpToken_Type_While = 24;		--token type: while keyword
set @NetCmpToken_Type_Return = 25;		--token type: return keyword
set @NetCmpToken_Type_Break = 26;		--token type: break keyword
set @NetCmpToken_Type_Continue = 27;	--token type: continue keyword
set @NetCmpToken_Type_Call = 28;		--token type: call keyword
set @NetCmpToken_Type_Foreach = 29;		--token type: foreach keyword
set @NetCmpToken_Type_Less = 30;		--token type: less operator
set @NetCmpToken_Type_LessEq = 31;		--token type: less or equal operator
set @NetCmpToken_Type_Greater = 32;		--token type: greater operator
set @NetCmpToken_Type_GreaterEq = 33;	--token type: greater or equal operator
set @NetCmpToken_Type_Eq = 34;			--token type: equal operator
set @NetCmpToken_Type_Neq = 35;			--token type: not equal operator
set @NetCmpToken_Type_And = 36;			--token type: and operator
set @NetCmpToken_Type_Or = 37;			--token type: or operator
set @NetCmpToken_Type_Add = 38;			--token type: plus operator
set @NetCmpToken_Type_Sub = 39;			--token type: minus operator
set @NetCmpToken_Type_Div = 40;			--token type: divide operator
set @NetCmpToken_Type_Mul = 41;			--token type: multiply operator
set @NetCmpToken_Type_Mod = 42;			--token type: modular operator
set @NetCmpToken_Type_ArrOpen = 43;		--token type: array open bracket
set @NetCmpToken_Type_ArrClose = 44;	--token type: array close bracket
set @NetCmpToken_Type_ParanOpen = 45;	--token type: paranthesis open
set @NetCmpToken_Type_ParanClose = 46;	--token type: paranthesis close
set @NetCmpToken_Type_CodeOpen = 47;	--token type: code open bracket
set @NetCmpToken_Type_CodeClose = 48;	--token type: code close bracket
set @NetCmpToken_Type_Comma = 49;		--token type: comma
set @NetCmpToken_Type_SemiColon = 50;	--token type: semicolon
set @NetCmpToken_Type_Equal = 51;		--token type: equal
set @NetCmpToken_Type_Colon = 52;		--token type: colon
set @NetCmpToken_Type_Period = 53;		--token type: period
set @NetCmpToken_Type_TmplOpen = 54;		--token type: template open bracket
set @NetCmpToken_Type_TmplClose = 55;	--token type: template close bracket
set @NetCmpToken_Type_CommentStart = 60;	--token type: comment start
set @NetCmpToken_Type_CommentEnd = 61;	--token type: comment close
set @NetCmpToken_Type_Comment = 62;		--token type: line comment
set @NetCmpToken_Type_Error = 63;		--token type: error

--plane features
set @NetCmpFeaturePlan_Type_UseFileMgmt = 1;
set @NetCmpFeaturePlan_Type_HaveUpto1Gb = 2;
set @NetCmpFeaturePlan_Type_HaveUpto2Gb = 3;
set @NetCmpFeaturePlan_Type_HaveUpto3Gb = 4;
set @NetCmpFeaturePlan_Type_HaveUpto4Gb = 5;
set @NetCmpFeaturePlan_Type_UseDbg = 6;
set @NetCmpFeaturePlan_Type_DeclareCustomTypes = 7;
set @NetCmpFeaturePlan_Type_DeclareUpto1CustomType = 8;
set @NetCmpFeaturePlan_Type_DeclareUpto5CustomTypes = 9;
set @NetCmpFeaturePlan_Type_DeclareUpto10CustomTypes = 10;
set @NetCmpFeaturePlan_Type_DeclareIndefiniteCustomTypes = 11;
set @NetCmpFeaturePlan_Type_UseForeachLoop = 12;
set @NetCmpFeaturePlan_Type_RevisionScope = 13;
set @NetCmpFeaturePlan_Type_RevisionBlock = 14;
set @NetCmpFeaturePlan_Type_RevisionCommand = 15;
set @NetCmpFeaturePlan_Type_RevisionSymbol = 16;
set @NetCmpFeaturePlan_Type_RevisionType = 17;
set @NetCmpFeaturePlan_Type_RevisionFunc = 18;
set @NetCmpFeaturePlan_Type_AllowUploadDownloadTextFiles = 19;
set @NetCmpFeaturePlan_Type_AllowUploadDownloadImageFiles = 20;
set @NetCmpFeaturePlan_Type_AllowDownloadCodeFile = 21;
set @NetCmpFeaturePlan_Type_AllowCreateMultipleCodeFilesInProject = 22;

--create function type constants
set @NetCmpFunc_Ctor = 1;			--function: default ctor
--todo: add remaining, there are alot...

--create NetCmp tables

--parser: scope
create table `netcmp_prs_scope` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`prn_id` BIGINT UNSIGNED,
`res_ent_type` INT UNSIGNED NOT NULL,
`type` INT UNSIGNED NULL,
`name` VARCHAR(512) NULL,
`obj_id` BIGINT UNSIGNED NULL,
`prg_id` BIGINT UNSIGNED NULL,
`start_blk_id` BIGINT UNSIGNED NOT NULL,
`end_blk_id` BIGINT UNSIGNED NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--many-to-many (M2M): symbol to command
create table `netcmp_prs_symb_to_cmd` (
`symb_id` BIGINT UNSIGNED NOT NULL,
`cmd_id` BIGINT UNSIGNED NOT NULL,
`is_use` TINYINT(1) DEFAULT 0 NOT NULL,
`order` INT NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`symb_id`, `cmd_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: block
create table `netcmp_prs_block` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`prn_id` BIGINT UNSIGNED,
`res_ent_type` INT UNSIGNED NOT NULL,
`type` INT UNSIGNED NULL,
`name` VARCHAR(512) NULL,
`related_scope_id` BIGINT UNSIGNED NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: block to block connection
create table `netcmp_prs_b2b` (
`source_id` BIGINT UNSIGNED NOT NULL,
`dest_id` BIGINT UNSIGNED NOT NULL,
`is_jump` TINYINT(1) DEFAULT 0 NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`source_id`, `dest_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: command used by command (command to command)
create table `netcmp_prs_c2c` (
`owner_id` BIGINT UNSIGNED NOT NULL,
`child_id` BIGINT UNSIGNED NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`owner_id`, `child_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: command to argument
create table `netcmp_prs_c2a` (
`owner_id` BIGINT UNSIGNED NOT NULL,
`arg_type` INT UNSIGNED NOT NULL,
`arg_id` BIGINT UNSIGNED NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`owner_id`, `arg_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: type to field
create table `netcmp_prs_type_to_field` (
`type_id` BIGINT UNSIGNED NOT NULL,
`field_name` VARCHAR(512) NOT NULL,
`field_type` BIGINT NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`type_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: type to template
create table `netcmp_prs_type_to_tmpl` (
`type_id` BIGINT UNSIGNED NOT NULL,
`tmpl_name` VARCHAR(512) NOT NULL,
`tmpl_type_id` BIGINT NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`type_id`, `tmpl_type_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: functinoid
create table `netcmp_prs_func` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`prn_id` BIGINT UNSIGNED,
`res_ent_type` INT UNSIGNED NOT NULL,
`type` INT UNSIGNED NULL,
`name` VARCHAR(512) NULL,
`ret_type_id` BIGINT UNSIGNED NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: func to func arg
create table `netcmp_prs_func_to_func_arg` (
`func_id` BIGINT UNSIGNED NOT NULL,
`arg_name` VARCHAR(512) NOT NULL,
`arg_type_id` BIGINT NOT NULL,
`arg_cmd_id` BIGINT NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`func_id`, `arg_type_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: general schema for value, command, symbol, type
create table `netcmp_prs_gen_entity` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`prn_id` BIGINT UNSIGNED,
`res_ent_type` INT UNSIGNED NOT NULL,
`type` INT UNSIGNED NULL,
`name` VARCHAR(512) NULL,
`ret_type_id` BIGINT UNSIGNED NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: program
create table `netcmp_prs_prog` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`res_ent_type` INT UNSIGNED NOT NULL,
`name` VARCHAR(512) NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--cfg
create table `netcmp_cfg` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`owner_id` BIGINT UNSIGNED NOT NULL,
`file_id` BIGINT UNSIGNED NOT NULL,
PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--parser: program to resource
create table `netcmp_prs_prog_to_resource` (
`prog_id` BIGINT UNSIGNED NOT NULL,
`res_id` BIGINT NOT NULL,
`line_num` BIGINT NOT NULL,
`pos_in_line` BIGINT NOT NULL,
`res_ent_type` INT NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`prog_id`, `res_id`, `res_ent_type`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--file managment: file
create table `netcmp_file_mgmt_file` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`name` VARCHAR(512) NOT NULL,
`dir_id` BIGINT UNSIGNED NOT NULL,
`created` DATETIME NOT NULL DEFAULT NOW(),
`modified` DATETIME NOT NULL DEFAULT NOW(),
`perm` INT NOT NULL DEFAULT 0,
`owner_id` BIGINT UNSIGNED NOT NULL,
`type` INT UNSIGNED NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--file managment: file to resource
create table `netcmp_file_mgmt_file_to_resource` (
`file_id` BIGINT NOT NULL,
`res_id` BIGINT NOT NULL,
`res_ent_type` INT NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`file_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--file managment: directory
create table `netcmp_file_mgmt_directory` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`prn_id` BIGINT UNSIGNED,
`name` VARCHAR(512) NOT NULL,
`created` DATETIME NOT NULL,
`modified` DATETIME NOT NULL,
`perm` INT UNSIGNED NOT NULL,
`owner_id` BIGINT NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY (`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--error
create table `netcmp_error` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`msg` VARCHAR(1024) NOT NULL,
`type` INT NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--lexer: token
create table `netcmp_token` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`type` INT UNSIGNED NOT NULL,
`text` VARCHAR(512) NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--for encrypted fields do this:
--`first_name` VARBINARY(100) NULL ,
--see: http://thinkdiff.net/mysql/encrypt-mysql-data-using-aes-techniques/
--AES_ENCRYPT(str, key_str);
--AES_DECRYPT(crypt_str,key_str);

create table `netcmp_google_api` (
`img_file_id` VARCHAR(1024) NULL,
`txt_file_id` VARCHAR(1024) NULL,
`access_token` VARCHAR(1024) NULL,
`modified` DATETIME NULL
);

--access: user
create table `netcmp_access_user` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`name` VARCHAR(1024) NOT NULL,
`email` VARCHAR(1024) NOT NULL,
`created` DATETIME NOT NULL,
`modified` DATETIME NOT NULL,
`pwd` VARBINARY(200) NOT NULL,
`logo` BIGINT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--access: user to question
create table `netcmp_access_user_to_qst` (
`user_id` BIGINT UNSIGNED NOT NULL,
`qst_id` BIGINT NOT NULL,
`qst_answer` VARCHAR(512) NOT NULL,
`created` DATETIME NOT NULL,
`modified` DATETIME NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`user_id`, `qst_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--access: question
create table `netcmp_access_qst` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`text` VARCHAR(1024) NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--access: account plan feature
create table `netcmp_access_plan_feature` (
`id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
`type` INT UNSIGNED NOT NULL,
`price` BIGINT UNSIGNED NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;

--access: account plan feature to user
create table `netcmp_access_plan_feature_to_user` (
`user_id` BIGINT UNSIGNED NOT NULL,
`feature_id` BIGINT NOT NULL,
`created` DATETIME NOT NULL,
`modified` DATETIME NOT NULL,
`suspend` TINYINT(1) DEFAULT 0 NOT NULL,
PRIMARY KEY(`user_id`, `feature_id`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8
COLLATE = utf8_general_ci;