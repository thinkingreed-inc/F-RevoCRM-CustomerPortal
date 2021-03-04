<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_Default_View {

	public function requireLogin() {
		return true;
	}

	protected $_viewer = NULL;

	protected function getViewer(Portal_Request $request) {
		if ($this->_viewer === NULL)
			$this->_viewer = new Portal_Viewer();
		$this->_viewer->assign('MODULE', $request->getModule());
		return $this->_viewer;
	}

	protected function preTemplateFile(Portal_Request $request) {
		return "Header.tpl";
	}

	protected function postTemplateFile(Portal_Request $request) {
		return "Footer.tpl";
	}

	protected function oldPortalLogin() {
		return Portal_Config::get('old.portal', 'default');
	}

	protected function templateFile(Portal_Request $request) {

		$module = $request->getModule('Portal');
		$view = $request->getView('Index');
		// Fallback to Portal template if module specific one does not exists.
		if ($module != 'Portal' &&
				!file_exists(portal_layout_dir() . "/templates/{$module}/{$view}.tpl")) {
			$module = 'Portal';
		}
		return "{$module}/{$view}.tpl";
	}

	public function preProcess(Portal_Request $request) {
		$viewer = $this->getViewer($request);
		$viewer->display($this->preTemplateFile($request));
	}

	public function process(Portal_Request $request) {
		$viewer = $this->getViewer($request);
		if ($request->getView() == 'Login') {
			$viewer->assign('OLDURL', $this->oldPortalLogin());
		}
		$viewer->display($this->templateFile($request));
	}

	public function postProcess(Portal_Request $request) {
		$viewer = $this->getViewer($request);
		$viewer->display($this->postTemplateFile($request));
	}

}
