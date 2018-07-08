import path from 'path';
import fs from 'fs';

import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {uglify} from 'rollup-plugin-uglify';

/**
 * get bundle config
*/
function getBundleConfig(_uglify, format, name, file, externalModules) {
    let plugins = [
        resolve(),
        babel({
            exclude: 'node_modules/**',
            plugins: ["external-helpers"]
        })
    ];
    if (_uglify)
        plugins.push(uglify());

    return {
        input: 'src/exports.js',
        output: {
            file: `dist/${_uglify? file + '.min' : file}.js`,
            format: format,
            name: name,
            interop: false,
        },
        plugins: plugins,
        external: externalModules
    };
}

function getModuleConfig(_uglify, src, dest, externals) {
    let plugins = [
        resolve(),
        babel({
            exclude: 'node_modules/**',
            plugins: ["external-helpers"]
        })
    ];
    if (_uglify)
        plugins.push(uglify());

    return {
        input: src,
        output: {
            file: dest + (_uglify? '.min.js' : '.js'),
            format: 'cjs',
            interop: false,
            //sourcemap: true
        },
        plugins: plugins,
        external: externals || []
    };
}

function getModules(dir) {
    let modules = [];
    fs.readdirSync(path.resolve(__dirname, dir)).forEach(file => {
        let filePath = path.resolve(__dirname, dir) + '/' + file;
        if (fs.statSync(filePath).isFile())
            modules.push({name: path.basename(filePath, '.js'), path: filePath});
        else
            modules.push(...getModules(filePath));
    });
    return modules;
}

let modules = getModules('src/modules'),
externalModules = modules.map(module => module.path);

let exports = modules.reduce((exports, module) => {
    let src = module.path,
    dest = 'dist/' + src.replace(/^.*\/src\//, '').replace(/\.js$/, '');

    let externals = externalModules.filter((externalModule) => externalModule !== src);
    exports.push(getModuleConfig(false, src, dest, externals));

    return exports;
}, []);

exports.push(getBundleConfig(false, 'cjs', '', 'main', externalModules));
exports.push(getBundleConfig(true, 'cjs', '', 'main', externalModules));

exports.push(getBundleConfig(false, 'iife', 'XMLSerializer', 'browser', []));
exports.push(getBundleConfig(true, 'iife', 'XMLSerializer', 'browser', []));

export default exports;