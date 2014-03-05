<!DOCTYPE html>
<html lang="en">
<head>

	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta http-equiv="Content-Style-Type" content="text/css" />
	<meta http-equiv="Content-Script-Type" content="text/javascript" />

		<title>CodeLeaf</title>

	<link href="public/assets/css/style.css" type="text/css" rel="stylesheet" />

	<!-- Catalyst (required library) -->
	<script src="public/assets/js/Catalyst/Core.min.js" type="text/javascript"></script>
	<script src="public/assets/js/Catalyst/Selection.min.js" type="text/javascript"></script>

	<!-- CodeLeaf -->
	<script src="public/assets/js/CodeLeaf/Core.min.js" type="text/javascript"></script>
	<script src="public/assets/js/CodeLeaf/Bundle.min.js" type="text/javascript"></script>
	<script src="public/assets/js/CodeLeaf/Tokenizer.min.js" type="text/javascript"></script>
	<script src="public/assets/js/CodeLeaf/Editor.min.js" type="text/javascript"></script>

	<!-- CodeLeaf Bundles -->
	<script src="public/assets/js/CodeLeaf/Bundles/Generic.min.js" type="text/javascript"></script>
	<script src="public/assets/js/CodeLeaf/Bundles/PHP.min.js" type="text/javascript"></script>

</head><body id="top" class="no-javascript y<?php echo date('Y'); ?> m<?php echo date('m'); ?> d<?php echo date('d'); ?>">
<div id="wrapper">

	<pre role="application" class="codeleaf">
&lt;?php
namespace Vehichle;

use Manufacturer, Bugatti;

class Veyron extends Car implements Chassi {

	use Engine;

	public static function make() {

		return __CLASS__;

	}

	/**
	 *	throttle
	 *
	 *	Implemented method must create a new throttle control and add items to dashboard.
	 *
 	 *	@param Pedal $pedal
 	 *	@param array $dashboardItems Items to add to {@see Dashboard}.
 	 *
 	 *	@return bool
	 */
	abstract public function throttle(Pedal $pedal, Array $dashboardItems);

}</pre>

</div>
<script type="text/javascript">
(function() {

	var view = query('pre.codeleaf').pop();

	var editor = this.editor = new CodeLeaf.Editor(view, {
		bundle: 'PHP'
	});

}).call(window);
</script>
</body></html>