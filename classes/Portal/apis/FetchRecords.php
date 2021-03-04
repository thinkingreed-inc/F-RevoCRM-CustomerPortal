<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_FetchRecords_API extends Portal_Default_API {

	public function process(Portal_Request $request) {
		$module = $request->getModule();
		$language = Portal_Session::get('language');
		$params = $request->get('q');
		$pageNo = $params['page'];
		$filter = $request->get('filter');
		if (empty($pageNo))
			$pageNo = 0;
		$pageLimit = $params['pageLimit'];
		if (empty($pageLimit))
			$pageLimit = 10;
		if (!empty($filter)) {
			$params['fields'] = json_encode($filter);
		}
		$order = $params['order'];
		$orderBy = $params['orderBy'];
		$result = Vtiger_Connector::getInstance()->fetchRecords($module, $request->get('label'), $request->get('q', array()), $params['fields'], $pageNo, $pageLimit);
		$response = new Portal_Response();
		$response->setResult($this->processResponse($result, $module, $language));
		return $response;
	}

	public function processResponse($result, $module, $language, $isExport = false) {
		if ($result['records'] === null) {
			return $result;
		}
		$headers = $result['headers'];
		$records = $result['records'];
		$edits = $result['edit'];
		unset($result['edit']);
		$recordMeta = parent::processResponse($module, $language);
		$headerNames = array();
		$editFieldNames = array();
		foreach ($headers as $key) {
			array_push($headerNames, $recordMeta[$key]['label']);
		}
		foreach ($edits as $key) {
			$editFieldNames[$recordMeta[$key]['label']] = $key;
		}
		foreach ($records as $key => $value) {
			foreach ($value as $fieldLabel => $fieldValue) {

				if ($recordMeta[$fieldLabel]['type'] == 'picklist') {

					foreach ($recordMeta[$fieldLabel]['picklistValues'] as $key1 => $value1) {
						if ($value[$fieldLabel] == $value1['value']) {

							$fieldValue = $value1['label'];
						}
					}
				}
				if ($recordMeta[$fieldLabel]['type'] == 'multipicklist') {
					$fieldValue = str_replace(' |##| ', ",", $fieldValue);
				}
				if ($recordMeta[$fieldLabel]['type'] == 'double' || $recordMeta[$fieldLabel]['type'] == 'currency') {
					$fieldValue = round($fieldValue, 2);
				}
				if ($recordMeta[$fieldLabel]['type'] == 'boolean') {
					$fieldValue = $fieldValue == 1 ? "Yes" : "No";
				}
				if ($recordMeta[$fieldLabel]['type'] == 'integer' && $module == 'Documents' && $fieldLabel == 'filesize') {

					$fieldValue = round(($fieldValue / 1024), 2).'KB';
				}
				if ($recordMeta[$fieldLabel]['type'] == 'string' && $fieldLabel == 'filelocationtype' && $module == 'Documents') {
					if ($fieldValue !== '' && $fieldValue == "I") {
						$fieldValue = "Internal";
					}
					if ($fieldValue !== '' && $fieldValue == "E") {
						$fieldValue = "External";
					}
				}
				if ($recordMeta[$fieldLabel]['type'] == "text") {
					$fieldValue = strip_tags($fieldValue);
					$fieldValue = preg_replace('/<br(\s+)?\/?>/i', "\n", $fieldValue);
				}
				if ($recordMeta[$fieldLabel]['type'] == "file" && $fieldLabel == 'filename' && $module == 'Documents') {
					$docExists = true;
					if ($fieldValue == '') {
						$docExists = false;
					}
				}
				if ($fieldLabel !== 'id') {
					$fieldValue = strip_tags($fieldValue);
					$value[$recordMeta[$fieldLabel]['label']] = $fieldValue;
					if ($module == 'Documents') {
						if ($fieldLabel !== "filename") {
							unset($value[$fieldLabel]);
						}
					} else {
						unset($value[$fieldLabel]);
					}
				}
				if ($isExport) {
					unset($value['id']);
				}
			}
			$records[$key] = $value;
			if ($docExists && $module == 'Documents') {
				$records[$key]['documentExists'] = true;
			}
		}
		$result['headers'] = $headerNames;
		$result['records'] = $records;
		$result['editLabels'] = $editFieldNames;
		$result['pageLimit'] = 10;
		return $result;
	}

	public function convertElapsedTime($value, $currentDate) {
		$minutes = (strtotime($currentDate) - strtotime($value)) / 60;
		$timeString = '';
		if ($minutes != 'NULL' && $value !== '0000-00-00 00:00:00') {
			$minutes = $minutes * 60;
			$s = (floor($minutes % 60) > 0) ? ($minutes % 60).' seconds ' : '';
			$m = (floor(($minutes % 3600) / 60) > 0) ? floor(($minutes % 3600) / 60).' minutes' : '';
			$h = (floor(($minutes % 86400) / 3600) > 0) ? floor(($minutes % 86400) / 3600).' hours' : '';
			$d = (floor(($minutes % 2592000) / 86400) > 0) ? floor(($minutes % 2592000) / 86400).' days' : '';
			$Mo = (floor($minutes / 2592000) > 0) ? floor($minutes / 2592000).' months' : '';
			$timeString = "$Mo $d $h $m $s";
		}
		return $timeString;
	}

}
