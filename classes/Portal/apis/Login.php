<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_Login_API extends Portal_Default_API {

	public function requireLogin() {
		return false;
	}

	public function preProcess(Portal_Request $request) {
		
	}

	public function postProcess(Portal_Request $request) {
		
	}

	public function process(Portal_Request $request) {
		$params = $request->get('q');
		if ($params['language']) {
			Portal_Session::set('language', $params['language']);
		}
		
		$response = new Portal_Response();
		$result = Vtiger_Connector::getInstance()->ping($params['username'], $params['password']);

		$loginStatus = array();
		if (isset($result['message']) && (!strcmp($result['message'], "Login Required"))) {
			$loginStatus['success'] = false;
			$loginStatus['error']['message'] = 'Could not authenticate.';
			$response->setResult($loginStatus);
		} else if (isset($result['message']) && !strcmp($result['message'], "Login failed")) {
			$loginStatus['success'] = false;
			$loginStatus['error']['message'] = 'The email or password you entered is incorrect.';
			$response->setResult($loginStatus);
		} else if (isset($result['message']) && strpos($result['message'], "Portal access has not been enabled for this account") !== false) {
			$loginStatus['success'] = false;
			$loginStatus['error']['message'] = 'Portal access has not been enabled for this account.';
			$response->setResult($loginStatus);
		} else if (isset($result['message']) && strpos($result['message'], "Access to the portal was disabled on ") !== false) {
			$loginStatus['success'] = false;
			$loginStatus['error']['message'] = $result['message'];
			$response->setResult($loginStatus);
		} else if (isset($result['message']) && strpos($result['message'], "Contacts module is disabled") !== false) {
			$loginStatus['success'] = false;
			$loginStatus['error']['message'] = "Contacts module is disabled!";
			$response->setResult($loginStatus);
		} else if (isset($result['message']) && strpos($result['message'], "Customer portal not available with the current edition, please upgrade!!") !== false) {
			$loginStatus['success'] = false;
			$loginStatus['error']['message'] = $result['message'];
			$response->setResult($loginStatus);
		} else if (isset($result['message']) && strpos($result['message'], "Your access to portal is not enabled yet. Access to support starts on") !== false) {
			$loginStatus['success'] = false;
			$loginStatus['error']['message'] = $result['message'];
			$response->setResult($loginStatus);
		} else if (empty($result)) {
			$loginStatus['success'] = false;
			$loginStatus['error']['message'] = 'Cannot connect to Server.Please configure your site url in provided config file.';
			$response->setResult($loginStatus);
		} else {
			Portal_Session::set('username', $params['username']);
			Portal_Session::set('password', $params['password']);
			Vtiger_Connector::getInstance()->fetchModules();
			Vtiger_Connector::getInstance()->updateLoginDetails('Login');

			$loginStatus['success'] = true;
			$loginStatus['result'] = 'Login Success';
			$response->setResult($loginStatus);
		}
		return $response;
	}

}
