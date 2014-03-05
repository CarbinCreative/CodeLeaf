(function() {

	if(window.CodeLeaf === undefined)
		throw "CodeLeaf Core not included.";

	if(window.CodeLeaf.Bundles === undefined)
		throw "CodeLeaf Bundle not included.";

	if(window.CodeLeaf.Tokenizer === undefined)
		throw "CodeLeaf Tokenizer not included.";



	/**
	 *	CodeLeaf.Editor
	 */
	CodeLeaf.Editor = new Class({

		construct: function(targetNode, options) {

			this.targetNode = targetNode;

			this.options = Object.append({
				editable: true,
				bundle: 'Generic',
				brush: 'CodeLeaf',
				stateChange: null
			}, options);

			this.setup();

		},

		setup: function() {

			var self = this;

			this.hasTooltip = false;
			this.currentTooltip = null;

			this.hasSnippet = false;
			this.currentSnippet = null;
			this.currentSnippetIndex = -1;

			this.makeIndentation = true;

			this.hasAutocomplete = false;
			this.currentAutocomplete = null;

			this.Brush = this.options.brush;
			this.Bundle = this.options.bundle;
			this.BundleObject = CodeLeaf.Bundles.get(this.Bundle);

			this.targetNode.set('spellcheck', 'false');

			this.targetNode.addClass(this.Brush.toLowerCase());
			this.targetNode.addClass(this.Bundle.toLowerCase());

			if(this.BundleObject.relatedTo && this.BundleObject.relatedTo.length > 0) {

				this.targetNode.addClass(this.BundleObject.relatedTo.join(' ').toLowerCase());

			}

			if(this.targetNode.isInput() === false) {

				this.targetNode.set('editable', this.options.editable.toString());

			}

			this.tokenizerObject = new CodeLeaf.Tokenizer(this.targetNode, this.BundleObject.SyntaxTokens);

			var wrapperNode = new Node('div', {
				'class': 'codeleaf-editor'
			}).wrap(this.targetNode);

			var viewportNode = new Node('div', {
				'class': 'codeleaf-editor-viewport'
			}).inject(wrapperNode, 'top');

			this.observe();

			this.invokeSyntaxHighlight();

		},

		observe: function() {

			var self = this;

			this.targetNode.set({

				'keyup': function(event) {

					event = new EventObject(event);

					self.targetNode.saveCaretPosition();

					var textObject = self.targetNode.textObject();

					if(typeOf(self.options.stateChange) === 'function') {

						self.options.stateChange(textObject);

					}

					if(typeOf(self.BundleObject.KeyBindings) === 'object' && Object.keys(self.BundleObject.KeyBindings).length > 0) {

						Object.forEach(self.BundleObject.KeyBindings, function(callback, sequence) {

							if(event.isSequence(sequence) === true) {

								self.targetNode.saveCaretPosition();

								callback(self);

								self.invokeSyntaxHighlight();

							}

						});

					}

				},

				'keydown': function(event) {

					event = new EventObject(event);

					self.targetNode.saveCaretPosition();

					if(event.isSequence('return') === true) {

						event.stop();

						self.newLine(self.targetNode);

						self.escapeSnippet();

						self.targetNode.saveCaretPosition();

					}

					if(event.isSequence('tab') === true) {

						event.stop();

						var lastWord = self.targetNode.textObject().textBefore.trimWhitespace().replace(/(<([^>]+)>)/ig, '').lastWord();

						if(self.BundleObject.hasSnippet(lastWord) === true && self.hasSnippet === false) {

							self.makeIndentation = false;
							self.hasSnippet = true;
							self.currentSnippet = self.BundleObject.Snippets[lastWord];

							self.insertSnippet(lastWord, self.currentSnippet);

						} else if(self.hasSnippet === true) {

							self.currentSnippetIndex++;

							if(self.currentSnippet.hasOwnProperty('tabSelections') === false) {

								self.currentSnippet.tabSelections = [];

							}

							if(self.currentSnippetIndex < self.currentSnippet.tabSelections.length) {

								self.tabSnippet(self.currentSnippet);

							} else {

								if(self.currentSnippet.hasOwnProperty('escape') && self.currentSnippet.escape === true) {

									var textObject = self.targetNode.textObject();
									var item = self.currentSnippet.insertText;
									var escapeTrigger = item[item.length - 1];

									if(escapeTrigger !== null && textObject.currentLine.contains(escapeTrigger)) {

										var position = textObject.currentLine.lastIndexOf(escapeTrigger);
										var selectionStart = textObject.linesBeforeCurrent.length + position;
										var selectionEnd = selectionStart + escapeTrigger.length;

										if(textObject.linesBeforeCurrent && textObject.linesBeforeCurrent.lastIndexOf('\n') !== -1) {

											selectionStart++;
											selectionEnd++;

										}

										self.escapeSnippet();

										self.targetNode.selectRange(selectionEnd, selectionEnd);

									}

								} else {

									self.escapeSnippet();

								}

							}

						} else if(self.makeIndentation === true && self.hasSnippet === false) {

							var nextChar = self.targetNode.textObject().textAfter.substring(0, 1);
							var typingPairs = self.BundleObject.TypingPairs;
							var typingPair = (Object.keys(typingPairs).filter(function(key) {

								return typingPairs[key] === nextChar;

							})).pop();

							if(nextChar === ':' || typingPairs.hasOwnProperty(typingPair)) {

								var caretPosition = self.targetNode.selectionStart() + nextChar.length;

								self.targetNode.selectRange(caretPosition, caretPosition);

							} else {

								self.enTab();

								self.invokeSyntaxHighlight();

							}

						}

						self.targetNode.saveCaretPosition();

					}

					if(event.isSequence('shift + tab') === true) {

						event.stop();

						self.deTab(self.targetNode);

						self.targetNode.saveCaretPosition();

					}

					if(event.isSequence('escape') === true || event.isSequence('return') === true) {

						event.stop();

						self.targetNode.saveCaretPosition();

					}

					if(event.isSequence('space') === true) {

						self.invokeSyntaxHighlight();

					}

					if(event.isSequence('backspace') === true) {

						var text = self.targetNode.get('text');
						var selectionStart = self.targetNode.selectionStart();
						var selectionEnd = self.targetNode.selectionEnd();
						var prevChar = text.slice(selectionStart - 1, selectionStart);
						var nextChar = text.slice(selectionStart, selectionStart + 1);
						var typingPairs = self.BundleObject.TypingPairs;

						if(self.BundleObject.hasTypingPair(prevChar) === true && self.BundleObject.typingPair(prevChar) === nextChar) {

							var selectionEnd = self.targetNode.selectionEnd();
							self.targetNode.set('text', self.targetNode.get('text').splice(selectionEnd - 1, 1));

							self.targetNode.selectRange(selectionEnd);

							self.invokeSyntaxHighlight();

						}

					}

				},

				'keypress': function(event) {

					event = new EventObject(event);

					if(self.BundleObject.hasTypingPair(event.key) === true) {

						event.stop();

						var openingPair = event.key;
						var closingPair = self.BundleObject.TypingPairs[event.key];

						self.typingPairs(openingPair, closingPair);

						self.targetNode.saveCaretPosition();

					}

				},

				'paste': function() {

					(function() {

						self.targetNode.set('html', self.targetNode.get('html').replace(/(<\w+)(\s.+?>)/g, '$1>').replace(/<\/?pre>/g, '').replace(/(<div>)?<br>|(<div>)+/gi, '\n').replace(/<\/div>/gi, '').replace(/&nbsp;/gi, ' '));

						self.invokeSyntaxHighlight();

					}).delay(10);

				},

				'click': function() {

					self.escapeSnippet();

				}

			});

		},

		invokeSyntaxHighlight: function() {

			if(this.targetNode.isInput() === false) {

				this.targetNode.saveCaretPosition();

				var normalizedText = this.targetNode.get('text').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\u00a0/g, ' ');

				var output = this.tokenizerObject.getOutput(normalizedText);

				this.targetNode.set('html', output);

				this.targetNode.restoreCaretPosition();

			}

		}

	});

	CodeLeaf.Editor.implement({

		newLine: function() {

			var textObject = this.targetNode.textObject();
			var textBefore = textObject.textBefore;

			var lastNewLine = textBefore.lastIndexOf('\n') + 1;
			var indentation = (textBefore.slice(lastNewLine).match(/^\s+/) || [''])[0];

			indentation = indentation.replace(/\r?\n\s/g, '\n');

			this.targetNode.insertText(indentation, '\n', '', true, 'moveAfter');

			this.invokeSyntaxHighlight();

		},

		enTab: function() {

			if(this.targetNode.hasSelection() === false) {

				this.targetNode.insertText('', '\t', null, false, 'moveAfter');

			} else {

				var property = (this.targetNode.isInput() === true) ? 'value' : 'text';
				var textObject = this.targetNode.textObject();

				var selectionStart = textObject.selectionStart;
				var selectionEnd = textObject.selectionEnd;

				var textBefore = textObject.textBefore;
				var textAfter = textObject.textAfter;
				var textSelected = textObject.textSelected;

				var lastNewLine = textBefore.lastIndexOf('\n') + 1;

				textBefore = textBefore.splice(lastNewLine, 0, '\t');
				textSelected = textSelected.replace(/\r?\n/g, '\n\t');

				selectionStart++;
				selectionEnd = selectionStart + textSelected.length;

				this.targetNode.set(property, textBefore + textSelected + textAfter);

				this.targetNode.selectRange(selectionStart, selectionEnd);

			}

			this.invokeSyntaxHighlight();

		},

		deTab: function() {

			var property = (this.targetNode.isInput() === true) ? 'value' : 'text';
			var textObject = this.targetNode.textObject();

			var selectionStart = textObject.selectionStart;
			var selectionEnd = textObject.selectionEnd;

			var textBefore = textObject.textBefore;
			var textAfter = textObject.textAfter;
			var textSelected = textObject.textSelected;

			var lastNewLine = textBefore.lastIndexOf('\n') + 1;

			if(/\s/.test(textBefore.charAt(lastNewLine))) {

				textBefore = textBefore.splice(lastNewLine, 1);

			}

			textSelected = textSelected.replace(/\r?\n\s/g, '\n');

			selectionStart = textBefore.length;
			selectionEnd = selectionStart + textSelected.length;

			this.targetNode.set(property, textBefore + textSelected + textAfter);

			this.targetNode.selectRange(selectionStart, selectionEnd);

			this.invokeSyntaxHighlight();

		},

		typingPairs: function(openingPair, closingPair) {

			this.targetNode.insertText(this.targetNode.selectedText(), openingPair, closingPair, true);

			this.invokeSyntaxHighlight();

		},

		insertSnippet: function(snippetTrigger, snippetObject) {

			this.targetNode.saveCaretPosition();

			var property = (this.targetNode.isInput() === true) ? 'value' : 'text';
			var textObject = this.targetNode.textObject();

			var selectionStart = textObject.selectionStart;
			var selectionEnd = textObject.selectionEnd;

			var textBefore = textObject.textBefore;
			var textAfter = textObject.textAfter;
			var textSelected = textObject.textSelected;

			textBefore = textBefore.substring(0, (textBefore.length - snippetTrigger.length));

			this.targetNode.set(property, '');

			this.targetNode.insertText('', textBefore + snippetObject.insertText[0], snippetObject.insertText[1] + textAfter);

			this.invokeSyntaxHighlight();

		},

		tabSnippet: function(snippetObject) {

			var self = this;

			var selectSnippetTabSelection = function(snippetTabSelection) {

				var position = textObject.currentLine.lastIndexOf(snippetTabSelection);
				var selectionStart = textObject.linesBeforeCurrent.length + position;
				var selectionEnd = selectionStart + snippetTabSelection.length;

				if(textObject.linesBeforeCurrent && textObject.linesBeforeCurrent.lastIndexOf('\n') !== -1) {

					selectionStart++;
					selectionEnd++;

				}

				self.targetNode.selectRange(selectionStart, selectionEnd);

			};

			if(snippetObject.hasOwnProperty('tabSelections') === false) {

				snippetObject.tabSelections = [];

			}

			var textObject = this.targetNode.textObject();
			var snippetTabSelection = snippetObject.tabSelections[this.currentSnippetIndex];

			if(textObject.currentLine.contains(snippetTabSelection) === true) {

				selectSnippetTabSelection(snippetTabSelection);

			} else {

				var currentSnippetIndex = this.currentSnippetIndex;
				var currentSnippetTabSelection = snippetTabSelection;

				do {

					currentSnippetIndex++;
					currentSnippetTabSelection = snippetObject.tabSelections[currentSnippetIndex];

				} while(
					currentSnippetTabSelection !== undefined
					&& currentSnippetIndex < snippetObject.tabSelections.length
					&& textObject.currentLine.contains(currentSnippetTabSelection) === false
				);

				if(currentSnippetTabSelection !== undefined) {

					this.currentSnippetIndex = currentSnippetIndex;

					selectSnippetTabSelection(currentSnippetTabSelection);

				} else {

					this.escapeSnippet();

				}

			}

			this.invokeSyntaxHighlight();

		},

		escapeSnippet: function() {

			this.makeIndentation = true;
			this.currentSnippetIndex = -1;
			this.currentSnippet = null;
			this.hasSnippet = false;

			this.invokeSyntaxHighlight();

		}

	});

}).call(window);