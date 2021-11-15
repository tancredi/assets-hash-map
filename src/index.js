const fs = require("fs");
const path = require("path");
const util = require("util");
const walk = require("klaw");
const shasum = require("shasum");

const readFile = util.promisify(fs.readFile);
const access = util.promisify(fs.access);
const through2 = require("through2");

/**
 * Assets hash map library
 *
 * Exports `getHashesMap`, which is used to recursively walk through a
 * directory and generate an Object mapping all matching inputPaths to Strings
 * representing the sha-sum of each found file
 */

/**
 * Map assets to hashes for given path
 *
 * Options:
 *
 * - `include`  : {String[]} Only include these extensions (default: `null`)
 * - `exclude`  : {String[]} Extenstions to exclude        (default: `null`)
 * - `absolute` : {Boolean}  Use absolute paths in map     (default: `false`)
 * - `basePath` : {String}   Used to output relative paths (default: `null`)
 * - `all`      : {Boolean}  Include hidden files          (default: `false`)
 *
 * @param  {String} inputPath
 * @param  {Object} options
 * @return {Promise<Object>}
 */
exports.getHashesMap = function (inputPath, options = {}) {
  const { exclude, extensions } = options;
  const map = {};
  const opts = {};
  const absoluteInputPath = path.resolve(inputPath);
  const items = [];

  if (options.all) {
    opts.filterFiles = /.*/;
  }

  const processItems = through2.obj(function (item, enc, next) {
    const ext = item.path.substr(1).split(".").pop();
    const filename = path.basename(item.path);

    if (
      (!options.all && filename.startsWith(".")) ||
      item.stats.isDirectory() ||
      (exclude && options.exclude.indexOf(ext) !== -1) ||
      (extensions && extensions.indexOf(ext) === -1)
    ) {
      return next();
    }

    const key = options.absolute
      ? item.path
      : path.relative(options.basePath || absoluteInputPath, item.path);

    this.push({ key, path: item.path });

    next();
  });

  return access(inputPath, fs.constants.F_OK)
    .catch(() => {
      throw new Error(`Path '${inputPath}' not found`);
    })
    .then(
      () =>
        new Promise((resolve, reject) => {
          walk(inputPath, { depthLimit: -1 })
            .pipe(processItems)
            .on("data", (item) => items.push(item))
            .on("end", resolve)
            .on("error", reject);
        })
    )
    .then(() => {
      return Promise.all(
        items.map((item) => {
          return hashFile(item.path).then((hash) => {
            map[item.key] = hash;
          });
        })
      );
    })
    .then(() => map);
};

/**
 * Get file hash
 *
 *
 * @param  {String} inputPath
 * @return {void}
 */
function hashFile(inputPath) {
  return readFile(inputPath, "utf8").then((content) => shasum(content));
}
