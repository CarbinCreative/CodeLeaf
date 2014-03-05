(function() {

	if(window.Catalyst === undefined)
		throw "Catalyst Core not included.";



	/**
	 *	CodeLeaf.Token
	 *
	 *	Used to create "tokens" for syntax highlighting.
	 */
	CodeLeaf.Token = function(type, definition) {

		this.type = type;

		this.definition = definition;

	};

	CodeLeaf.Token.toToken = function(object) {

		if(typeOf(object) === 'string')
			return object;

		if(Object.prototype.toString.call(object) == '[object Array]') {

			return object.map(CodeLeaf.Token.toToken).join('');

		}

		var attributes = [' '];

		if(typeOf(object) !== 'object')
			return false;

		var token = {
			type: object.type,
			definition: CodeLeaf.Token.toToken(object.definition),
			nodeName: 'span',
			classNames: ['token', object.type],
			attributes: {}
		};

		if(token.type === 'comment') {

			token.attributes['spellcheck'] = 'true';

		}

		for(var attribute in token.attributes) {

			var attr = attribute + '="' + (token.attributes[attribute] || '') + '"';
			attributes.push(attr);

		}

		return '<' + token.nodeName + ' class="' + token.classNames.join(' ') + '"' + attributes.join(' ') + '>' + token.definition + '</' + token.nodeName + '>';

	};



	/**
	 *	CodeLeaf.Tokenizer
	 *
	 *	Tokenizes regexp matches in a string and wraps them in a <span> element.
	 */
	CodeLeaf.Tokenizer = new Class({

		construct: function(id, definitions) {

			this.id = id;
			this.definitions = definitions;

		},

		/**
		 *	tokenize
		 *
		 *	Parses and tokenizes matches in string.
		 *
		 *	@param string string
		 *	@param object definition
		 *
		 *	@return string
		 */
		tokenize: function(string, definition) {

			var Token = CodeLeaf.Token;
			var tokenized = [string];
			var inherit = (definition && definition.hasOwnProperty('inherit')) ? definition.inherit : null;
			var definition = definition || this.definitions;

			if(inherit !== null) {

				for(var token in inherit) {

					definition[token] = inherit[token];

				}

				delete definition.inherit;

			}

			tokenizer: for (var token in definition) {

				if(!definition.hasOwnProperty(token) || !definition[token])
					continue;

				var pattern = definition[token];
				var subToken = pattern.subToken;
				var matchIndex = pattern.matchIndex || 0;
				var lookBehind = !!pattern.lookBehind || 0;

				pattern = pattern.regex || pattern;

				for (var n = 0; n < tokenized.length; n++) {

					var tmp = tokenized[n];

					if(tokenized.length > string.length)
						break tokenizer;

					if(tmp instanceof Token)
						continue;

					pattern.lastIndex = 0;

					var match = pattern.exec(tmp);

					if(match) {

						if(lookBehind) {

							lookBehind = lookBehind.match[1].length;

						}

						var from = match.index - 1 + lookBehind;
						var match = match[0].slice(lookBehind);
						var to = from + match.length;
						var before = tmp.slice(0, from + 1);
						var after = tmp.slice(to + 1);
						var args = [n, 1];

						if(before) {

							args.push(before);

						}

						var wrapped = new Token(token, subToken ? this.tokenize(match, subToken) : match);

						args.push(wrapped);

						if(after) {

							args.push(after);

						}

						Array.prototype.splice.apply(tokenized, args);

					}

				}

			}

			return tokenized;

		},

		getOutput: function(string) {

			return CodeLeaf.Token.toToken(this.tokenize(string, this.definitions));

		}

	});

}).call(window);