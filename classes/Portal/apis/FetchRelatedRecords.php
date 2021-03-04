<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_FetchRelatedRecords_API extends Portal_Default_API {

	public function process(Portal_Request $request) {
		$pageNo = $request->get('page');
		$module = $request->get('module');
		$language = Portal_Session::get('language');
		if (empty($pageNo)) {
			$pageNo = 0;
		}
		$pageLimit = $request->get('pageLimit');
		if (empty($pageLimit)) {
			$pageLimit = 10;
		}
		$result = Vtiger_Connector::getInstance()->fetchRelatedRecords($request->get('relatedModule'), $request->get('relatedModuleLabel'), $request->get('id'), $request->get('parentId'), $pageNo, $pageLimit, $module);
		$response = new Portal_Response();
		$response->setResult($this->processResponse($result, $request->get('relatedModule'), $language));

		return $response;
	}

	public function processResponse($result, $relatedModule, $language) {
		$response = array();
		if ($relatedModule == 'ModComments') {
			$response['comments'] = $result;
			$response['more'] = $result['more'];
			return $response;
		}
		$recordMeta = parent::processResponse($relatedModule, $language);
		$headers = $records = $dateTimeFields = array();
		$more = $result['more'];
		unset($result['more']);
		for ($i = 0; $i < count($result); $i++) {
			if ($result[$i]) {
				$record = array();
				foreach ($result[$i] as $field => $value) {
					if ($i == 0) {
						$headers[] = $recordMeta[$field]['label'];
					}
					if (is_array($value)) {
						$record[$recordMeta[$field]['label']] = $value['label'];
					} else {
						if ($recordMeta[$field]['type'] == 'double' || $recordMeta[$field]['type'] == 'currency') {
							$value = round($value, 2);
						}
						if ($recordMeta[$field]['type'] == 'multipicklist') {
							$value = str_replace(' |##| ', ",", $value);
						}
						if ($recordMeta[$field]['type'] == 'boolean') {
							$value = $value == 1 ? "Yes" : "No";
						}
						if ($recordMeta[$field]['type'] == 'text') {
							$value = strip_tags($value);
							$value = preg_replace('/<br(\s+)?\/?>/i', "\n", $value);
						}
						if ($field == 'filelocationtype' && $relatedModule == 'Documents') {
							if ($value !== '' && $value == "I") {
								$value = "Internal";
							}
							if ($value !== '' && $value == "E") {
								$value = "External";
							}
						}
						if ($recordMeta[$field]['type'] == 'multipicklist') {
							$value = str_replace(' |##| ', ',', $value);
						}
						if ($recordMeta[$field]['type'] == 'datetime') {
							$dateTimeFields[] = $recordMeta[$field]['label'];
						}
						if ($recordMeta[$field]['type'] == "file" && $field == 'filename' && $relatedModule == 'Documents') {
							$docExists = true;
							if ($value == '') {
								$docExists = false;
							}
						}
						if ($field == 'filesize' && $recordMeta[$field]['type'] == 'integer' && $relatedModule == 'Documents') {
							$value = round(($value / 1024), 2).'KB';
						}
						$record[$recordMeta[$field]['label']] = $value;
						if ($relatedModule === 'Documents') {
							if ($field === 'filename') {
								$record['filename'] = $value;
							}
						}
					}
				}
			}
			if ($docExists) {
				$record['documentExists'] = true;
			}
			$records[] = $record;
		}
		$dateTimeFields = array_unique($dateTimeFields);
		return array('headers' => $headers, 'records' => $records, 'dateTimeFields' => $dateTimeFields, 'more' => $more);
	}

}
