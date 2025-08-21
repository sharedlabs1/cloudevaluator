"use strict";
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
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generatePDF = generatePDF;
exports.generateCSV = generateCSV;
const csv_writer_1 = require("csv-writer");
const pdfkit_1 = __importDefault(require("pdfkit"));
async function generatePDF(data) {
    const doc = new pdfkit_1.default();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => { });
    doc.text(JSON.stringify(data, null, 2));
    doc.end();
    return new Promise((resolve) => {
        doc.on('end', () => {
            resolve(Buffer.concat(buffers));
        });
    });
}
async function generateCSV(data) {
    const csvWriter = (0, csv_writer_1.createObjectCsvWriter)({
        path: 'temp.csv',
        header: Object.keys(data[0] || {}).map((key) => ({ id: key, title: key })),
    });
    await csvWriter.writeRecords(data);
    const fs = await Promise.resolve().then(() => __importStar(require('fs/promises')));
    const csvBuffer = await fs.readFile('temp.csv');
    await fs.unlink('temp.csv');
    return csvBuffer;
}
//# sourceMappingURL=reportUtils.js.map