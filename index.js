/*
 * @Author: xiaokangzheng
 * @Date: 2019-12-07 10:57:52
 * @Last Modified by: xiaokangzheng
 * @Last Modified time: 2019-12-09 20:48:01
 */

const babel = require("babel-core");
const types = require("babel-types");
const FS = require("fs");
const PATH = require('path')


module.exports = function (babel) {
    return {
        visitor: {
            ImportDeclaration(path, ref = { opts: {} }) {
                let node = path.node;
                let { specifiers } = node;
                if (ref.opts.library === node.source.value
                    && !types.isImportDefaultSpecifier(specifiers[0])
                    && !types.isImportNamespaceSpecifier(specifiers[0])) {
                    let newImports = specifiers.map(specifier => {

                        let BYTOOLSPATH = PATH.resolve(__dirname, '../', node.source.value);

                        let PACKAGEPATH = PATH.resolve(BYTOOLSPATH, 'src/.internal/packages', specifier.local.name)

                        let ISPACKAGE = FS.existsSync(PACKAGEPATH);

                        if (ISPACKAGE) {
                            return types.importDeclaration([types.importSpecifier(specifier.local, specifier.local)], types.stringLiteral(`${node.source.value}/src/.internal/packages/${specifier.local.name}/index.ts`))
                        } else {
                            // 其他工具类
                            return types.importDeclaration([types.importDefaultSpecifier(specifier.local)], types.stringLiteral(`${node.source.value}/src/.internal/tools/${specifier.local.name}`))
                        }
                    });
                    path.replaceWithMultiple(newImports)
                }
            }
        }
    }
};
