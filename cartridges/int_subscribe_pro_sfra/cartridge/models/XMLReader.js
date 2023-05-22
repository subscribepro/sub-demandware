/**
 * @param {string} path
 * @param {XMLList} xml
 *
 * @returns {XMLList}
 */
function getValueByPath(path, xml) {
    var _pathCache = {};
    var f;
    var body;

    if (_pathCache[path]) {
        f = _pathCache[path];
    } else {
        body = 'default xml namespace = $root.namespace();return $root';

        if (path.indexOf('[') !== 0) {
            body += '.';
        }
        /* eslint-disable */
        var _f = new Function('$root', body + path);
        /* eslint-enable */
        _pathCache[path] = _f;
        f = _f;
    }

    try {
        return f(xml);
    } catch (e) {
        throw new Error('An error in "XMLUtil.js -> getValueByPath. \n' + 'Param "path" is: ' + (body + path) + '\n' + 'XMLNode is: ' + xml + '\n' + 'Error is: ' + e);
    }
}

/**
 * @classdesc XMLReader
 * @class
 *
 * @param {dw.io.File | string} file
 * @param {boolean} [removeFile=false] whether file should be removed at close event
 */
function XMLReader(file, removeFile) {
    var FileReader = require('dw/io/FileReader');
    var XMLStreamReader = require('dw/io/XMLStreamReader');

    if (typeof file === 'string') {
        var File = require('dw/io/File');

        file = new File(file);
    }

    /** @access private */
    this._removeFile = typeof removeFile === 'undefined' ? false : removeFile;

    /** @access private */
    this._file = file;

    if (file.exists()) {
        /** @access private */
        this._fileReader = new FileReader(file);
        /** @access private */
        this._stream = new XMLStreamReader(this._fileReader);
    } else {
        require('dw/system/Logger').info('File with path "{0}" does not exist.', file.fullPath);
    }

    /** @readonly */
    this.isClosed = !file.exists();
}

/**
 * @generator
 * @param {string} nodeName
 * @yields {XML}
 */
XMLReader.prototype.getNode = function (nodeName) {
    var XMLStreamConstants = require('dw/io/XMLStreamConstants');

    while (!this.isClosed && this._stream.hasNext()) {
        var next = this._stream.next();

        if (next === XMLStreamConstants.END_DOCUMENT) {
            this.closeReader();

            throw StopIteration;
        } else if (next === XMLStreamConstants.START_ELEMENT) {
            var xmlStreamNodeName = this._stream.getLocalName();

            if (xmlStreamNodeName === nodeName) {
                yield this._stream.readXMLObject();
            }
        }
    }

    throw StopIteration;
};




/**
 * @param {boolean} [removeFile]
 */
XMLReader.prototype.closeReader = function (removeFile) {
    if (this.isClosed) {
        return;
    }

    removeFile = typeof removeFile === 'undefined' ? this._removeFile : removeFile;

    this._stream.close();
    this._fileReader.close();

    if (removeFile) {
        this._file.remove();
    }

    this.isClosed = true;
};

XMLReader.prototype.parseXMLNode = function (schema, xmlSet) {
    this._schema = schema;
    if (!schema) {
        return;
    }

    for (var i = 0, l = xmlSet.length(); i < l; i++) {
        var child = xmlSet[i];

        var result = {};
        Object.keys(schema).forEach(function (key) {
            var value = getValueByPath(schema[key], child).toString();
            if (value) {
                result[key] = value;
            }
        });

        return result;
    }
};

module.exports = XMLReader;
