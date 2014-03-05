(function() {

	if(window.Catalyst === undefined)
		throw "Catalyst Core not included.";

	if(Node.prototype.locateOffsetNode === undefined)
		throw "Catalyst Selection not included.";



	/**
	 *	@namespace CodeLeaf
	 */
	var CodeLeaf = this.CodeLeaf = {};


	/**
	 *	CodeLeaf Metadata
	 */
	Object.append(CodeLeaf, {
		Version: 0.5
	});

}).call(window);