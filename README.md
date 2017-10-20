## assets-hash-map

> Command-line tool / Node.js utility to recursively generate maps of filepaths and sha-sums - comes in handy for cachebusting.

##### Command-line

###### Install

```bash
npm install -g assets-hash-map
```

###### Simple usage

```bash
assets-hash-map my-dir
```

###### Example output:

```json
{
  "public/assets/my-dir/image1.png": "b5e7a2060081a33477a98db33eac9ec4c59ba5db",
  "public/assets/my-dir/image2.png": "a58bdd9dcc965d5b0f36b75f33a5fbcb6f2036ab",
  "public/assets/other-dir/my-font.woff": "a58bdd9dcc965d5b0f36b75f33a5fbcb6f2036ab",
  "public/assets/other-dir/my-font.woff2": "a58bdd9dcc965d5b0f36b75f33a5fbcb6f2036ab"
}
```


##### Command-line options

```bash
+--------------------------------+
|   Assets Hash Map generator:   |
+--------------------------------+

Generate a JSON assets hash map.
Usage: assets-hash-map [ paths ]

Options:
  -e, --extensions  Filter by file extension (comma separated)
  -x, --exclude     Exclude file extensions (comma separated)
  -b, --base-path   Set base path (filepaths will be relative to this)
  -s, --spaces      Tab spaces used formatting the JSON (defaults to 2)
  -o, --output      Output file (defaults to STDOUT)
  -a, --all         Include hidden files
  -h, --help        Show usage info

Example:
  assets-hash-map /dev/my-project/assets \\
    -e png,jpg,svg \\
    -x html,md \\
    -b /dev/my-project \\
    -s 0
    -o foo.json
```

##### Node.js API

###### Install

```bash
npm install assets-hash-map
```

###### `getHashesMap(filepath)`

Returns a Promise, which resolves with an Object containing the hash map for files in the given path.

Fails if called on an unexisting path.

Options:
* `include`  : `{String[]}` Only include these extensions (default: `null`)
* `exclude`  : `{String[]}` Extenstions to exclude        (default: `null`)
* `absolute` : `{Boolean}`  Use absolute paths in map     (default: `false`)
* `basePath` : `{String}`   Used to output relative paths (default: `null`)
* `all`      : `{Boolean}`  Include hidden files          (default: `false`)

###### Example

```javascript
const { getHashesMap } = require('assets-hash-map')

getHashesMap('./my-project', { include: [ 'png', 'jpg' ] })
.then(hashesMap => {
  console.log(hashesMap)
})

// {
//   'public/assets/my-dir/image1.png': 'b5e7a2060081a33477a98db33eac9ec4c59ba5db',
//   'public/assets/my-dir/image2.png': 'a58bdd9dcc965d5b0f36b75f33a5fbcb6f2036ab',
//   'public/assets/other-dir/image3.jpg': 'a58bdd9dcc965d5b0f36b75f33a5fbcb6f2036ab',
//   'public/assets/other-dir/image4.jpg': 'a58bdd9dcc965d5b0f36b75f33a5fbcb6f2036ab'
// }

```