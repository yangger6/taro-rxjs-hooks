"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.find = void 0;
function find(node, type) {
    return node.find(function (node) { return node.type === type; });
}
exports.find = find;
//# sourceMappingURL=find.js.map