import path from 'path';
import fs from 'fs';

import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import {uglify} from 'rollup-plugin-uglify';

/**
 * returns the config for the given file
 *@param {boolean} _uglify - boolean value indicating if file should be minified
 *@param {string} format - the expected output format
 *@param {string} src - the file source directory
 *@param {string} dest - the file destination directory, omit the .js extension
 *@param {string} name - the file module name
 *@param {Array} externals - array of module externals
 *@returns {Object}
*/
function getConfig(_uglify, format, src, dest, name, externals) {
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
            format: format,
            name: name,
            interop: false,
            //sourcemap: true
        },
        plugins: plugins,
        external: externals || []
    };
}

/**
 * resolves the pattern into a regex object
 *@param {Array|string} patterns -array of patterns or string pattern
*/
function resolveRegex(patterns) {
    if (patterns === '*')
        return [new RegExp('.*')];

    if (Object.prototype.toString.call(patterns) === '[object Array]') {
        return patterns.map((pattern) => {
            pattern = pattern.replace(/\./g, '\.').replace(/\*{2}/g, '.*').replace(/\*/g, '[^/]+');
            return new RegExp(pattern, 'i');
        });
    }

    return [];
}

/**
 * gets all modules
 *@param {string} dir - the root module directory to iterate
 *@param {string} mainModuleName - the global module name for the main export file.
 * others are mapped to file names
 *@returns {Array}
*/
function getModules(dir, mainModuleName) {
    let modules = [];
    fs.readdirSync(path.resolve(__dirname, dir)).forEach(file => {
        let filePath = path.resolve(__dirname, dir) + '/' + file;
        if (fs.statSync(filePath).isFile()) {
            let name = path.basename(filePath, '.js');
            if(name === 'main')
                name = mainModuleName;

            modules.push({name: name, path: filePath});
        }
        else {
            modules.push(...getModules(filePath));
        }
    });
    return modules;
}

/**
 * returns the allowed exports for each build kind
 *@param {string} outDir - the out directory for the build kind
 *@param {string} format - the output format for all included modules in this build kind
 *@param {Array} modules - the modules list to build from
 *@param {Array} externalModules - array of external modules
 *@returns {Array}
*/
function getExports(outDir, format, uglify, modules, externalModules, includes, excludes) {
    let exports = [],
    src = null,
    regexMatches = function(regex) {
        return regex.test(src);
    },
    filterExternalModules = function(externalModule) {
        return externalModule !== src;
    };

    for (let _module of modules) {
        src = _module.path;
        if (includes.some(regexMatches) && !excludes.some(regexMatches)) {
            let dest = outDir + '/' + src.replace(/^.*\/src\//, '').replace(/\.js$/, ''),
            externals = externalModules.filter(filterExternalModules);

            exports.push(getConfig(false, format, src, dest, _module.name, externals));
            if (uglify)
                exports.push(getConfig(true, format, src, dest, _module.name, externals));
        }
    }

    return exports;
}

import buildConfig from './build.config.json';

let config = buildConfig;

if(typeof config.distConfig === 'undefined')
    config.distConfig = {};

if (typeof config.libConfig === 'undefined')
    config.libConfig = {};

//get modules & external modules
let modules = getModules('src', config.mainModuleName || 'Module'),
externalModules = modules.map(module => module.path);

//resolve the default includes and exclude patterns
let includes = resolveRegex(config.include || '*'),
excludes = resolveRegex(config.exclude || null);

export default [
    ...getExports(
        'lib',
        config.libConfig.format || 'cjs',
        config.libConfig.uglify? true : config.uglify,
        modules,
        externalModules,
        config.libConfig.include? resolveRegex(config.libConfig.include) : includes,
        config.libConfig.exclude? resolveRegex(config.libConfig.exclude) : excludes
    ),
    ...getExports(
        'dist',
        config.distConfig.format || 'iife',
        config.distConfig.uglify? true : config.uglify,
        modules,
        [],
        config.distConfig.include? resolveRegex(config.distConfig.include) : includes,
        config.distConfig.exclude? resolveRegex(config.distConfig.exclude) : excludes
    )
];