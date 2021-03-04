<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_SaveRecord_API extends Portal_Default_API {

	public function process(Portal_Request $request) {
		$module = $request->getModule();
		$requestParams = $request->get('record');
		$recordId = $request->get('recordId');
		if ($module == 'Contacts') {
			$recordId = Portal_Session::get('contact_id');
		}
		if ($module == 'Accounts') {
			$recordId = Portal_Session::get('parent_id');
		}
		// $requestParams['assigned_user_id'] = Portal_Session::get('assigned_user_id');
		$result = Vtiger_Connector::getInstance()->saveRecord($module, $requestParams, $recordId);
		$response = new Portal_Response();
		$response->setResult($result);

		return $response;
	}

}
