(function() {

	/**
	 *	@namespace Catalyst
	 */
	var Catalyst = this.Catalyst = {};



	/**
	 *	@var element document.html
	 */
	document.html = document.documentElement;

	/**
	 *	@var element document.head
	 */
	if(!document.head) document.head = document.getElementsByTagName('head')[0];

	/**
	 *	@polyfill HTMLElement.prototype.matches
	 */
	if(!HTMLElement.prototype.matches) {
		var prototype = HTMLElement.prototype;
		prototype.matches =
		prototype.webkitMatchesSelector ||
		prototype.mozMatchesSelector ||
		prototype.msMatchesSelector ||
		prototype.oMatchesSelector ||
		function(selector) {
			var node;
			var nodes = this.parentElement.querySelectorAll(selector);
			var n = 0;
			while(node = nodes[n++]) {
				if(node === this)
					return true;
			}
			return false;
		};
	}

	/**
	 *	@polyfill String.contains
	 */
	if(!('contains' in String.prototype)) String.prototype.contains = function(string, startIndex) { return -1 !== String.prototype.indexOf.call(this, string, startIndex); };



	/**
	 *	@object Browser
	 */
	var Browser = this.Browser = (function() {

		var userAgent = navigator.userAgent.toLowerCase();
		var userPlatform = navigator.platform.toLowerCase();
		var match = userAgent.match(/(opera|ie|firefox|chrome|version)[\s\/:]([\w\d\.]+)?.*?(safari|version[\s\/:]([\w\d\.]+)|$)/) || [null, 'unknown', 0];
		var mode = (match[1] == 'ie' && document.documentMode);
		var testNode = document.createElement('div');

		var ucfirst = function(string) {

			return string.charAt(0).toUpperCase() + string.slice(1);

		};

		return {
			Name: ucfirst((match[1] == 'version') ? match[3] : match[1]),
			Version: mode || parseFloat((match[1] == 'opera' && match[4]) ? match[4] : match[2]),
			Platform: {
				Name: userAgent.match(/ip(?:ad|od|hone)/) ? 'iOS' : ucfirst((userAgent.match(/(?:webos|android)/) || userPlatform.match(/mac|win|linux/) || ['other'])[0])
			},
			Supports: {
				XPath: !!(document.evaluate),
				SelectorAPI: !!(document.querySelector),
				JSON: !!(window.JSON),
				CSS3Transitions: !!('transition' in testNode.style || 'WebkitTransition' in testNode.style || 'MozTransition' in testNode.style || 'msTransition' in testNode.style || 'OTransition' in testNode.style)
			}
		};

	})();

	/**
	 *	@var Browser.Engine Alias
	 */
	Browser[Browser.Name] = true;



	/**
	 *	typeOf
	 *
	 *	Improves upon the native typeof keyword.
	 *
	 *	@param mixed obj
	 *
	 *	@return string
	 */
	var typeOf = this.typeOf = function(obj) {

		if(obj === undefined || obj === null)
			return;

		if(obj === window)
			return 'window';

		if(obj === document)
			return 'document';

		if(obj.nodeName) {

			if(obj.nodeType === 1)
				return 'element';

			if(obj.nodeType === 3)
				return (/\S/).test(obj.nodeValue) ? 'textnode' : 'whitespace';

		} else if(typeof obj.length === 'number') {

			if(obj.callee)
				return 'arguments';

			if(obj.item !== undefined)
				return 'collection';

		}

		if((!isNaN(parseFloat(obj)) && isFinite(obj)) === true)
			return 'numeric';

		if(obj instanceof RegExp)
			return 'regexp';

		if(obj instanceof Array)
			return 'array';

		return typeof obj;

	};



	/**
	 *	Object.append
	 *
	 *	Appends key value pairs, and overwrites existing values and keys, accepts at least one parameter.
	 *
	 *	@param object source
	 *
	 *	@return object
	 */
	Object.append = function(source) {

		for(var n = 1; n < arguments.length; ++n) {

			var tmp = arguments[n] || {};

			for(var key in tmp) {

				if(typeOf(tmp[key]) === 'object') {

					source[key] = Object.append(source[key], tmp[key]);

				} else {

					if(source === undefined) {

						return tmp;

					}

					source[key] = tmp[key];

				}

			}

			return source;

		}

	};

	/**
	 *	Object.forEach
	 *
	 *	Object iteration callback.
	 *
	 *	@param object object
	 *	@param function callback
	 *	@param object bind
	 *
	 *	@return void
	 */
	Object.forEach = function(object, callback, bind) {

		var keys = Object.keys(object);

		if(['object', 'collection'].indexOf(typeOf(object)) === -1)
			return;

		for(var key in object) {

			if(object.propertyIsEnumerable(key) === false)
				continue;

			if(keys.indexOf(key) !== -1)
				callback.call(object, object[key], key, bind);

		}

	};

	/**
	 *	Object.implement
	 *
	 *	Behaves similar to Object.append, but for prototype properties.
	 *
	 *	@param object object
	 *	@param object prototypes
	 *
	 *	@return void
	 */
	Object.implement = function(object, prototypes) {

		Object.forEach(prototypes, function(callback, key, object) {

			if(object.hasOwnProperty(key) === false) {

				object.prototype[key] = callback;

			}

		}, object);

	};



	/**
	 *	Function.implement
	 *
	 *	Implements prototypes on function objects.
	 *
	 *	@param object prototypes
	 *
	 *	@return void
	 */
	Function.prototype.implement = function(prototypes) {

		Object.implement(Function, prototypes);

	};

	/**
	 *	Function Generics
	 */
	Function.implement({

		/**
		 *	delete
		 *
		 *	Sets function timeout.
		 *
		 *	@param int milliseconds
		 *
		 *	@return void
		 */
		delay: function(milliseconds) {

			setTimeout(this, milliseconds || 500);

		},

		/**
		 *	interval
		 *
		 *	Sets an function interval.
		 *
		 *	@param int milliseconds
		 *
		 *	@return void
		 */
		interval: function(milliseconds) {

			this.interval = setInterval(this, milliseconds || 1000);

		},

		/**
		 *	clearInterval
		 *
		 *	Removes function interval, if exists.
		 *
		 *	@return void
		 */
		clearInterval: function() {

			if(this.interval) {

				window.clearInterval(this.interval);
				delete this.interval;

			}

		},

		/**
		 *	repeat
		 *
		 *	Repeats function call n number of times.
		 *
		 *	@param int n Number of times to call.
		 *	@param object bind Function bind object.
		 *
		 *	@return void
		 */
		repeat: function(n, bind) {

			if(n == "0" || ((n | 0) > 0 && n % 1 == 0)) {

				for(var j = 0; j < n; j++) {

					this.call(bind, j, n);

				}

			}

		}

	});



	/**
	 *	String Generics
	 *
	 *	Extends native String prototype with additional prototypes.
	 */
	Object.implement(String, {

		/**
		 *	trimWhitespace
		 *
		 *	Trims away excess whitespace from string.
		 *
		 *	@return string
		 */
		trimWhitespace: function() {

			return this.replace(/\s+/g, ' ').trim();

		},

		/**
		 *	firstWord
		 *
		 *	Returns the first word from a string.
		 *
		 *	@return string
		 */
		firstWord: function() {

			return (/^([\w\-]+)/.exec(this) || [''])[0];

		},

		/**
		 *	lastWord
		 *
		 *	Returns the last word from a string.
		 *
		 *	@return string
		 */
		lastWord: function() {

			return this.match(/[^ ]*$/)[0];

		},

		/**
		 *	splice
		 *
		 *	Behaves as Array.splice for strings.
		 *
		 *	@param integer index
		 *	@param integer offset
		 *	@param string insertString
		 *
		 *	@return string
		 */
		splice: function(index, offset, insertString) {

			offset = +offset || 0;
			insertString = insertString || '';

			return this.slice(0, index) + insertString + this.slice(index + offset);

		},

		/**
		 *	removeAccents
		 *
		 *	Removes accents from a string and returns it as a new string.
		 *
		 *	@return string
		 */
		removeAccents: function() {

			var string = this;

			string = string.replace(/[\u00E0\u00E1\u00E2\u00E3\u00E4\u00E5]/g, 'a');
			string = string.replace(/[\u00E7]/g, 'c');
			string = string.replace(/[\u00E8\u00E9\u00EA\u00EB]/g, 'e');
			string = string.replace(/[\u00EC\u00ED\u00EE\u00EF]/g, 'i');
			string = string.replace(/[\u00F2\u00F3\u00F4\u00F5\u00F6\u00F8]/g, 'o');
			string = string.replace(/[\u00F9\u00FA\u00FB\u00FC]/g, 'u');
			string = string.replace(/[\u00FD\u00FF]/g,'y');
			string = string.replace(/[\u00F1]/g, 'n');
			string = string.replace(/[\u0153]/g, 'oe');
			string = string.replace(/[\u00E6]/g, 'ae');
			string = string.replace(/[\u00DF]/g, 'ss');

			return string;

		},

		/**
		 *	toCamelCase
		 *
		 *	Converts a hyphenated string into a camelcased string.
		 *
		 *	@return string
		 */
		toCamelCase: function() {

			return this.replace(/^([\-=\s]*)([a-zA-Z0-9])/gm, "$2").trimWhitespace().replace(/-\D/g, function(match) {

				return match.charAt(1).toUpperCase();

			});

		},

		/**
		 *	hyphenate
		 *
		 *	Creates a URI slug from current string.
		 *
		 *	@return string
		 */
		hyphenate: function() {

			var string = this.toLowerCase();

			string = string.removeAccents();
			string = string.replace(/[^a-z0-9_\s\'\:\/\[\]\-]/g,'');
			string = string.replace(/[\s\'\:\/\[\]\-]+/g,' ');
			string = string.replace(/[ ]/g,'-');

			return string;

		},

		/**
		 *	score
		 *
		 *	String scoring algorithm by Joshaven Potter <https://github.com/joshaven/string_score>.
		 *
		 *	@param string abbr Abbrevieated string.
		 *	@param int fuzziness
		 *
		 *	@return float
		 */
		score: function(abbreviation, fuzziness) {

			if (this === abbreviation)
				return 1;

			if(abbreviation === "")
				return 0;

			var totalCharacterScore = 0;
			var abbreviationLength = abbreviation.length;
			var string = this;
			var stringLength = string.length;
			var startOfStringBonus;
			var abbreviationScore;
			var fuzzies = 1;
			var finalScore;

			for(var i = 0, characterScore, indexInString, c, indexCharLowercase, indexCharUppercase, minIndex; i < abbreviationLength; ++i) {

				c = abbreviation.charAt(i);

				indexCharLowercase = string.indexOf(c.toLowerCase());
				indexCharUppercase = string.indexOf(c.toUpperCase());
				minIndex = Math.min(indexCharLowercase, indexCharUppercase);
				indexInString = (minIndex > -1) ? minIndex : Math.max(indexCharLowercase, indexCharUppercase);

				if(indexInString === -1) {

					if(fuzziness) {

						fuzzies += 1-fuzziness;
						continue;

					} else {

						return 0;

					}

				} else {

					characterScore = 0.1;

				}

				if(string[indexInString] === c) {

					characterScore += 0.1;

				}

				if(indexInString === 0) {

					characterScore += 0.6;

					if(i === 0) {

						startOfStringBonus = 1; //true;

					}

				} else {

					if(string.charAt(indexInString - 1) === ' ') {

						characterScore += 0.8;

					}

				}

				string = string.substring(indexInString + 1, stringLength);
				totalCharacterScore += characterScore;

			}

			abbreviationScore = totalCharacterScore / abbreviationLength;
			finalScore = ((abbreviationScore * (abbreviationLength / stringLength)) + abbreviationScore) / 2;
			finalScore = finalScore / fuzzies;

			if(startOfStringBonus && (finalScore + 0.15 < 1)) {

				finalScore += 0.15;

			}

			return finalScore;

		}

	});



	/**
	 *	Array.from
	 *
	 *	Creates an array from any object.
	 *
	 *	@param object obj
	 *
	 *	@return array
	 */
	Array.from = function(obj) {

		return [].slice.call(obj);

	};

	/**
	 *	Array Generics
	 */
	Object.implement(Array, {

		/**
		 *	all
		 *
		 *	Invokes callback method on each node in context array.
		 *
		 *	@return void
		 */
		all: function() {

			var args = Array.from(arguments);
			var callback = args.shift();
			var a = args[0];

			this.forEach(function(node, index) {

				if(node instanceof Node) {

					node[callback].apply(node, args);

				}

			});

		},

		/**
		 *	contains
		 *
		 *	Checks if a needle exists in array.
		 *
		 *	@param mixed needle
		 *
		 *	@return boolean
		 */
		contains: function(needle) {

			if(this.indexOf(needle) !== -1)
				return true;

			return false;

		},

		/**
		 *	score
		 *
		 *	Scores each item in an array and returns an array with item, score pairs.
		 *
		 *	@param string abbreviation
		 *
		 *	@return object
		 */
		score: function(abbreviation) {

			var object = {};

			if(abbreviation === undefined)
				return object;

			if(this.length === 0)
				return object;

			this.forEach(function(item, index) {

				if(typeOf(item) === 'string') {

					object[item] = item.score(abbreviation);

				}

			});

			return object;

		}

	});



	/**
	 *	Class
	 *
	 *	Object used to create custom "classes" in JavaScript.
	 *
	 *	@param object prototypes
	 *
	 *	@return object
	 */
	this.Class = function(prototypes) {

		var Reflection = function() {

			return (arguments[0] !== null && this.construct && typeOf(this.construct) === 'function') ? this.construct.apply(this, arguments) : this;

		};

		Object.append(Reflection, this);

		Reflection.prototype = prototypes;
		Reflection.constructor = Class;

		return Reflection;

	};

	this.Class.prototype = {

		implement: function(prototypes) {

			var self = this.prototype;

			Object.append(self, prototypes);

		}

	};



	/**
	 *	EventObject
	 *
	 *	Extends native event object with additional informatiom and functionality, mostly usable for text input.
	 */
	this.EventObject = new Class({

		/**
		 *	@var object definedKeys Object containing names of key codes.
		 */
		definedKeys: {
			8: 'backspace',
			9: 'tab',
			13: 'return',
			27: 'escape',
			32: 'space',
			37: 'left',
			38: 'up',
			39: 'right',
			40: 'down',
			46: 'delete',
			48: '0',
			49: '1',
			50: '2',
			51: '3',
			52: '4',
			53: '5',
			54: '6',
			55: '7',
			56: '8',
			57: '9',
			219: 'å',
			222: 'ä',
			186: 'ö'
		},

		/**
		 *	Constructor
		 *
		 *	Extends this class with native event object.
		 *
		 *	@param object nativeEvent
		 *
		 *	@return void
		 */
		construct: function(nativeEvent) {

			Object.append(this, nativeEvent);

			this.nativeEvent = nativeEvent;

			this.resolveEvent();

			return this;

		},

		/**
		 *	resolveEvent
		 *
		 *	Resolves native event data.
		 *
		 *	@return void
		 */
		resolveEvent: function() {

			this.modifierKey = this.metaKey || this.ctrlKey;

			this.metaKey = this.metaKey;

			this.ctrlKey = this.ctrlKey;

			this.shiftKey = this.shiftKey;

			this.keyCode = this.keyCode;

			this.charCode = this.charCode;

			this.charString = String.fromCharCode(this.keyCode);

			this.key = this.charString;

			if(this.keyCode && this.charCode === 0) {

				this.key = (this.definedKeys[this.keyCode] !== undefined) ? this.definedKeys[this.keyCode] : this.charString;

			}

			if(!!this.key.match(/\w/) === true) {

				this.key = this.key.toLowerCase();

			}

		},

		/**
		 *	getSequence
		 *
		 *	Returns keyboard sequence.
		 *
		 *	@return array
		 */
		getSequence: function() {

			var keySequence = [this.key];

			if(this.ctrlKey === true)
				keySequence.push('ctrl');

			if(this.metaKey === true)
				keySequence.push('meta');

			if(this.shiftKey === true)
				keySequence.push('shift');

			return keySequence;

		},

		/**
		 *	isSequence
		 *
		 *	Checks if input key sequence is current event sequence.
		 *
		 *	@oaram string keySequence
		 *
		 *	@return boolean
		 */
		isSequence: function(keySequence) {

			var eventSequenceKeys = this.getSequence();
			var sequenceKeys = Array.from(keySequence.split('+'));

			if(eventSequenceKeys.length === sequenceKeys.length) {

				var isSequence = true;

				sequenceKeys.forEach(function(key, index) {

					key = key.trimWhitespace().trim();

					if(eventSequenceKeys.indexOf(key) === -1)
						isSequence = false;

				});

				return isSequence;
			}

			return false;

		},

		/**
		 *	stop
		 *
		 *	Prevents default behaviour and stops event propagnation.
		 *
		 *	@return boolean
		 */
		stop: function() {

			this.nativeEvent.stopPropagation();
			this.nativeEvent.preventDefault();

			return false;

		}

	});



	/**
	 *	@private object NodeObject
	 */
	var NodeObject = {

		/**
		 *	@private array NodeObject.ReadOnly
		 */
		ReadOnly: ['type'],

		/**
		 *	@private array NodeObject.Booleans
		 */
		Booleans: ['compact', 'nowrap', 'ismap', 'declare', 'noshade', 'checked', 'disabled', 'read-only', 'multiple', 'selected', 'noresize', 'defer'],

		/**
		 *	@private object NodeObject.Events
		 */
		Events: {
			'ready': 'DOMContentLoaded',
			'readystatechange': null,
			'load': null,
			'unload': null,
			'mouseup': null,
			'mouseover': null,
			'mousemove': null,
			'mousedown': null,
			'mouseout': null,
			'mousewheel': 'DOMMouseScroll',
			'click': null,
			'right-click': 'contextmenu',
			'double-click': 'dblclick',
			'contextmenu': null,
			'keydown': null,
			'keypress': null,
			'keyup': null,
			'abort': null,
			'error': null,
			'change': null,
			'submit': null,
			'reset': null,
			'focus': null,
			'blur': null,
			'cut': null,
			'paste': null,
			'copy': null,
			'drag': null,
			'dragstart': null,
			'dragenter': null,
			'dragover': null,
			'dragleave': null,
			'dragend': null,
			'drop': null,
			'resize': null,
			'loadstart': null,
			'progress': null,
			'suspend': null,
			'emptied': null,
			'stalled': null,
			'loadedmetadata': null,
			'loadeddata': null,
			'canplay': null,
			'canplaythrough': null,
			'ended': null,
			'durationchange': null,
			'volumechange': null,
			'timeupdate': null,
			'play': null,
			'pause': null,
			'waiting': null,
			'seeking': null,
			'seeked': null,
			'transitionend': (Browser.Safari || Browser.Chrome) ? 'webkitTransitionEnd' : 'transitionend',
			'animationiteration': (Browser.Safari || Browser.Chrome) ? 'webkitAnimationIteration' : (Browser.Firefox) ? 'mozAnimationIteration' : 'animationiteration',
			'animationstart': (Browser.Safari || Browser.Chrome) ? 'webkitAnimationStart' : (Browser.Firefox) ? 'mozAnimationStart' : 'animationstart',
			'animationend': (Browser.Safari || Browser.Chrome) ? 'webkitAnimationEnd' : (Browser.Firefox) ? 'mozAnimationEnd' : 'animationend'
		},

		/**
		 *	@private object NodeObject.Properties
		 */
		Properties: {
			'text': 'textContent',
			'html': 'innerHTML',
			'class': 'className',
			'editable': 'contentEditable',
			'tag': 'nodeName'
		},

		/**
		 *	@private array NodeObject.ObjectProperties
		 */
		ObjectProperties: ['value'],

		/**
		 *	@private array NodeObject.Styles
		 */
		Styles: [
			'align-content', 'align-items', 'align-self', 'alignment-adjust', 'alignment-baseline', 'anchor-point', 'animation', 'animation-delay', 'animation-direction', 'animation-duration', 'animation-iteration-count', 'animation-name', 'animation-play-state', 'animation-timing-function', 'appearance', 'azimuth',
			'backface-visibility', 'background', 'background-attachment', 'background-clip', 'background-color', 'background-image', 'background-origin', 'background-position', 'background-repeat', 'background-size', 'baseline-shift', 'binding', 'bleed', 'bookmark-label', 'bookmark-level', 'bookmark-state', 'bookmark-target',
			'border', 'border-bottom', 'border-bottom-color', 'border-bottom-left-radius', 'border-bottom-right-radius', 'border-bottom-style', 'border-bottom-width', 'border-collapse', 'border-color', 'border-image', 'border-image-outset', 'border-image-repeat', 'border-image-slice', 'border-image-source', 'border-image-width',
			'border-left', 'border-left-color', 'border-left-style', 'border-left-width', 'border-radius', 'border-right', 'border-right-color', 'border-right-style', 'border-right-width', 'border-spacing', 'border-style', 'border-top', 'border-top-color', 'border-top-left-radius', 'border-top-right-radius', 'border-top-style',
			'border-top-width', 'border-width', 'bottom', 'box-decoration-break', 'box-shadow', 'box-sizing', 'break-after', 'break-before', 'break-inside', 'caption-side', 'clear', 'clip', 'color', 'color-profile', 'column-count', 'column-fill', 'column-gap', 'column-rule', 'column-rule-color', 'column-rule-style',
			'column-rule-width', 'column-span', 'column-width', 'columns', 'content', 'counter-increment', 'counter-reset', 'crop', 'cue', 'cue-after', 'cue-before', 'cursor', 'direction', 'display', 'dominant-baseline', 'drop-initial-after-adjust', 'drop-initial-after-align', 'drop-initial-before-adjust',
			'drop-initial-before-align', 'drop-initial-size', 'drop-initial-value', 'elevation', 'empty-cells', 'fit', 'fit-position', 'flex', 'flex-basis', 'flex-direction', 'flex-flow', 'flex-grow', 'flex-shrink', 'flex-wrap', 'float', 'float-offset', 'font', 'font-feature-settings', 'font-family', 'font-kerning',
			'font-language-override', 'font-size', 'font-size-adjust', 'font-stretch', 'font-style', 'font-synthesis', 'font-variant', 'font-variant-alternates', 'font-variant-caps', 'font-variant-east-asian', 'font-variant-ligatures', 'font-variant-numeric', 'font-variant-position', 'font-weight', 'grid-cell',
			'grid-column', 'grid-column-align', 'grid-column-sizing', 'grid-column-span', 'grid-columns', 'grid-flow', 'grid-row', 'grid-row-align', 'grid-row-sizing', 'grid-row-span', 'grid-rows', 'grid-template', 'hanging-punctuation', 'height', 'hyphens', 'icon', 'image-orientation', 'image-rendering', 'image-resolution',
			'ime-mode', 'inline-box-align', 'justify-content', 'left', 'letter-spacing', 'line-break', 'line-height', 'line-stacking', 'line-stacking-ruby', 'line-stacking-shift', 'line-stacking-strategy', 'list-style', 'list-style-image', 'list-style-position', 'list-style-type', 'margin', 'margin-bottom', 'margin-left', 'margin-right',
			'margin-top', 'marker-offset', 'marks', 'marquee-direction', 'marquee-loop', 'marquee-play-count', 'marquee-speed', 'marquee-style', 'max-height', 'max-width', 'min-height', 'min-width', 'move-to', 'nav-down', 'nav-index', 'nav-left', 'nav-right', 'nav-up', 'opacity', 'order', 'orphans', 'outline', 'outline-color',
			'outline-offset', 'outline-style', 'outline-width', 'overflow', 'overflow-style', 'overflow-wrap', 'overflow-x', 'overflow-y', 'padding', 'padding-bottom', 'padding-left', 'padding-right', 'padding-top', 'page', 'page-break-after', 'page-break-before', 'page-break-inside', 'page-policy', 'pause', 'pause-after',
			'pause-before', 'perspective', 'perspective-origin', 'pitch', 'pitch-range', 'play-during', 'position', 'presentation-level', 'punctuation-trim', 'quotes', 'rendering-intent', 'rest', 'rest-after', 'rest-before', 'richness', 'right', 'rotation', 'rotation-point', 'ruby-align', 'ruby-overhang', 'ruby-position',
			'ruby-span', 'size', 'speak', 'speak-as', 'speak-header', 'speak-numeral', 'speak-punctuation', 'speech-rate', 'stress', 'string-set', 'tab-size', 'table-layout', 'target', 'target-name', 'target-new', 'target-position', 'text-align', 'text-align-last', 'text-decoration', 'text-decoration-color', 'text-decoration-line',
			'text-decoration-skip', 'text-decoration-style', 'text-emphasis', 'text-emphasis-color', 'text-emphasis-position', 'text-emphasis-style', 'text-height', 'text-indent', 'text-justify', 'text-outline', 'text-overflow', 'text-shadow', 'text-space-collapse', 'text-transform', 'text-underline-position', 'text-wrap', 'top',
			'transform', 'transform-origin', 'transform-style', 'transition', 'transition-delay', 'transition-duration', 'transition-property', 'transition-timing-function', 'unicode-bidi', 'vertical-align', 'visibility', 'voice-balance', 'voice-duration', 'voice-family', 'voice-pitch', 'voice-range', 'voice-rate', 'voice-stress',
			'voice-volume', 'volume', 'white-space', 'widows', 'width', 'word-break', 'word-spacing', 'word-wrap', 'z-index'
		],

		/**
		 *	@private array NodeObject.StyleUnitProperties
		 */
		StyleUnitProperties: ['height', 'min-height', 'max-height', 'width', 'min-width', 'max-width', 'font-size', 'line-height', 'top', 'left', 'bottom', 'right', 'border-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'border-left-width', 'margin', 'margin-top', 'margin-right', 'margin-bottom', 'margin-left', 'padding', 'padding-top', 'padding-right', 'padding-bottom', 'padding-left'],

		/**
		 *	@private object NodeObject.Injectors
		 */
		Injectors: {

			/**
			 *	NodeObject.Injectors.TOP
			 *
			 *	Injects context node inside target node, at the top.
			 *
			 *	@param node contextNode
			 *	@param node targetNode
			 *
			 *	@return void
			 */
			TOP: function(contextNode, targetNode) {

				targetNode.insertBefore(contextNode, targetNode.firstChild);

			},

			/**
			 *	NodeObject.Injectors.BOTTOM
			 *
			 *	Injects context node inside target node, at the bottom.
			 *
			 *	@param node contextNode
			 *	@param node targetNode
			 *
			 *	@return void
			 */
			BOTTOM: function(contextNode, targetNode) {

				if(typeOf(contextNode) === 'element' && typeOf(targetNode) === 'element') {

					targetNode.appendChild(contextNode);

				}

			},

			/**
			 *	NodeObject.Injectors.BEFORE
			 *
			 *	Injects context node before target node.
			 *
			 *	@param node contextNode
			 *	@param node targetNode
			 *
			 *	@return void
			 */
			BEFORE: function(contextNode, targetNode) {

				var parent = (targetNode !== null && targetNode.parentNode) ? targetNode.parentNode : null;

				if(typeOf(parent) === 'element') {

					parent.insertBefore(contextNode, targetNode);

				}

			},

			/**
			 *	NodeObject.Injectors.AFTER
			 *
			 *	Injects context node after target node.
			 *
			 *	@param node contextNode
			 *	@param node targetNode
			 *
			 *	@return void
			 */
			AFTER: function(contextNode, targetNode) {

				var parent = targetNode.parentNode;

				if(typeOf(parent) === 'element') {

					parent.insertBefore(contextNode, targetNode.nextSibling);

				}

			}

		}

	};

	/**
	 *	Node
	 *
	 *	Class used to represent a HTMLElement node with custom generics.
	 *
	 *	@return void
	 */
	this.Node = new Class({

		/**
		 *	@var object contextNode Node node.
		 */
		contextNode: null,

		/**
		 *	@var object properties Custom object properties.
		 */
		properties: {},

		/**
		 *	Constructor
		 *
		 *	@param string|object selector
		 *	@param object properties
		 *
		 *	@return self
		 */
		construct: function(selector, properties) {

			var self = this;

			properties = properties || {};
			var contextNode = selector;
			var isQuerySelector = false;
			var selectorIdentifiers = ['#', '.', '(', '[', '>', ':', '+'];

			switch(typeOf(contextNode)) {

				case 'object' :

					if(selector.toNode !== undefined)
						this.contextNode = selector.toNode();

				break;
				case 'element' :
				case 'window' :
				case 'document' :

					this.contextNode = contextNode;

				break;
				case 'string' :

					Array.from(selectorIdentifiers).forEach(function(identifier) {

						if(selector.contains(identifier) === true) {

							isQuerySelector = true;

							return;

						}

					});

					if(isQuerySelector === true) {

						this.contextNode = document.querySelector(selector);

					} else {

						this.contextNode = document.createElement(selector);

					}

				break;

			}

			// Allow read-only attributes upon node creation
			NodeObject.ReadOnly.forEach(function(attribute) {

				if(properties.hasOwnProperty(attribute) === true) {

					self.toNode().setAttribute(attribute, properties[attribute]);

				}

			});

			this.set(properties);

			return this;

		},

		/**
		 *	toNode
		 *
		 *	Returns context node.
		 *
		 *	@return node
		 */
		toNode: function() {

			return this.contextNode;

		},

		/**
		 *	select
		 *
		 *	Sets input node as current node.
		 *
		 *	@param object node
		 *
		 *	@return self
		 */
		select: function(node) {

			if(node instanceof Node) {

				if(node.toNode() !== this.contextNode) {

					this.contextNode = node.toNode();

				}

			} else if(node.nodeType === 1) {

				this.contextNode = node;

			}

			return this;

		},

		/**
		 *	matches
		 *
		 *	Checks whether or not current node matches a selector.
		 *
		 *	@param string selector
		 *
		 *	@return boolean
		 */
		matches: function(selector) {

			return this.toNode().matches(selector);

		},

		/**
		 *	walk
		 *
		 *	Traverses the DOM tree using current node as context node.
		 *
		 *	@param string direction
		 *	@param function filterCallback
		 *
		 *	@return array
		 */
		walk: function(direction, filterCallback) {

			var node = this.toNode();
			var nodes = [];
			var directions = {
				'previous': 'previousSibling',
				'next': 'nextSibling',
				'parent': 'parentNode'
			};

			if(direction === 'child') {

				var children = node.querySelectorAll('*');

				if(children.length > 0) {

					for(var n in children) {

						var tmp = children[n];

						if(tmp.nodeType === 1 && (!filterCallback || filterCallback(tmp))) {

							nodes.push(new Node(tmp));

						}

					}

				}

				return nodes;

			}

			if(directions.hasOwnProperty(direction) === true) {

				while(node = node[directions[direction]]) {

					if(node.nodeType === 1 && (!filterCallback || filterCallback(node))) {

						nodes.push(new Node(node));

					}

				}

			}

			return nodes;

		},

		/**
		 *	walkFilter
		 *
		 *	Applies either node match or custom filter to Node.walk
		 *
		 *	@param string direction
		 *	@param string|function filter
		 *
		 *	@return array
		 */
		walkFilter: function(direction, filter) {

			var filterCallback;

			if(typeOf(filter) === 'string') {

				filterCallback = function(node) {

					return (node.nodeType === 1 && node.matches(filter) === true);

				};

			} else if(typeOf(filter) === 'function') {

				filterCallback = filter;

			}

			return this.walk(direction, filterCallback);

		},

		/**
		 *	parents
		 *
		 *	Climbs the DOM tree returning parent nodes, filters either by selector or filter callback.
		 *
		 *	@param string|function filter
		 *
		 *	@return array
		 */
		parents: function(filter) {

			return this.walkFilter('parent', filter);

		},

		/**
		 *	parent
		 *
		 *	Returns first match from Node.parents.
		 *
		 *	@param string|function filter
		 *
		 *	@return Node
		 */
		parent: function(filter) {

			var nodes = this.parents(filter);

			return nodes.shift();

		},

		/**
		 *	children
		 *
		 *	Traverses the DOM tree returning child nodes, filters either by selector or filter callback.
		 *
		 *	@param string|function filter
		 *
		 *	@return array
		 */
		children: function(filter) {

			return this.walkFilter('child', filter);

		},

		/**
		 *	child
		 *
		 *	Returns first match from Node.children.
		 *
		 *	@param string|function filter
		 *
		 *	@return Node
		 */
		child: function(filter) {

			var nodes = this.children(filter);

			return nodes.shift();

		},

		/**
		 *	next
		 *
		 *	Traverses the DOM tree and returns all next sibling nodes, filters either by selector or filter callback.
		 *
		 *	@param string|function filter
		 *
		 *	@return array
		 */
		next: function(filter) {

			return this.walkFilter('next', filter);

		},

		/**
		 *	previous
		 *
		 *	Traverses the DOM tree and returns all previous sibling nodes, filters either by selector or filter callback.
		 *
		 *	@param string|function filter
		 *
		 *	@return array
		 */
		previous: function(filter) {

			return this.walkFilter('previous', filter);

		},

		/**
		 *	prev
		 *
		 *	Alias method for Node.previous
		 *
		 *	@param string|function filter
		 *
		 *	@return array
		 */
		prev: function(filter) {

			return this.previous(filter);

		},

		/**
		 *	inject
		 *
		 *	Injects element into, above or below target node.
		 *
		 *	@param node targetNode
		 *	@param string targetDestination
		 *
		 *	@return self
		 */
		inject: function(targetNode, targetDestination) {

			if(['top', 'bottom', 'before', 'after'].indexOf(targetDestination) === -1)
				targetDestination = 'bottom';

			if(typeOf(targetNode.toNode) === 'function')
				targetNode = targetNode.toNode();

			NodeObject.Injectors[targetDestination.toUpperCase()](this.toNode(), targetNode);

			return this;

		},

		/**
		 *	top
		 *
		 *	Alias method for Node.inject(targetNode, 'top').
		 *
		 *	@param node targetNode
		 *
		 *	@return self
		 */
		top: function(targetNode) {

			return this.inject(targetNode, 'top');

		},

		/**
		 *	bottom
		 *
		 *	Alias method for Node.inject(targetNode, 'bottom').
		 *
		 *	@param node targetNode
		 *
		 *	@return self
		 */
		bottom: function(targetNode) {

			return this.inject(targetNode, 'bottom');

		},

		/**
		 *	before
		 *
		 *	Alias method for Node.inject(targetNode, 'before').
		 *
		 *	@param node targetNode
		 *
		 *	@return self
		 */
		before: function(targetNode) {

			return this.inject(targetNode, 'before');

		},

		/**
		 *	after
		 *
		 *	Alias method for Node.inject(targetNode, 'after').
		 *
		 *	@param node targetNode
		 *
		 *	@return self
		 */
		after: function(targetNode) {

			return this.inject(targetNode, 'after');

		},

		/**
		 *	wrap
		 *
		 *	Wraps element into new target node.
		 *
		 *	@param element targetNode
		 *	@param string targetDestination
		 *
		 *	@return self
		 */
		wrap: function(targetNode, targetDestination) {

			if(['top', 'bottom'].indexOf(targetDestination) === -1)
				targetDestination = 'bottom';

			if(typeOf(targetNode) === 'element')
				targetNode = new Node(targetNode);

			if(typeOf(targetNode.toNode) === 'function') {

				this.inject(targetNode, 'before');

				targetNode.inject(this, targetDestination);

			}

			return this;

		},

		/**
		 *	destroy
		 *
		 *	Removes node from DOM tree, returns removed node, if exists.
		 *
		 *	@return node|null
		 */
		destroy: function() {

			var parentNode = this.toNode().parentNode;

			if(typeOf(parentNode) === 'element') {

				var contextNode = this.toNode();

				parentNode.removeChild(contextNode);

				delete this.contextNode;

				return contextNode;

			}

			return null;

		},

		/**
		 *	empty
		 *
		 *	Empties element form all child nodes (of all types).
		 *
		 *	@return void
		 */
		empty: function() {

			var node = this.toNode();

			while(node.hasChildNodes()) {

				node.removeChild(node.lastChild);

			}

		},

		/**
		 *	hasProperty
		 *
		 *	Returns boolean whether or not attribute or object property exists.
		 *
		 *	@param string property
		 *	@param boolean useObjectStore
		 *
		 *	@return boolean
		 */
		hasProperty: function(property, useObjectStore) {

			property = property || null;
			useObjectStore = !!useObjectStore || false;

			return !!this.getProperty(property, useObjectStore);

		},

		/**
		 *	setProperty
		 *
		 *	Sets node property or attribute.
		 *
		 *	@param string property
		 *	@param boolean|number|string value
		 *	@param boolean useObjectStore
		 *
		 *	@return self
		 */
		setProperty: function(property, value, useObjectStore) {

			var node = this.toNode();
			property = property || null;
			value = (typeOf(value) !== undefined) ? value : null;
			useObjectStore = !!useObjectStore || false;

			if(value === null) {

				this.removeProperty(property, useObjectStore);

			}

			if(!node || NodeObject.ReadOnly.indexOf(property) !== -1) {

				return this;

			}

			if(['boolean', 'numeric', 'string', 'function'].indexOf(typeOf(value)) !== -1) {

				if(useObjectStore === true) {

					this.properties[property] = value;

				} else if(NodeObject.ObjectProperties.contains(property) === true) {

					node[property] = value;

				} else if(NodeObject.Properties.hasOwnProperty(property) === true) {

					node[NodeObject.Properties[property]] = value.toString();

				} else if(NodeObject.Booleans.indexOf(property) !== -1) {

					node[property] = !!value;

				} else {

					node.setAttribute(property, value.toString());

				}

			}

		},

		/**
		 *	getProperty
		 *
		 *	Returns property or attribute value from node.
		 *
		 *	@param string property
		 *	@param boolean useObjectStore
		 *
		 *	@return boolean|string|null
		 */
		getProperty: function(property, useObjectStore) {

			var node = this.toNode();
			property = property.toString() || null;
			useObjectStore = !!useObjectStore || false;

			if(!node || property === null)
				return null;

			if(useObjectStore === true && this.properties[property] !== undefined) {

				return this.properties[property];

			} else if(NodeObject.Properties.hasOwnProperty(property) === true) {

				var objectProperty = node[NodeObject.Properties[property]];

				if(property.toString() === 'tag') {

					return objectProperty.toLowerCase();

				}

				return objectProperty;

			} else if(node.hasAttribute(property) === true) {

				return node.getAttribute(property);

			} else {

				return node[property];

			}

			return null;

		},

		/**
		 *	removeProperty
		 *
		 *	Removes property or attribute value from node.
		 *
		 *	@param string property
		 *	@param boolean useObjectStore
		 *
		 *	@return self
		 */
		removeProperty: function(property, useObjectStore) {

			var node = this.toNode();
			property = property || null;
			useObjectStore = !!useObjectStore || false;

			if(!!NodeObject.ReadOnly[property])
				return this;

			if(useObjectStore === true && this.properties[property] !== undefined) {

				delete this.properties[property];

			} else if(!!NodeObject.ObjectProperties[property]) {

				node[property] = null;

			} else if(NodeObject.Properties.hasOwnProperty(property) === true) {

				node.removeAttribute(NodeObject.Properties[property]);

			} else if(NodeObject.Booleans.indexOf(property) !== -1) {

				node[property] = false;

			} else {

				node.removeAttribute(property);

			}

			return this;

		},

		/**
		 *	setProperties
		 *
		 *	Sets properties from an object.
		 *
		 *	@param object properties
		 *	@param boolean useObjectStore
		 *
		 *	@return self
		 */
		setProperties: function(properties, useObjectStore) {

			var self = this;
			properties = properties || null;
			useObjectStore = !!useObjectStore || false;

			if(typeOf(properties) === 'object') {

				Object.forEach(properties, function(value, property) {

					self.setProperty(property, value, useObjectStore);

				});

			}

		},

		/**
		 *	getProperties
		 *
		 *	Returns properties as an object.
		 *
		 *	@return object
		 */
		getProperties: function() {

			var self = this;
			var properties = {};

			Array.from(arguments).forEach(function(property) {

				var value = self.getProperty(property, true);

				if(value)
					value = self.getProperty(property);

				properties[property] = value;

			});

			return properties;

		},

		/**
		 *	hasEventListener
		 *
		 *	Returns true, or false whether node has event type attached.
		 *
		 *	@param string eventType
		 *
		 *	@return bool
		 */
		hasEventListener: function(eventType) {

			var self = this;

			var eventCallback = this.properties['event_' + eventType];

			return !!eventCallback;

		},

		/**
		 *	addEventListener
		 *
		 *	Attaches an event to context node.
		 *
		 *	@param string eventType
		 *	@param function eventCallback
		 *
		 *	@return self
		 */
		addEventListener: function(eventType, eventCallback) {

			if(typeOf(eventCallback) === 'function') {

				var eventTypeName = (NodeObject.Events[eventType] !== null) ? NodeObject.Events[eventType] : eventType;

				this.toNode().addEventListener(eventTypeName, eventCallback, false);

				if(eventType === 'mousewheel') {

					this.toNode().addEventListener(eventType, eventCallback, false);

				}

				this.properties['event_' + eventType, eventCallback];

				//this.setProperty('event_' + eventType, eventCallback, true);

			}

			return this;

		},

		/**
		 *	removeEventListener
		 *
		 *	Releases an attached event listener from context node.
		 *
		 *	@param string eventType
		 *
		 *	@return self
		 */
		removeEventListener: function(eventType) {

			if(this.hasEventListener(eventType) === true) {

				var eventCallback = this.properties['event_' + eventType];

				this.toNode().removeEventListener(eventType, eventCallback, false);

				delete this.properties['event_' + eventType];

				//this.removeProperty('event_' + eventType, true);

			}

			return this;

		},

		/**
		 *	hasClass
		 *
		 *	Returns boolean if context node has a class assigned to it.
		 *
		 *	@param string className
		 *
		 *	@return string
		 */
		hasClass: function(className) {

			return this.toNode().className.trimWhitespace().contains(className);

		},

		/**
		 *	addClass
		 *
		 *	Appends a class name to context node.
		 *
		 *	@param string className
		 *
		 *	@return self
		 */
		addClass: function(className) {

			if(this.hasClass(className) === false)
				this.toNode().className = (this.toNode().className + ' ' + className);

			return this;

		},

		/**
		 *	removeClass
		 *
		 *	Removes a class name from context node.
		 *
		 *	@param string className
		 *
		 *	@return self
		 */
		removeClass: function(className) {

			var regexClassName = '(^|\\s)' + className + '(?:\\s|$)';

			this.toNode().className = this.toNode().className.replace(new RegExp(regexClassName), '$1').trimWhitespace();

			return this;

		},

		/**
		 *	toggleClass
		 *
		 *	Toggles a class name on an element.
		 *
		 *	@param stirng className Class name.
		 *
		 *	@return void
		 */
		toggleClass: function(className) {

			if(this.hasClass(className) === true) {

				this.removeClass(className);

			} else {

				this.addClass(className);

			}

		},

		/**
		 *	getComputedStyle
		 *
		 *	Returns object with computed style properties.
		 *
		 *	@return obj
		 */
		getComputedStyle: function() {

			var obj = {};
			var computedStyles = window.getComputedStyle (this.toNode(), null);

			for(var n = 0; n < computedStyles.length; n++) {

				var property = computedStyles[n];
				obj[property] = computedStyles[property];

			}

			return obj;

		},

		/**
		 *	setStyle
		 *
		 *	Sets node CSS style property.
		 *
		 *	@param string styleProperty
		 *	@param string styleValue
		 *
		 *	@return self
		 */
		setStyle: function(styleProperty, styleValue) {

			styleValue = '' + styleValue;

			if(NodeObject.StyleUnitProperties.indexOf(styleProperty) >= 0) {

				if(styleValue.match(/[0-9]*\.?[0-9]+%/) === null) {

					styleValue += 'px';

				}

			}

			this.toNode().style[styleProperty.toCamelCase()] = styleValue;

			return this;

		},

		/**
		 *	setStyles
		 *
		 *	Sets several style properties.
		 *
		 *	@param object styleObject
		 *
		 *	@return self
		 */
		setStyles: function(styleObject) {

			for(var n in styleObject) {

				var property = n;
				var value = styleObject[n];

				this.setStyle(property, value);

			}

			return this;

		},

		/**
		 *	getStyle
		 *
		 *	Return CSS style property value.
		 *
		 *	@param string styleProperty
		 *
		 *	@return string
		 */
		getStyle: function(styleProperty) {

			var property = this.toNode().style[styleProperty.toCamelCase()];

			if(property === '') {

				property = this.getComputedStyle()[styleProperty];

			}

			if(property !== undefined && property.match(/(\b|\B)(?:-?\d*\.?\d+)(?:(cm|mm|in|pt|pc|px))\b/ig) !== null) {

				property = parseInt(property.replace(/[^\-\d\.]/g, ''), 10);

			}

			return property;

		},

		/**
		 *	getSize
		 *
		 *	Returns size of context node as an object.
		 *
		 *	@param boolean returnScrollSize
		 *
		 *	@return object
		 */
		getSize: function(returnScrollSize) {

			returnScrollSize = returnScrollSize || false;

			var x = this.toNode().innerWidth;
			var y = this.toNode().innerHeight;

			if(typeOf(this.toNode()) === 'element') {

				x = (returnScrollSize === false) ? this.toNode().offsetWidth : this.toNode().scrollWidth;
				y = (returnScrollSize === false) ? this.toNode().offsetHeight : this.toNode().scrollHeight;

			}

			return {
				width: x,
				height: y
			};

		},

		/**
		 *	getWidth
		 *
		 *	Returns element width.
		 *
		 *	@return int
		 */
		getWidth: function() {

			return this.getSize().width;

		},

		/**
		 *	getHeight
		 *
		 *	Returns element height.
		 *
		 *	@return int
		 */
		getHeight: function() {

			return this.getSize().height;

		},

		/**
		 *	getScroll
		 *
		 *	Returns scroll size of context node.
		 *
		 *	@return object
		 */
		getScroll: function() {

			var x = (pageXOffset !== undefined) ? pageXOffset : 0;
			var y = (pageYOffset !== undefined) ? pageYOffset : 0;

			if(typeOf(this.toNode()) === 'element') {

				x = this.toNode().scrollLeft;
				y = this.toNode().scrollTop;

			}

			return {
				left: x,
				top: y
			};

		},

		/**
		 *	scroll
		 *
		 *	Either scrolls, or returns scroll offsets.
		 *
		 *	@return bool|obj|null
		 */
		scroll: function() {

			var args = Array.from(arguments);
			var x = 0;
			var y = 0;

			if(args.length === 0) {

				return this.getScroll();

			} else if(args.length > 0) {

				this.toNode().scrollLeft = (!!args[0]) ? args[0] : 0;

				this.toNode().scrollTop = (!!args[1]) ? args[1] : 0;

				return this;

			}

			return null;

		},

		/**
		 *	getPosition
		 *
		 *	Returns element position relative to parent parent.
		 *
		 *	@return object
		 */
		getPosition: function() {

			var x = 0;
			var y = 0;
			var node = this.toNode();

			do {

				x += node.offsetLeft || 0;
				y += node.offsetTop || 0;
				node = node.offsetParent;

				if(node) {

					if(node === document.body)
						break;

					var pos = new Node(node).getStyle('position');

					if(pos !== 'static')
						break;

				}

			} while(node);

			node = new Node(node);

			x -= node.getStyle('margin-left');
			y -= node.getStyle('margin-top');
			x -= node.getStyle('padding-left');
			y -= node.getStyle('padding-top');

			return {
				left: x,
				top: y
			};

		},

		/**
		 *	position
		 *
		 *	Either changes node position, or returns node position, does not change position if node does not have a static position.
		 *
		 *	@return object
		 */
		position: function() {

			var args = Array.from(arguments);
			var x = 0;
			var y = 0;

			if(args.length === 0) {

				return this.getPosition();

			} else if(args.length > 0 && this.getStyle('position') !== 'static') {

				if(args[0] !== undefined)
					this.setStyle('left', (typeOf(args[0]) === 'numeric') ? args[0] + 'px' : args[0]);

				if(args[1] !== undefined)
					this.setStyle('top', (typeOf(args[1]) === 'numeric') ? args[1] + 'px' : args[1]);

				return this;

			}

			return null;

		},

		/**
		 *	offset
		 *
		 *	Returns node offsets.
		 *
		 *	@return object
		 */
		offset: function() {

			return Object.append({}, this.toNode().getBoundingClientRect());

		},

		/**
		 *	isChecked
		 *
		 *	Returns whether an object is checked or not.
		 *
		 *	@return bool
		 */
		isChecked: function() {

			return !!this.getProperty('checked');

		},

		/**
		 *	isSelected
		 *
		 *	Returns whether an object is selected or not.
		 *
		 *	@return bool
		 */
		isSelected: function() {

			return !!this.getProperty('selected');

		},

		/**
		 *	isInput
		 *
		 *	Returns whether or not current node is input or not.
		 *
		 *	@return bool
		 */
		isInput: function() {

			return (['input', 'textarea'].indexOf(this.get('tag')) !== -1 || (this.get('tag') === 'input' && ['text', 'email', 'search', 'tel', 'number'].indexOf(this.get('type')) !== -1));

		},

		/**
		 *	focus
		 *
		 *	Focuses on element.
		 *
		 *	@return self
		 */
		focus: function() {

			this.toNode().focus();

			return this;

		},

		/**
		 *	blur
		 *
		 *	Blurs element focus.
		 *
		 *	@return self
		 */
		blur: function() {

			this.toNode().blur();

			return this;

		},

		/**
		 *	set
		 *
		 *	Sets events, styles an properties.
		 *
		 *	@param string|object property
		 *
		 *	@return self
		 */
		set: function(property) {

			var self = this;

			var parameter = (arguments[1] !== undefined) ? arguments[1] : null;

			if(typeOf(property) === 'string') {

				if(property === 'class') {

					this.addClass(parameter);

				}

				if(property.substr(0, 7) === 'remove:') {

					this.removeEventListener(property.substr(7));

				}

				if(NodeObject.Styles.indexOf(property) !== -1 && (typeOf(parameter) === 'string' || typeOf(parameter) === 'number')) {

					this.setStyle(property, parameter);

				} else if(NodeObject.Events.hasOwnProperty(property) === true && typeOf(parameter) === 'function') {

					this.addEventListener(property, parameter);

				} else {

					this.setProperty(property, parameter);

				}

			} else if(typeOf(property) === 'object') {

				Object.forEach(property, function(parameter, property) {

					self.set(property, parameter);

				});

			}

			return this;

		},

		/**
		 *	get
		 *
		 *	Returns an array of property values from context node.
		 *
		 *	@return string|object
		 */
		get: function() {

			var properties = Array.from(arguments);

			if(properties.length === 1)
				return this.getProperty(properties);

			return this.getProperties(properties);

		}

	});



	/**
	 *	query
	 *
	 *	Selects nodes based on CSS selector, creates a new instance of Node for each node.
	 *
	 *	@return array
	 */
	var query = this.query = function() {

		var returnNodeList = [];

		if(arguments && arguments.length === 0)
			return null;

		Array.prototype.slice.call(arguments).forEach(function(argument, index) {

			if(typeOf(argument) !== 'string') {

				returnNodeList.push(new Node(argument));

			} else {

				var nodeList = document.querySelectorAll(argument);

				for(var n in nodeList) {

					if(nodeList.propertyIsEnumerable(n) === true) {

						if(typeOf(nodeList[n]) === 'element') {

							returnNodeList.push(new Node(nodeList[n]));

						}

					}

				}

			}

		});

		return returnNodeList;

	};



	var $ = this.$ = function() {

		var selectors = [];
		var properties = {};

		Array.from(arguments).forEach(function(argument) {

			if(typeOf(argument) === 'string' || argument instanceof Node || argument.nodeType === 1) {

				selectors.push(argument);

			} else if(Object.prototype.toString.call(argument) === '[object Object]') {

				Object.append(properties, argument);

			}

		});

		query.apply(null, selectors).all('set', properties);

	};

}).call(window);