(function() {

	if(window.Catalyst === undefined)
		throw "Catalyst Core not included.";




	/**
	 *	CodeLeaf.Bundles
	 *
	 *	Holds CodeLeaf editor bundles.
	 *
	 *	@return object
	 */
	CodeLeaf.Bundles = {

		/**
		 *	Store
		 *
		 *	Bundle store.
		 *
		 *	@return object
		 */
		Store: {},

		/**
		 *	register
		 *
		 *	Registers an editor bundle.
		 *
		 *	@param string bundleId
		 *	@param object bundleObject
		 *
		 *	@return void
		 */
		register: function(bundleId, bundleObject) {

			var bundle = new CodeLeaf.Bundle(bundleObject);

			this.Store[bundleId.toLowerCase()] = bundle;

			this[bundleId] = bundle;

		},

		/**
		 *	unregister
		 *
		 *	Unregisters a registered bundle.
		 *
		 *	@param string bundleId
		 *
		 *	@return void
		 */
		unregister: function(bundleId) {

			delete this.Store[bundleId.toLowerCase()];

			delete this[bundleId];

		},

		/**
		 *	get
		 *
		 *	Returns a registered bundle.
		 *
		 *	@return object
		 */
		get: function(bundleId) {

			return this.Store[bundleId.toLowerCase()];

		}

	};



	/**
	 *	CodeLeaf.Bundle
	 *
	 *	CodeLeaf bundle.
	 */
	CodeLeaf.Bundle = new Class({

		/**
		 *	@var array relatedTo
		 */
		relatedTo: [],

		/**
		 *	@var object SyntaxTokens
		 */
		SyntaxTokens: {},

		/**
		 *	@var object TypingPairs
		 */
		TypingPairs: {},

		/**
		 *	@var object Autocomplete
		 */
		Autocomplete: {},

		/**
		 *	@var object Tooltips
		 */
		Tooltips: {},

		/**
		 *	@var object Snippets
		 */
		Snippets: {},

		/**
		 *	@var object KeyBindings
		 */
		KeyBindings: {},

		/**
		 *	Constructor
		 *
		 *	Defined bundle object.
		 *
		 *	@param object bundleDefinitions
		 *
		 *	@return void
		 */
		construct: function(bundleDefinitions) {

			var self = this;

			bundleDefinitions = Object.append(bundleDefinitions, {
				relatedTo: [],
				SyntaxTokens: {},
				TypingPairs: {},
				Autocomplete: {},
				Tooltips: {},
				Snippets: {},
				KeyBindings: {}
			});

			this.relatedTo = bundleDefinitions.relatedTo;
			this.SyntaxTokens = bundleDefinitions.SyntaxTokens;
			this.TypingPairs = bundleDefinitions.TypingPairs;
			this.Autocomplete = bundleDefinitions.Autocomplete;
			this.Tooltips = bundleDefinitions.Tooltips;
			this.Snippets = bundleDefinitions.Snippets;
			this.KeyBindings = bundleDefinitions.KeyBindings;

			if(bundleDefinitions.hasOwnProperty('extends') === true) {

				bundleDefinitions.extends.forEach(function(item, index) {

					var t;
					var scope;
					var bundle;
					var bundleId;
					var property;

					if(typeOf(item) == 'array') {

						scope = item[1];
						t = item[0];

					} else {

						t = item;

					}

					var tmp = t.split(':');

					if(tmp.length === 2) {

						property = tmp[1];
						bundleId = tmp[0];
						bundle = CodeLeaf.Bundles[bundleId];

						self.relatedTo.push(bundleId);

						if(bundle.hasOwnProperty(property) === true) {

							if(scope !== undefined) {

								self[property] = Object.append({
									'scope': {
										regex: scope,
										subToken: bundle[property]
									}
								}, self[property]);

							} else {

								self[property] = Object.append(bundle[property], self[property]);

							}

						}

					} else {

						property = null;
						bundleId = tmp.pop();
						bundle = CodeLeaf.Bundles[bundleId];

						['SyntaxTokens', 'TypingPairs', 'Autocomplete', 'Tooltips', 'Snippets', 'KeyBindings'].forEach(function(property) {

							if(bundle.hasOwnProperty(property) === true) {

								self[property] = Object.append(bundle[property], self[property]);

							}

						});

					}

				});

			}

		},

		/**
		 *	hasTypingPair
		 *
		 *	Checks if a typing pair exists for this bundle.
		 *
		 *	@param string typingPair
		 *
		 *	@return boolean
		 */
		hasTypingPair: function(typingPair) {

			return this.TypingPairs.hasOwnProperty(typingPair);

		},

		/**
		 *	typingPair
		 *
		 *	Returns closing typing pair.
		 *
		 *	@param string typingPair
		 *
		 *	@return string
		 */
		typingPair: function(typingPair) {

			return this.TypingPairs[typingPair];

		},

		/**
		 *	hasSnippet
		 *
		 *	Checks if a snippet exists for this bundle.
		 *
		 *	@param string snippetTrigger
		 *
		 *	@return boolean
		 */
		hasSnippet: function(snippetTrigger) {

			if(typeOf(this.Snippets) === 'object') {

				return this.Snippets.hasOwnProperty(snippetTrigger);

			}

		}

	});

}).call(window);