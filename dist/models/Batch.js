"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Batch = void 0;
const swagger_1 = require("@nestjs/swagger");
class Batch {
    constructor() {
        this.id = 0;
        this.name = '';
        this.createdAt = new Date();
        this.updatedAt = new Date();
        this.status = 'active';
    }
    static async count() {
        return 50;
    }
}
exports.Batch = Batch;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier for the batch', example: 1 }),
    __metadata("design:type", Number)
], Batch.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Name of the batch', example: 'Batch A' }),
    __metadata("design:type", String)
], Batch.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when the batch was created', example: '2025-08-19T12:34:56Z' }),
    __metadata("design:type", Date)
], Batch.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Date when the batch was last updated', example: '2025-08-19T12:34:56Z' }),
    __metadata("design:type", Date)
], Batch.prototype, "updatedAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Status of the batch', example: 'active', enum: ['active', 'completed', 'archived'], default: 'active' }),
    __metadata("design:type", String)
], Batch.prototype, "status", void 0);
//# sourceMappingURL=Batch.js.map