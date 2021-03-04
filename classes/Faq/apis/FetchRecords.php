<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Faq_FetchRecords_API extends Portal_Default_API {

	public function process(Portal_Request $request) {
		$module = $request->getModule();
		$language = $request->getLanguage();
		$params = $request->get('q');
		$pageNo = $params['page'];
		if ($params['field'] == 'faqcategories' && empty($params['value']) && isset($params['value'])) {
			$params['value'] = 'NULL';
		}
		$filter = array($params['field'] => $params['value']);

		if (empty($pageNo))
			$pageNo = 0;
		$pageLimit = $params['pageLimit'];
		if (empty($pageLimit))
			$pageLimit = 10;
		$filter = array_filter($filter);
		if (!empty($filter)) {
			$params['fields'] = json_encode($filter);
		}
		$result = Vtiger_Connector::getInstance()->fetchRecords($module, $request->get('label'), $request->get('q', array()), $params['fields'], $pageNo, $pageLimit);

		$response = new Portal_Response();
		$response->setResult($this->processResponse($result, $module, $language));
		return $response;
	}

	public function processResponse($result, $module, $language) {
		$headers = $result['headers'];
		$records = $result['records'];
		$edits = $result['edit'];
		unset($result['edit']);
		$recordMeta = parent::processResponse($module, $language);
		$headerNames = array();
		$editNames = array();
		foreach ($headers as $key) {
			array_push($headerNames, $recordMeta[$key]['label']);
		}
		foreach ($edits as $key) {
			$editNames [$key] = $recordMeta[$key]['label'];
		}
		if (isset($recordMeta['faqcategories'])) {
			$result['faqCategories'] = $recordMeta['faqcategories']['picklistValues'];
		}
		foreach ($records as $key => $value) {
			$records[$key] = $value;
		}
		$result['headers'] = $headerNames;
		$result['records'] = $records;
		$result['edits'] = $editNames;
		$result['pageLimit'] = 10;
		return $result;
	}

}
