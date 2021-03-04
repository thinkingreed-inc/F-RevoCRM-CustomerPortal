<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_ExportRecords_API extends Portal_FetchRecords_API {

	public function process(Portal_Request $request) {
		$module = $request->getModule();
		$language = Portal_Session::get('language');
		$params = $request->get('q');
		$filter = $request->get('filter');
		if (!empty($filter)) {
			$params['fields'] = json_encode($filter);
		}
		$result = Vtiger_Connector::getInstance()->exportRecords($module, $request->get('label'), $request->get('q', array()), $params['fields']);
		$parsedResult = $this->parseListViewRecords($result, $module);
		$response = new Portal_Response();
		$response->setResult($this->processResponse($parsedResult, $module, $language, true));
		return $response;
	}

	public function parseListViewRecords($response, $module) {
		$edit = $headers = $records = array();
		for ($i = 0; $i < count($response); $i++) {
			if ($response[$i]) {
				$record = array();
				if (is_array($response[$i])) {
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
			}
			$records[] = $record;
		}
		return array('headers' => $headers, 'records' => $records, 'edit' => $edit);
	}

}
