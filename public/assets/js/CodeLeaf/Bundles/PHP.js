/**
 *	Bundle: PHP
 */
CodeLeaf.Bundles.register('PHP', {

	TypingPairs: {
		"'" : "'",
		'"' : '"',
		'[' : ']',
		'(' : ')',
		'{' : '}'
	},

	SyntaxTokens: {

		'comment-multiline': /\/\*[\w\W]*?\*\//g,

		'comment-single-line': /(?:^|[^\\])\/\/.*$/gm,

		'comment': /#.*$/gm,

		'namespace': {
			regex: /(namespace|use)\s+?([a-z0-9\_\\\\]+)/ig,
			subToken: {
				'keyword': /(namespace|use)/g,
				'class-name': /([a-z0-9\_\\\\]+)/ig
			}
		},

		'inheritance': {
			regex: /(extends|implements)\s+?([a-z0-9\s\,\_\\\\]+)/ig,
			subToken: {
				'punctuation': /\,/,
				'keyword': /(extends|implements)/ig,
				'class-name': /([a-z0-9\_\\\\]+)/ig
			}
		},

		'class-definition': {
			regex: /(?:abstract)?\s?(class)\s+?([a-z0-9\_\\\\]+)/ig,
			subToken: {
				'reserved': /abstract/ig,
				'keyword': /class/g,
				'class-name': /([a-z0-9\_\\\\]+)/ig
			}
		},

		'class-invocation': {
			regex: /(new)\s+?([a-z0-9\_\\\\]+)/ig,
			subToken: {
				'keyword': /new/g,
				'class-name': /([a-z0-9\_\\\\]+)/ig
			}
		},

		'method': {
			regex: /(?:abstract)?\s?(?:public|private|protected)?\s?(?:static)?\s?function\s?([a-z0-9\_]+)\(.*?\)/ig,
			subToken: {
				'reserved': /abstract/g,
				'static': /static/g,
				'keyword': /function/g,
				'visibility': /public|private|protected/g,
				'function': {
					regex: /([a-z0-9\_]+)\(.*?\)/ig,
					subToken: {
						'definition': {
							regex: /([a-z0-9\_\\\\]+)\(/ig,
							subToken: {
								'magic': /__(construct|destruct|call|callStatic|get|set|isset|unset|sleep|wakeup|tostring|invoke|set_state|clone)/ig,
								'name': /([a-z0-9\_\\\\]+)/ig,
							}
						},
						'variable': /[\$]{1,2}[A-Z_][\w]*/ig,
						'class-name': /([a-z0-9\_\\\\]+)/ig
					}
				}
			}
		},

		'delimiter-tags': /(\&lt\;(\?|\%)(php|=)?|(\?|\%)\&gt\;)/ig,

		'keyword': /\b(and|as|break|case|catch|cfunction|class|clone|continue|declare|default|do|else|elseif|enddeclare|endfor|endforeach|endif|endswitch|endwhile|extends|final|for|foreach|function|global|goto|if|implements|interface|instanceof|new|old_function|or|static|switch|while|xor)\b/ig,

		'construct': /\b(array|die|echo|empty|exit|include|include_once|isset|list|require|require_once|return|print|unset|throw)\b/ig,

		'variable': /[\$]{1,2}[A-Z_][\w]*/ig,

		'constant': /(\b[A-Z\_]+)\b/g,

		'boolean': /(true|false|null)/ig,

		'string': /("|')(\\?.)*?\1/g

	}

});