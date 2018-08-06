;(function() {
	// var root = this 旧版本

	var root =
		(typeof self == "object" && self.self === self && self) ||
		(typeof global == "object" && global.global === global && global) ||
		this ||
		{}
	var previousUnderscore = root._

	var ArrayProto = Array.prototype,
		ObjProto = Object.prototype
	// FuncProto = Function.prototype
	var SymbolProto = typeof Symbol !== "undefined" ? Symbol.prototype : null

	var push = ArrayProto.push,
		slice = ArrayProto.slice,
		toString = ArrayProto.toString,
		hasOwnProperty = ObjProto.hasOwnProperty

	var nativeIsArray = Array.isArray,
		nativeKeys = Object.keys,
		// nativeBind = FuncProto.bind
		nativeCreate = Object.create

	var Ctor = function() {}

	var _ = function(obj) {
		if (obj instanceof _) return obj
		if (!(this instanceof _)) return new _(obj)
		this._wrapped = obj
	}

	if (typeof exports !== "undefined" && !exports.nodeType) {
		if (typeof module !== "undefined" && !module.nodeType && module.exports) {
			exports = module.exports = _
		}
		exports._ = _
	} else {
		root._ = _
	}

	//optimoze 使最优化 使尽可能有效
	var optimizeCb = function(func, context, argCount) {
		if (context === void 0) {
			return func
		}
		switch (argCount == null ? 3 : argCount) {
			case 1:
				return function(value) {
					return func.call(context, value)
				}
			// case 2:
			// 	return function(value, other) {
			// 		return func.call(context, value, other)
			// 	}
			case 3:
				return function(value, index, collection) {
					return func.call(context, value, index, collection)
				}
			case 4:
				return function(accumulator, value, index, collection) {
					return func.call(context, accumulator, value, index, collection)
				}
		}
		return function() {
			return func.apply(context, arguments)
		}
	}
	var builtinIteratee
	//iteratee isFunction isObject isArray matcher property
	var cb = function(value, context, argCount) {
		if (_.iteratee !== builtinIteratee) return _.iteratee(value, context)
		if (value == null) return _.identity
		if (_.isFunction(value)) return optimizeCb(value, context, argCount)
		if (_.isObject(value) && !_.isArray(value)) return _.matcher(value)
		return _.property(value)
	}

	_.iteratee = builtinIteratee = function(value, context) {
		return cb(value, context, Infinity)
	}

	var restArguments = function(func, startIndex) {
		startIndex = startIndex == null ? func.length - 1 : +startIndex
		return function() {
			var length = Math.max(arguments.length - startIndex, 0),
				rest = Array(length),
				index = 0
			for (; index < length; index++) {
				rest[index] = arguments[index + startIndex]
			}
			switch (startIndex) {
				case 0:
					return func.call(this.rest)
				case 1:
					return func.call(this, arguments[0], rest)
				case 2:
					return func.call(this, arguments[0], arguments[1], rest)
			}
			var args = Array(startIndex + 1)
			for (index = 0; index < startIndex; index++) {
				args[index] = arguments[index]
			}
			args[startIndex] = rest
			return func.apply(this, args)
		}
	}

	var baseCreate = function(prototype) {
		if (!_.isObject(prototype)) return {}
		if (nativeCreate) return nativeCreate(prototype)
		Ctor.prototype = prototype
		var result = new Ctor()
		Ctor.prototype = null
		return result
	}

	var shallowProperty = function(key) {
		return function(obj) {
			return obj == null ? void 0 : obj[key]
		}
	}

	var has = function(obj, path) {
		return obj != null && hasOwnProperty.call(obj, path)
	}

	var deepGet = function(obj, path) {
		var length = path.length
		for (var i = 0; i < length; i++) {
			if (obj == null) return void 0
			obj = obj[path[i]]
		}
		return length ? obj : void 0
	}

	var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1
	var getLength = shallowProperty("length")
	var isArrayLike = function(collection) {
		var length = getLength(collection)
		return typeof length == "number" && length >= 0 && length <= MAX_ARRAY_INDEX
	}

	//collection 方法

	_.each = _.forEach = function(obj, iteratee, context) {
		iteratee = optimizeCb(iteratee, context)
		var i, length
		if (isArrayLike(obj)) {
			for (i = 0, length = obj.length; i < length; i++) {
				iteratee(obj[i], i, obj)
			}
		} else {
			var keys = _.keys(obj)
			for (i = 0, length = keys.length; i < length; i++) {
				iteratee(obj[keys[i]], keys[i], obj)
			}
		}
	}
})()
