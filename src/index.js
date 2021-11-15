const fs = require("fs");
const path = require("path");
const util = require("util");
const walk = require("walk-folder-tree");
const shasum = require("shasum");

const readFile = util.promisify(fs.readFile);
const access = util.promisify(fs.access);

/**
 * Assets hash map library
 *
 * Exports `getHashesMap`, which is used to recursively walk through a
 * directory and generate an Object mapping all matching filepaths to Strings
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
 * @param  {String} filepath
 * @param  {Object} options
 * @return {Promise<Object>}
 */
exports.getHashesMap = function (filepath, options = {}) {
  const { exclude, extensions } = options;
  const map = {};
  const opts = {};

  if (options.all) {
    opts.filterFiles = /.*/;
  }

  return access(filepath, fs.constants.F_OK)
    .catch(() => {
      throw new Error(`Path '${filepath}' not found`);
    })
    .then(() =>
      walk(filepath, opts, (file, callback) => {
        const ext = file.name.substr(1).split(".").pop();

        if (
          file.directory ||
          (exclude && options.exclude.indexOf(ext) !== -1) ||
          (extensions && extensions.indexOf(ext) === -1)
        ) {
          return callback();
        }

        let filepath = options.absolute ? file.fullPath : file.path;

        if (options.basePath) {
          filepath = path.relative(options.basePath, file.fullPath);
        }

        return hashFile(file.fullPath)
          .then((hash) => {
            map[filepath] = hash;
            callback();
          })
          .catch(callback);
      }).then(() => map)
    );
};

/**
 * Get file hash
 *
 *
 * @param  {String} filepath
 * @return {void}
 */
function hashFile(filepath) {
  return readFile(filepath, "utf8").then((content) => shasum(content));
}
