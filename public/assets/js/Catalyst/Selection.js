(function() {

	if(window.Catalyst === undefined)
		throw "Catalyst Core not included.";



	this.Node.implement({

		/**
		 *	locateOffsetNode
		 *
		 *	Attempts to find offset node in HTML source of context node.
		 *
		 *	@param Element contextNode
		 *	@param int selectionStart
		 *
		 *	@return object
		 */
		locateOffsetNode: function(selectionStart) {

			var offset = 0;
			var node = this.toNode();
			var container = node;

			do {

				node = node.firstChild;

				if(node) {

					do {

						var length = node.textContent.length;

						if(offset <= selectionStart && offset + length > selectionStart)
							break;

						offset += length;

					} while(node = node.nextSibling);

				}

				if(!node)
					break;

			} while(node && node.hasChildNodes() && node.nodeType != 3);

			if(node) {

				return {
					node: node,
					offset: selectionStart - offset
				};

			} else if(container) {

				node = container;

				while(node && node.lastChild) {

					node = node.lastChild;

				}

				if(node.nodeType === 3) {

					return {
						node: node,
						offset: node.textContent.length
					};

				} else {

					return {
						node: node,
						offset: 0
					};

				}

			}

			return {
				node: this.toNode(),
				offset: 0
			};

		},

		/**
		 *	offsetNode
		 *
		 *	Returns current offset node of context node.
		 *
		 *	@return node|boolean
		 */
		offsetNode: function() {

			var selection = window.getSelection();

			if(selection.rangeCount) {

				var range = selection.getRangeAt(0);
				var node = range.startContainer;

				if(node.nodeType === 3)
					node = node.parentNode;

				if(node !== this.toNode())
					return node;

				return false;

			}

			return false;

		},

		/**
		 *	selectionStart
		 *
		 *	Returns context node selection start.
		 *
		 *	@return int
		 */
		selectionStart: function() {

			var selection = window.getSelection();

			if(this.isInput() === true) {

				return this.toNode().selectionStart;

			}

			if(selection.rangeCount) {

				var range = selection.getRangeAt(0);
				var node = range.startContainer;
				var offset = range.startOffset;
				var parentNode = node;

				if(!(this.toNode().compareDocumentPosition(node) & 0x10))
					return 0;

				do {

					while(node = node.previousSibling) {

						if(node.textContent)
							offset += node.textContent.length;

					}

					node = parentNode = parentNode.parentNode;

				} while(node && node !== this.toNode());

				return offset;

			}

			return 0;

		},

		/**
		 *	selectionEnd
		 *
		 *	Returns context node selection end.
		 *
		 *	@return int
		 */
		selectionEnd: function() {

			var selection = window.getSelection();

			if(this.isInput() === true) {

				return this.toNode().selectionEnd;

			}

			if(selection.rangeCount) {

				return this.selectionStart() + (selection.getRangeAt(0) + '').length;

			}

			return 0;

		},

		/**
		 *	hasSelection
		 *
		 *	Returns boolean if context node has a selection.
		 *
		 *	@return boolean
		 */
		hasSelection: function() {

			if(this.selectionStart() !== this.selectionEnd())
				return true;

			return false;

		},

		/**
		 *	saveCaretPosition
		 *
		 *	Saves caret position.
		 *
		 *	@return void
		 */
		saveCaretPosition: function() {

			this.setProperty('ss', this.selectionStart(), true);
			this.setProperty('se', this.selectionEnd(), true);

		},

		/**
		 *	restoreCaretPosition
		 *
		 *	Restores caret position from last saved caret position.
		 *
		 *	@return void
		 */
		restoreCaretPosition: function() {

			if(this.hasProperty('ss', true) === true && this.hasProperty('se', true) === true) {

				this.selectRange(this.getProperty('ss', true), this.getProperty('se', true));

			}

		},

		/**
		 *	selectedText
		 *
		 *	Returns selected text, if any.
		 *
		 *	@return string|null
		 */
		selectedText: function() {

			var selectionStart = this.selectionStart();
			var selectionEnd = Math.abs(this.selectionEnd() - selectionStart);
			var property = (this.isInput() === true) ? 'value' : 'text';

			return this.get(property).substr(selectionStart, selectionEnd);

		},

		/**
		 *	selectRange
		 *
		 *	Selects text range based on selection start, and selection end indexes, accounts for HTML offset nodes.
		 *
		 *	@param int selectionStart
		 *	@param int selectionEnd
		 *
		 *	@return void
		 */
		selectRange: function(selectionStart, selectionEnd) {

			var node = this.toNode();

			this.focus();

			if(this.isInput() === true) {

				return this.toNode().setSelectionRange(selectionStart, selectionEnd);

			}

			var range = document.createRange();
			var selection = window.getSelection();
			var offset = this.locateOffsetNode(selectionStart);

			range.setStart(offset.node, offset.offset);

			if(selectionEnd && selectionEnd != selectionStart)
				offset = this.locateOffsetNode(selectionEnd);

			range.setEnd(offset.node, offset.offset);

			selection.removeAllRanges();
			selection.addRange(range);

			this.saveCaretPosition();

		},

		/**
		 *	textObject
		 *
		 *	Returns text before selection, after selection and selected text as an object.
		 *
		 *	@return object
		 */
		textObject: function() {

			var selectionStart = this.selectionStart();
			var selectionEnd = this.selectionEnd();

			var lineHeight = 15; //(this.getStyle('line-height')) ? this.getStyle('line-height') : 14;
			var textContent = (this.isInput() === true) ? this.get('value') : this.get('text');
			var textContentLines = textContent.split('\n');

			var textBefore = textContent.substr(0, selectionStart);
			var textAfter = textContent.substr(selectionEnd, textContent.length);
			var textSelected = this.selectedText();

			var elementSize = this.getSize();
			var elementScrollSize = this.getSize(true);
			var elementScrollPosition = this.scroll();

			var numLines = Math.floor(Math.abs(elementScrollSize.height / lineHeight));
			var numVisibleLines = Math.floor(Math.abs(elementSize.height / lineHeight));
			var numLinesBefore = Math.floor(Math.abs(elementScrollPosition.top / lineHeight));
			var numLinesAfter = numLines - (numLinesBefore + numVisibleLines + 1);
			var numCurrentLine = textContent.substr(0, selectionStart).split("\n").length;
			var currentLine = textContentLines[numCurrentLine - 1];

			return {
				selectionStart: selectionStart,
				selectionEnd: selectionEnd,
				textBefore: textBefore,
				textAfter: textAfter,
				textSelected: textSelected,
				linesBefore: textContentLines.slice(0, numLinesBefore).join('\n'),
				linesAfter: textContentLines.slice(numLinesBefore + numVisibleLines + 1, textContentLines.length).join('\n'),
				linesVisible: textContentLines.slice(numLinesBefore, numLinesBefore + numVisibleLines + 1).join('\n'),
				linesBeforeCurrent: textContentLines.slice(0, numCurrentLine - 1).join('\n'),
				linesAfterCurrent: textContentLines.slice(numCurrentLine).join('\n'),
				currentLine: currentLine,
				currentLineNumber: numCurrentLine,
				numVisibleLines: numVisibleLines,
				numLinesBefore: numLinesBefore,
				numLinesAfter: numLinesAfter,
				numLines: numLines
			};

		},

		/**
		 *	selectText
		 *
		 *	Selects text range based on selection string, depending on selectMode parameter, it finds match before, or after caret.
		 *
		 *	@param string selectText
		 *	@param string selectMode
		 *
		 *	@return void
		 */
		selectText: function(selectText, selectMode) {

			selectMode = (typeOf(selectMode) === 'string') ? selectMode : 'before';
			var textObject = this.textObject();
			var textContent = (this.isInput() === true) ? this.get('value') : this.get('text');
			var selectionStart = 0;
			var selectionEnd = 0;

			if(textContent === "")
				return;

			switch(selectMode) {
				case 'before' :

					if(textObject.textBefore.contains(selectText) === true) {

						selectionStart = textObject.textBefore.lastIndexOf(selectText);

						selectionStart = (selectionStart !== -1) ? selectionStart : 0;

					}

				break;
				case 'after' :

					if(textObject.textAfter.contains(selectText) === true) {

						selectionStart = textObject.textAfter.indexOf(selectText);

						selectionStart += textObject.textBefore.length + textObject.textSelected.length;

					}

				break;
			}

			if((selectionStart === 0 && selectionEnd === 0) === false) {

				selectionEnd = selectionStart + selectText.length;

				this.selectRange(selectionStart, selectionEnd);

			}

		},

		/**
		 *	insertText
		 *
		 *	Inserts a string into context node.
		 *
		 *	@param string insertText
		 *	@param string prependText
		 *	@param string appendText
		 *	@param boolean replaceSelection
		 *	@param string selectMode
		 *
		 *	@return void
		 */
		insertText: function(insertText, prependText, appendText, replaceSelection, selectMode) {

			replaceSelection = (replaceSelection === false) ? false : true;
			selectMode = (typeOf(selectMode) === 'string') ? selectMode : 'insertText';

			var property = (this.isInput() === true) ? 'value' : 'text';
			var textContent = this.get(property);
			var selectionStart = this.selectionStart();
			var selectionEnd = this.selectionEnd();
			var textObject = this.textObject();
			var textBefore = textObject.textBefore;
			var textAfter = textObject.textAfter;
			var textSelected = textObject.textSelected;

			if(replaceSelection === false) {

				textBefore = textBefore + textSelected;

			}

			textBefore = textBefore + (prependText || '');
			textAfter = (appendText || '') + textAfter;

			if(insertText.length === 0) {

				insertText = textSelected;

			}

			selectionStart = textBefore.length;
			selectionEnd = textBefore.length + insertText.length;

			switch(selectMode) {

				case 'moveBefore' :

					selectionStart = selectionStart - prependText.length;
					selectionEnd = selectionStart;

				break;
				case 'moveAfter' :

					selectionStart = selectionEnd;

				break;
				case 'contextString' :

					selectionStart = selectionStart - prependText.length;
					selectionEnd = selectionStart + prependText.length + insertText.length + appendText.length;

				break;
				case 'noSelection' :

					selectionEnd = selectionStart;

				break;

			}

			this.set(property, textBefore + insertText + textAfter);

			this.selectRange(selectionStart, selectionEnd);

		},

		/**
		 *	wrapText
		 *
		 *	Wraps current selection with prepend and append text.
		 *
		 *	@param string prependText
		 *	@param string appendText
		 *
		 *	@return void
		 */
		wrapText: function(prependText, appendText) {

			this.insertText('', prependText, appendText, true, 'moveAfter');

		}

	});

}).call(window);