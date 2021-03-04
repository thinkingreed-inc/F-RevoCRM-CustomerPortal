<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_Authenticate_View extends Portal_Default_View {

	public function requireLogin() {
		return false;
	}

	public function preProcess(Portal_Request $request) {
		
	}

	public function postProcess(Portal_Request $request) {
		
	}

	public function process(Portal_Request $request) {
		if ($request->get('language')) {
			Portal_Session::set('language', $request->get('language'));
		}
		Vtiger_Connector::getInstance()->fetchModules();
		header('Location: index.php');
	}

}
