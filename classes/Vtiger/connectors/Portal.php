<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

include_once 'vtlib/Vtiger/Net/Client.php';

abstract class Vtiger_PortalBase_Connector extends Vtiger_Connector {

	protected $client;
	protected $auth;

	public function __construct() {
		$this->client = new Vtiger_Net_Client(Portal_Config::get('crm.connect.url'));
	}

	protected function api($params) {
		if ($this->client) {
			$this->client->setHeaders($this->auth);
			$response = $this->client->doPost($params);
			$responseText = json_decode($response, true);
			if ($responseText['success'] && $responseText['result']) {
				return $responseText['result'];
			} else {
				return $responseText['error'];
			}
			throw new Exception('Invalid Request');
		}
	}

}

class Vtiger_Portal_Connector extends Vtiger_PortalBase_Connector {

	public function isAuthenticated() {
		$this->auth = Portal_Session::get('portal_auth', null);
		return $this->auth != null;
	}

	public function ping($username, $password) {
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));
		$args = array(
			'_operation' => 'Ping',
			'username' => $username,
			'password' => $password
		);
		return self::api($args);
	}

	public function authentication() {
		if ($this->isAuthenticated()) {
			$authInfo = explode(':', base64_decode(substr($this->auth['Authorization'], strlen('Basic '))));
			array_pop($authInfo); // NOTE: password removed.
			$authInfo['username'] = $authInfo;
			$authInfo['language'] = Portal_Session::get('language');
			return $authInfo;
		}
		return null;
	}

	public function fetchModules() {
		if ($language == '') {
			$language = Portal_Session::get('language');
		}

		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$args = array(
			'_operation' => 'FetchModules',
			'language' => $language,
			'username' => $username,
			'password' => $password
		);

		$response = self::api($args);

		if (isset($response['contact_id']) && isset($response['contact_id']) && isset($response['contact_id'])) {
			if ($username && $password && $response) {
				Portal_Session::set('portal_auth', $this->auth);
				Portal_Session::set('contact_id', $response['contact_id']['value']);
				Portal_Session::set('parent_id', $response['account_id']['value']);
				Portal_Session::set('parent_idLabel', $response['sccount_id']['label']);
				Portal_Session::set('assigned_user_id', $response['user_id']['value']);
			}
		} else {
			return null;
		}
		return $response;
	}

	public function describeModule($module, $language) {
		$language = Portal_Session::get('language');
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'DescribeModule',
			'module' => $module,
			'language' => $language,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function fetchRecords($module, $label, $q = false, $filter = false, $pageNo = false, $pageLimit = false, $orderBy = false, $order = false) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchRecords',
			'module' => $module,
			'moduleLabel' => $label,
			'page' => $pageNo,
			'pageLimit' => $pageLimit,
			'fields' => $filter,
			'orderBy' => $orderBy,
			'order' => $order,
			'username' => $username,
			'password' => $password
		);

		if ($q) {
			$params = array_merge($params, $q);
		}

		$response = self::api($params);
		return $this->parseListViewRecords($response, $module);
	}

	public function fetchRelatedRecords($relatedModule, $relatedModuleLabel, $id, $parentId, $pageNo, $pageLimit, $module = false) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchRelatedRecords',
			'relatedModule' => $relatedModule,
			'relatedModuleLabel' => $relatedModuleLabel,
			'recordId' => $id,
			'parentId' => $parentId,
			'page' => $pageNo,
			'pageLimit' => $pageLimit,
			'module' => $module,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function fetchRecord($id, $module, $parentId = '') {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchRecord',
			'module' => $module,
			'recordId' => $id,
			'parentId' => $parentId,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function fetchHistory($module, $id, $pageNo, $pageLimit, $parentId = false) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchHistory',
			'record' => $id,
			'module' => $module,
			'page' => $pageNo,
			'pageLimit' => $pageLimit,
			'parentId' => $parentId,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function saveRecord($module, $values, $recordId = false) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'SaveRecord',
			'module' => $module,
			'values' => $values,
			'username' => $username,
			'password' => $password
		);

		if ($recordId) {
			$params['recordId'] = $recordId;
		}

		$response = self::api($params);
		if (is_array($response) && $module == 'Contacts' && !(empty($response['email']))) {
			$authInfo = explode(':', base64_decode(substr($this->auth['Authorization'], strlen('Basic '))));
			$this->auth = array('Authorization' => 'Basic '.base64_encode($response['email'].':'.$authInfo[1]));
			$updatedAuth = explode(':', base64_decode(substr($this->auth['Authorization'], strlen('Basic '))));
			Portal_Session::set('portal_auth', $this->auth);
		}
		return $response;
	}

	public function addComment($values, $parentId) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'AddComment',
			'values' => $values,
			'parentId' => $parentId,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function downloadFile($module, $q, $parentId = false, $parentModule = false, $attachmentId = false) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'DownloadFile',
			'module' => $module,
			'moduleLabel' => $module,
			'recordId' => $q,
			'parentId' => $parentId,
			'parentModule' => $parentModule,
			'attachmentId' => $attachmentId,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function changePassword($record) {
		$username = Portal_Session::get('username');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));
		if(strlen($record['newPassword'])<=8){		
			$error_keyisweak = array(
				"code" => '1414',
				"message" => "Password is not long enough. Please increase the length to at least 8 characters.",
			);	
			return $error_keyisweak;
		}else if(!(preg_match('/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\-+=^$*.\[\]{}()?\"!@#%&\/\\\\,><\':;|_~`\-+=])(?!.*[^a-zA-Z\d\-+=^$*.\[\]{}()?\"!@#%&\/\\\\,><\':;|_~`]).+$/', $record['newPassword']))){
			$error_keyisweak = array(
				"code" => '1414',
				"message" => "The password is not strong enough. Please use at least one lowercase alphabet, one uppercase alphabet, one number and one symbol.",
			);
			return $error_keyisweak;
		}
		if($record['oldPassword'] == $record['newPassword']){
			$error_keyisweak = array(
				"code" => '1414',
				"message" => "The same password as the previous one cannot be used.",
			);
			return $error_keyisweak;
		}

		$params = array(
			'_operation' => 'ChangePassword',
			'password' => $record['oldPassword'],
			'newPassword' => $record['newPassword'],
			'username' => $username,
		);
		return self::api($params);
	}

	public function fetchProfile() {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchProfile',
			'username' => $username,
			'password' => $password
		);
		return self::api($params);
	}

	public function uploadAttachment($module, $parentId = '') {
		$url = Portal_Config::get('crm.connect.url');
		if (isset($_FILES)) {

			$username = Portal_Session::get('username');
			$password = Portal_Session::get('password');
			$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

			$authInfo = explode(':', base64_decode(substr($this->auth['Authorization'], strlen('Basic '))));
			$header = array('Content-Type:multipart/form-data');

			$file = null;
			if (class_exists('CURLFile')) { /* PHP 5.5+ */
				$file = new CURLFile($_FILES['file']['tmp_name'], $_FILES['file']['type'], $_FILES['file']['name']);
			} else {
				$file = '@'.$_FILES['file']['tmp_name'].';filename='.$_FILES['file']['name'].';type='.$_FILES['file']['type'];
			}

			$data = array(
				'file' => $file,
				'_operation' => 'SaveRecord',
				'module' => $module,
				'parentId' => $parentId,
				'filename' => $_FILES['file']['name'],
				'username' => $username,
				'password' => $password
			);
			$resource = curl_init();
			curl_setopt($resource, CURLOPT_URL, $url);
			curl_setopt($resource, CURLOPT_HTTPHEADER, $header);
			curl_setopt($resource, CURLOPT_USERPWD, $authInfo[0].":".$authInfo[1]);
			curl_setopt($resource, CURLOPT_POST, 1);
			curl_setopt($resource, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($resource, CURLOPT_POSTFIELDS, $data);
			$response = curl_exec($resource);
			$info = curl_getinfo($resource);
			curl_close($resource);
			$responseText = json_decode($response, true);
			if ($responseText['success']) {
				return $responseText['result'];
			} else {
				return $responseText['error']['message'];
			}
		}
	}

	public function forgotPassword($email) {
		$params = array(
			'_operation' => 'ForgotPassword',
			'email' => $email
		);
		$this->auth = array('Authorization' => 'Basic '.base64_encode($email.':'.''));
		$response = self::api($params);
		return $response;
	}

	public function fetchRelatedModules($module) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchRelatedModules',
			'module' => $module,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function fetchAnnouncement() {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchAnnouncement',
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function fetchShortcuts() {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchShortcuts',
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function fetchRecentRecords($language) {
		$language = Portal_Session::get('language');
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchRecentRecords',
			'language' => $language,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function fetchReferenceRecords($module, $query) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchReferenceRecords',
			'module' => $module,
			'searchKey' => $query,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function fetchCompanyDetails() {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchCompanyDetails',
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function fetchCompanyTitle() {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'FetchCompanyTitle',
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function exportRecords($module, $label, $q = false, $filter = false) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'ExportRecords',
			'module' => $module,
			'moduleLabel' => $label,
			'fields' => $filter,
			'username' => $username,
			'password' => $password
		);

		if ($q) {
			$params = array_merge($params, $q);
		}
		return self::api($params);
	}

	public function searchFaqs($module, $searchKey) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'SearchFaqs',
			'module' => $module,
			'searchKey' => $searchKey,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	public function searchRecords($searchKey) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$params = array(
			'_operation' => 'SearchRecords',
			'searchKey' => $searchKey,
			'username' => $username,
			'password' => $password
		);

		return self::api($params);
	}

	protected function parseListViewRecords($response, $module) {
		if ($response['count'] === null) {
			return $response;
		}
		$edit = $headers = $records = array();
		for ($i = 0; $i < count($response) - 1; $i++) {
			if ($response[$i]) {
				$record = array();
				if (!is_array($response[$i]))
					continue;
				foreach ($response[$i] as $field => $value) {
					if ($i == 0) {
						$headers[] = $field;
						$edit[$field] = $field;
					}
					if (is_array($value)) {
						$record[$field] = $value['label'];
					} else {
						$record[$field] = $value;
					}
				}
			}
			$records[] = $record;
		}
		return array('headers' => $headers, 'records' => $records, 'edit' => $edit, 'count' => (int) $response['count']);
	}

	public function updateLoginDetails($status) {
		$username = Portal_Session::get('username');
		$password = Portal_Session::get('password');
		$this->auth = array('Authorization' => 'Basic '.base64_encode($username.':'.$password));

		$args = array(
			'_operation' => 'UpdateLoginDetails',
			'status' => $status,
			'username' => $username,
			'password' => $password
		);

		return self::api($args);
	}

}
