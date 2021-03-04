<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

include_once PORTAL_APP_DIR.'/libraries/Smarty/libs/Smarty.class.php';

class Portal_Viewer extends Smarty {

	function __construct() {
		parent::__construct();

		$compileDir = PORTAL_APP_DIR.'/writeable/templates_c/'.portal_layout();
		if (!file_exists($compileDir))
			mkdir($compileDir, 0755, true);

		$this->setTemplateDir(portal_layout_dir().'/templates');
		$this->setCompileDir($compileDir);
	}

}

function portal_layout() {
	return Portal_Config::get('layout', 'default');
}

function portal_layout_dir() {
	return PORTAL_APP_DIR.'/layouts/'.Portal_Config::get('layout', 'default');
}

function portal_template_resolve($module, $file) {
	if (file_exists(portal_layout_dir()."/templates/$module/$file")) {
		return "$module/$file";
	}
	return "Portal/$file";
}

function get_logo() {
	return 'layouts/'.portal_layout().'/resources/images/application.png';
}

function portal_componentjs_class($module, $classPrefix) {
	$file = portal_layout_dir()."/resources/components/$module.js";
	$jsclass = "{$module}_{$classPrefix}";
	if (file_exists($file) && stripos(file_get_contents($file), $jsclass) !== false) {
		return $jsclass;
	}
	return "Portal_{$classPrefix}";
}

function portal_componentjs_file($module) {
	if (file_exists(portal_layout_dir()."/resources/components/{$module}.js")) {
		return "layouts/".portal_layout()."/resources/components/{$module}.js";
	}
	return "";
}
