/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ([
/* 0 */,
/* 1 */
/***/ ((module) => {

module.exports = require("@nestjs/core");

/***/ }),
/* 2 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppModule = void 0;
const common_1 = __webpack_require__(3);
const agent_controller_1 = __webpack_require__(4);
const microservices_1 = __webpack_require__(5);
const config_service_1 = __webpack_require__(6);
const swagger_1 = __webpack_require__(9);
const companion_controller_1 = __webpack_require__(10);
const config_1 = __webpack_require__(25);
const dbconnection_module_1 = __webpack_require__(26);
const companion_1 = __webpack_require__(17);
const typeorm_naming_strategies_1 = __webpack_require__(28);
const axios_1 = __webpack_require__(29);
const ai_core_1 = __webpack_require__(11);
const auth_1 = __webpack_require__(30);
const entities = [companion_1.Companion];
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            microservices_1.ClientsModule.register([
                {
                    name: config_service_1.configService.getServiceConfigs().agentService.name,
                    transport: microservices_1.Transport.TCP,
                    options: config_service_1.configService.getServiceConfigs().agentService.options
                },
                {
                    name: config_service_1.configService.getServiceConfigs().companionService.name,
                    transport: microservices_1.Transport.TCP,
                    options: config_service_1.configService.getServiceConfigs().companionService.options
                }
            ]),
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            dbconnection_module_1.DBConnectionModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('POSTGRES_HOST'),
                    port: +(configService.get('POSTGRES_PORT') || 5432),
                    username: configService.get('POSTGRES_USER'),
                    password: configService.get('POSTGRES_PASSWORD'),
                    database: configService.get('POSTGRES_DB'),
                    synchronize: false,
                    dropSchema: false,
                    logging: false,
                    logger: 'file',
                    installExtensions: true,
                    useUTC: true,
                    entities: entities,
                    namingStrategy: new typeorm_naming_strategies_1.SnakeNamingStrategy()
                }),
                inject: [config_1.ConfigService]
            }),
            swagger_1.SwaggerModule,
            axios_1.HttpModule,
            auth_1.AuthModule
        ],
        controllers: [agent_controller_1.AgentController, companion_controller_1.CompanionController],
        providers: [ai_core_1.CompanionService],
        exports: []
    })
], AppModule);


/***/ }),
/* 3 */
/***/ ((module) => {

module.exports = require("@nestjs/common");

/***/ }),
/* 4 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AgentController = void 0;
const common_1 = __webpack_require__(3);
const microservices_1 = __webpack_require__(5);
const config_service_1 = __webpack_require__(6);
const rxjs_1 = __webpack_require__(8);
let AgentController = class AgentController {
    agentClient;
    constructor(agentClient) {
        this.agentClient = agentClient;
    }
    sayHello() {
        return this.agentClient.send('hello', {});
    }
};
exports.AgentController = AgentController;
__decorate([
    (0, common_1.Get)('hello'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", typeof (_b = typeof rxjs_1.Observable !== "undefined" && rxjs_1.Observable) === "function" ? _b : Object)
], AgentController.prototype, "sayHello", null);
exports.AgentController = AgentController = __decorate([
    (0, common_1.Controller)('agent'),
    __param(0, (0, common_1.Inject)(config_service_1.configService.getServiceConfigs().companionService.name)),
    __metadata("design:paramtypes", [typeof (_a = typeof microservices_1.ClientProxy !== "undefined" && microservices_1.ClientProxy) === "function" ? _a : Object])
], AgentController);


/***/ }),
/* 5 */
/***/ ((module) => {

module.exports = require("@nestjs/microservices");

/***/ }),
/* 6 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.configService = void 0;
(__webpack_require__(7).config)();
class ConfigService {
    env;
    constructor(env) {
        this.env = env;
    }
    getServiceConfigs() {
        return {
            agentService: {
                name: 'AGENT_SERVICE',
                options: {
                    host: this.env['AGENT_SERVCE_HOST'] || '0.0.0.0',
                    port: parseInt(this.env['AGENT_SERVCE_PORT'] || '', 10) || 3001
                }
            },
            apiGateawayService: {
                name: 'APIGATEWAY_SERVICE',
                options: {
                    host: this.env['APIGATEWAY_SERVCE_HOST'] || '0.0.0.0',
                    port: parseInt(this.env['APIGATEWAY_SERVCE_PORT'] || '', 10) || 3002
                }
            },
            companionService: {
                name: 'COMPANION_SERVICE',
                options: {
                    host: this.env['COMPANION_SERVCE_HOST'] || '0.0.0.0',
                    port: parseInt(this.env['COMPANION_SERVCE_PORT'] || '', 10) || 3003
                }
            }
        };
    }
}
const configService = new ConfigService(process.env);
exports.configService = configService;


/***/ }),
/* 7 */
/***/ ((module) => {

module.exports = require("dotenv");

/***/ }),
/* 8 */
/***/ ((module) => {

module.exports = require("rxjs");

/***/ }),
/* 9 */
/***/ ((module) => {

module.exports = require("@nestjs/swagger");

/***/ }),
/* 10 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompanionController = void 0;
const ai_core_1 = __webpack_require__(11);
const companion_dto_1 = __webpack_require__(20);
const jwt_authguard_1 = __webpack_require__(23);
const common_1 = __webpack_require__(3);
let CompanionController = class CompanionController {
    companionService;
    constructor(companionService) {
        this.companionService = companionService;
    }
    async getCompanions(pageOptionsDto) {
        return this.companionService.getCompanions(pageOptionsDto);
    }
};
exports.CompanionController = CompanionController;
__decorate([
    (0, common_1.UseGuards)(jwt_authguard_1.JwtAuthGuard),
    (0, common_1.Post)('list'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [typeof (_b = typeof companion_dto_1.CompanionPaginationDto !== "undefined" && companion_dto_1.CompanionPaginationDto) === "function" ? _b : Object]),
    __metadata("design:returntype", Promise)
], CompanionController.prototype, "getCompanions", null);
exports.CompanionController = CompanionController = __decorate([
    (0, common_1.Controller)('api/v1/companion'),
    __metadata("design:paramtypes", [typeof (_a = typeof ai_core_1.CompanionService !== "undefined" && ai_core_1.CompanionService) === "function" ? _a : Object])
], CompanionController);


/***/ }),
/* 11 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(12), exports);


/***/ }),
/* 12 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompanionService = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(13);
const paginate_1 = __webpack_require__(14);
const companion_1 = __webpack_require__(17);
const constant_1 = __webpack_require__(19);
const page_meta_1 = __webpack_require__(16);
let CompanionService = class CompanionService {
    dataSource;
    constructor(dataSource) {
        this.dataSource = dataSource;
    }
    async getCompanions(pageOptionsDto) {
        try {
            let queryBuilder = this.dataSource.createQueryBuilder(companion_1.Companion, 'p');
            const itemCount = await queryBuilder.getCount();
            queryBuilder
                .orderBy('p.updated_at', constant_1.Order.DESC)
                .skip((+pageOptionsDto.page - 1) * +pageOptionsDto.take)
                .take(+pageOptionsDto.take);
            const { entities } = await queryBuilder.getRawAndEntities();
            const pageMetaDto = new page_meta_1.PageMeta({ itemCount, pageOptionsDto });
            return new paginate_1.Paginate(entities, pageMetaDto);
        }
        catch (error) {
            return error;
        }
    }
};
exports.CompanionService = CompanionService;
exports.CompanionService = CompanionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], CompanionService);


/***/ }),
/* 13 */
/***/ ((module) => {

module.exports = require("typeorm");

/***/ }),
/* 14 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Paginate = void 0;
const swagger_1 = __webpack_require__(9);
const class_validator_1 = __webpack_require__(15);
const page_meta_1 = __webpack_require__(16);
class Paginate {
    data;
    meta;
    constructor(data, meta) {
        this.data = data;
        this.meta = meta;
    }
}
exports.Paginate = Paginate;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, swagger_1.ApiProperty)({ isArray: true }),
    __metadata("design:type", Array)
], Paginate.prototype, "data", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: () => page_meta_1.PageMeta }),
    __metadata("design:type", typeof (_a = typeof page_meta_1.PageMeta !== "undefined" && page_meta_1.PageMeta) === "function" ? _a : Object)
], Paginate.prototype, "meta", void 0);


/***/ }),
/* 15 */
/***/ ((module) => {

module.exports = require("class-validator");

/***/ }),
/* 16 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PageMeta = void 0;
const swagger_1 = __webpack_require__(9);
class PageMeta {
    page;
    take;
    itemCount;
    pageCount;
    hasPreviousPage;
    hasNextPage;
    constructor({ pageOptionsDto, itemCount }) {
        this.page = pageOptionsDto.page;
        this.take = pageOptionsDto.take;
        this.itemCount = itemCount;
        this.pageCount = Math.ceil(this.itemCount / this.take);
        this.hasPreviousPage = this.page > 1;
        this.hasNextPage = this.page < this.pageCount;
    }
}
exports.PageMeta = PageMeta;
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PageMeta.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PageMeta.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PageMeta.prototype, "itemCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Number)
], PageMeta.prototype, "pageCount", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], PageMeta.prototype, "hasPreviousPage", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    __metadata("design:type", Boolean)
], PageMeta.prototype, "hasNextPage", void 0);


/***/ }),
/* 17 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Companion = void 0;
const typeorm_1 = __webpack_require__(13);
const enum_1 = __webpack_require__(18);
let Companion = class Companion {
    id;
    provider;
    aiUsage;
    avatarPath;
    cacheMessageLimit;
    description;
    features;
    featureDescription;
    intro;
    isPublished;
    messageLimitPerDay;
    createdAt;
    model;
    name;
    prompt;
    temperature;
    persona;
    shortDescription;
    updatedAt;
    questions;
};
exports.Companion = Companion;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Companion.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'text',
        name: 'aiprovider'
    }),
    __metadata("design:type", typeof (_a = typeof enum_1.LLMProvider !== "undefined" && enum_1.LLMProvider) === "function" ? _a : Object)
], Companion.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "aiUsage", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "avatarPath", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", Number)
], Companion.prototype, "cacheMessageLimit", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true }),
    __metadata("design:type", Array)
], Companion.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "featureDescription", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "intro", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean' }),
    __metadata("design:type", Boolean)
], Companion.prototype, "isPublished", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int4' }),
    __metadata("design:type", Number)
], Companion.prototype, "messageLimitPerDay", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_b = typeof Date !== "undefined" && Date) === "function" ? _b : Object)
], Companion.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "model", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "prompt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float4' }),
    __metadata("design:type", Number)
], Companion.prototype, "temperature", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "persona", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Companion.prototype, "shortDescription", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", typeof (_c = typeof Date !== "undefined" && Date) === "function" ? _c : Object)
], Companion.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)('text', { array: true }),
    __metadata("design:type", Array)
], Companion.prototype, "questions", void 0);
exports.Companion = Companion = __decorate([
    (0, typeorm_1.Entity)({ name: 'companions' })
], Companion);


/***/ }),
/* 18 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));


/***/ }),
/* 19 */
/***/ ((__unused_webpack_module, exports) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.Order = void 0;
var Order;
(function (Order) {
    Order["ASC"] = "ASC";
    Order["DESC"] = "DESC";
})(Order || (exports.Order = Order = {}));


/***/ }),
/* 20 */
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {


Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CompanionPaginationDto = void 0;
const page_options_1 = __webpack_require__(21);
class CompanionPaginationDto extends page_options_1.PageOptionsDto {
}
exports.CompanionPaginationDto = CompanionPaginationDto;


/***/ }),
/* 21 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PageOptionsDto = void 0;
const swagger_1 = __webpack_require__(9);
const class_transformer_1 = __webpack_require__(22);
const class_validator_1 = __webpack_require__(15);
const constant_1 = __webpack_require__(19);
class PageOptionsDto {
    order = constant_1.Order.ASC;
    page = 1;
    take = 10;
    keyword;
    get skip() {
        return (this.page - 1) * this.take;
    }
}
exports.PageOptionsDto = PageOptionsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: constant_1.Order, default: constant_1.Order.ASC }),
    (0, class_validator_1.IsEnum)(constant_1.Order),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", typeof (_a = typeof constant_1.Order !== "undefined" && constant_1.Order) === "function" ? _a : Object)
], PageOptionsDto.prototype, "order", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        minimum: 1,
        default: 1
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PageOptionsDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        minimum: 1,
        default: 10
    }),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Number)
], PageOptionsDto.prototype, "take", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ type: 'string', default: '' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", String)
], PageOptionsDto.prototype, "keyword", void 0);


/***/ }),
/* 22 */
/***/ ((module) => {

module.exports = require("class-transformer");

/***/ }),
/* 23 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.JwtAuthGuard = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(24);
let JwtAuthGuard = class JwtAuthGuard extends (0, passport_1.AuthGuard)('oauth2') {
    async canActivate(context) {
        console.log('JwtAuthGuard canActivate is being called');
        const request = context.switchToHttp().getRequest();
        return (await super.canActivate(context));
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = __decorate([
    (0, common_1.Injectable)()
], JwtAuthGuard);


/***/ }),
/* 24 */
/***/ ((module) => {

module.exports = require("@nestjs/passport");

/***/ }),
/* 25 */
/***/ ((module) => {

module.exports = require("@nestjs/config");

/***/ }),
/* 26 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var DBConnectionModule_1;
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DBConnectionModule = void 0;
const common_1 = __webpack_require__(3);
const typeorm_1 = __webpack_require__(27);
let DBConnectionModule = DBConnectionModule_1 = class DBConnectionModule {
    static forRoot(options) {
        return {
            module: DBConnectionModule_1,
            imports: [typeorm_1.TypeOrmModule.forRoot(options)],
            exports: [typeorm_1.TypeOrmModule]
        };
    }
    static forRootAsync(options) {
        return {
            module: DBConnectionModule_1,
            imports: [typeorm_1.TypeOrmModule.forRootAsync(options)],
            exports: [typeorm_1.TypeOrmModule]
        };
    }
    static forFeature(entities = []) {
        return {
            module: DBConnectionModule_1,
            imports: [typeorm_1.TypeOrmModule.forFeature(entities)],
            exports: [typeorm_1.TypeOrmModule]
        };
    }
};
exports.DBConnectionModule = DBConnectionModule;
exports.DBConnectionModule = DBConnectionModule = DBConnectionModule_1 = __decorate([
    (0, common_1.Module)({})
], DBConnectionModule);


/***/ }),
/* 27 */
/***/ ((module) => {

module.exports = require("@nestjs/typeorm");

/***/ }),
/* 28 */
/***/ ((module) => {

module.exports = require("typeorm-naming-strategies");

/***/ }),
/* 29 */
/***/ ((module) => {

module.exports = require("@nestjs/axios");

/***/ }),
/* 30 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(31), exports);


/***/ }),
/* 31 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AuthModule = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(24);
const custom_strategy_1 = __webpack_require__(32);
let AuthModule = class AuthModule {
};
exports.AuthModule = AuthModule;
exports.AuthModule = AuthModule = __decorate([
    (0, common_1.Module)({
        imports: [passport_1.PassportModule.register({ defaultStrategy: 'oauth2' })],
        providers: [custom_strategy_1.LovingleeStrategy],
        exports: [passport_1.PassportModule]
    })
], AuthModule);


/***/ }),
/* 32 */
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {


var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.LovingleeStrategy = void 0;
const common_1 = __webpack_require__(3);
const passport_1 = __webpack_require__(24);
const google_auth_library_1 = __webpack_require__(33);
const jwt_decode_1 = __webpack_require__(34);
const passport_custom_1 = __webpack_require__(35);
const appleSigninAuth = __webpack_require__(36);
let LovingleeStrategy = class LovingleeStrategy extends (0, passport_1.PassportStrategy)(passport_custom_1.Strategy, 'oauth2') {
    client;
    constructor() {
        super();
        this.client = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    }
    async validate(req) {
        const authHeader = req.headers['authorization'];
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing or invalid Authorization header');
        }
        const idToken = authHeader.split(' ')[1];
        const provider = this.getProviderFromToken(idToken);
        try {
            if (provider === 'google') {
                return this.verifyGoogleToken(idToken);
            }
            if (provider === 'apple') {
                return this.verifyAppleToken(idToken);
            }
        }
        catch (err) {
            throw new common_1.UnauthorizedException('Invalid Google ID token');
        }
    }
    getProviderFromToken(token) {
        try {
            const decoded = (0, jwt_decode_1.jwtDecode)(token);
            if (decoded.iss === 'https://accounts.google.com')
                return 'google';
            if (decoded.iss === 'https://appleid.apple.com')
                return 'apple';
        }
        catch (e) {
        }
        return 'unknown';
    }
    async verifyGoogleToken(token) {
        const ticket = await this.client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.email_verified) {
            throw new common_1.UnauthorizedException('Invalid Google token');
        }
        return {
            provider: 'google',
            userId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture
        };
    }
    async verifyAppleToken(token) {
        const payload = await appleSigninAuth.verifyIdToken(token, {
            audience: process.env.APPLE_CLIENT_ID,
            ignoreExpiration: false
        });
        return {
            provider: 'apple',
            userId: payload.sub,
            email: payload.email,
            isPrivateEmail: payload.is_private_email
        };
    }
};
exports.LovingleeStrategy = LovingleeStrategy;
exports.LovingleeStrategy = LovingleeStrategy = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], LovingleeStrategy);


/***/ }),
/* 33 */
/***/ ((module) => {

module.exports = require("google-auth-library");

/***/ }),
/* 34 */
/***/ ((module) => {

module.exports = require("jwt-decode");

/***/ }),
/* 35 */
/***/ ((module) => {

module.exports = require("passport-custom");

/***/ }),
/* 36 */
/***/ ((module) => {

module.exports = require("apple-signin-auth");

/***/ })
/******/ 	]);
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
const core_1 = __webpack_require__(1);
const app_module_1 = __webpack_require__(2);
const swagger_1 = __webpack_require__(9);
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const config = new swagger_1.DocumentBuilder()
        .setTitle('Lovinglee API Service')
        .setDescription('API to expose all functionalities for Lovinglee')
        .setVersion('1.0')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, config);
    swagger_1.SwaggerModule.setup('swagger', app, document, {
        swaggerOptions: {
            initOAuth: {
                clientId: process.env.GOOGLE_CLIENT_ID
            }
        }
    });
    app.enableCors();
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

})();

/******/ })()
;