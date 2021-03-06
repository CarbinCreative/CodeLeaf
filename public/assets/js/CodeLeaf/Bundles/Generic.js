/**
 *	Bundle: Generic
 */
CodeLeaf.Bundles.register('Generic', {

	TypingPairs: {
		"'" : "'",
		'"' : '"',
		'[' : ']',
		'(' : ')',
		'{' : '}',
		'<' : '>'
	},

	SyntaxTokens: {

		'string': /("|')(\\?.)*?\1/g,

		'punctuation': /[;:]/g

	}

});