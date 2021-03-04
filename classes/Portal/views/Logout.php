<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_Logout_View extends Portal_Default_View {

	public function preProcess(Portal_Request $request) {
		
	}

	public function postProcess(Portal_Request $request) {
		
	}

	public function process(Portal_Request $request) {
		/**
		 * we need to do it before because after destroy we will not have any 
		 * information to track in Engagements
		 */
		Vtiger_Connector::getInstance()->updateLoginDetails('Logout');
		Portal_Session::destroy();
		header('Location: index.php');
	}

}
