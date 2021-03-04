<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_FetchHistory_API extends Portal_Default_API {

	public function process(Portal_Request $request) {
		$module = $request->getModule();
		$pageNo = $request->get('page');
		$language = $request->getLanguage();
		$pageLimit = $request->get('pageLimit');
		$parentId = $request->get('parentId');
		if ($parentId !== '') {
			$parent = $parentId;
		}
		if (empty($pageNo)) {
			$pageNo = 0;
		}
		if (empty($pageLimit)) {
			$pageLimit = 10;
		}
		$result = Vtiger_Connector::getInstance()->fetchHistory($module, $request->get('id'), $pageNo, $pageLimit, $parent);
		$response = new Portal_Response();
		$response->setResult($this->processResponse($result, $module, $language));

		return $response;
	}

	public function processResponse($result, $module, $language) {
		$recordMeta = parent::processResponse($module, $language);
		if (!empty($result['history'])) {
			$history = array();
			foreach ($result['history'] as $key => $valueArray) {
				$status = $valueArray['status'];
				if ($valueArray['values']) {
					$new = array();
					$new['modifiedtime'] = $valueArray['modifiedtime'];
					foreach ($valueArray['values'] as $fieldname => $values) {
						if ($recordMeta[$fieldname]['type'] == 'picklist') {
							foreach ($recordMeta[$fieldname]['picklistValues'] as $labelValue => $label) {
								if (!empty($values['previous']) && $values['previous'] == $label['value']) {
									$values['previous'] = $label['label'];
								}
								if (!empty($values['current']) && $values['current'] == $label['value']) {
									$values['current'] = $label['label'];
								}
							}
						}
						if ($recordMeta[$fieldname]['type'] == 'multipicklist') {
							if (!empty($values['previous'])) {
								$values['previous'] = str_replace(' |##| ', ',', $values['previous']);
							}
							if ($values['previous'] == 0) {
								$values['previous'] = '';
							}
							if (!empty($values['current'])) {
								$values['current'] = str_replace(' |##| ', ',', $values['current']);
							}
						}
						if ($recordMeta[$fieldname]['type'] == 'text' || $recordMeta[$fieldname]['type'] == 'string') {
							if (!empty($values['previous'])) {
								if ($values['previous'] == 0) {
									$values['previous'] = '';
								}
							}
						}

						if ($recordMeta[$fieldname]['type'] == 'date') {
							if ($values['current'] == '') {
								$values['previous'] = '';
							}
						}

						if ($recordMeta[$fieldname]['type'] == 'url') {
							if (!empty($values['previous'])) {
								if ($values['previous'] == 0) {
									$values['previous'] = '';
								}
							}
						}

						if ($recordMeta[$fieldname]['type'] == 'time') {
							if ($values['current'] == '') {
								$values['previous'] = '';
							}
						}

						if ($recordMeta[$fieldname]['type'] == 'phone') {
							if ($values['current'] == '') {
								$values['previous'] = '';
							}
						}

						if ($recordMeta[$fieldname]['type'] == 'email') {
							if (!empty($values['previous'])) {
								if ($values['previous'] == 0) {
									$values['previous'] = '';
								}
							}
						}

						if ($recordMeta[$fieldname]['type'] == 'double' || $recordMeta[$fieldname]['type'] == 'currency') {
							if (!empty($values['previous'])) {
								$values['previous'] = round($values['previous'], 2);
							}
							if (!empty($values['current'])) {
								$values['current'] = round($values['current'], 2);
							}
						}
						if ($recordMeta[$fieldname]['type'] == 'boolean') {
							if ($values['previous'] !== '') {
								$values['previous'] = $values['previous'] == 0 ? 'No' : 'Yes';
							}
							if ($values['current'] !== '') {
								$values['current'] = $values['current'] == 1 ? 'Yes' : 'No';
							}
						}

						if ($recordMeta[$fieldname]['type'] == 'reference') {
							if ($values['previous'] !== '') {
								if ($values['previous'] == 0) {
									$values['previous'] = '';
								} else {
									$values['previous'] = $values['previous'];
								}
							}
							if ($values['current'] !== '') {
								$values['current'] = $values['current'];
							}
						}

						if ($recordMeta[$fieldname]['type'] == 'text') {
							$values['previous'] = str_replace("\n", '', $values['previous']);
							$values['current'] = str_replace("\n", '', $values['current']);
							$values['previous'] = preg_replace('/<br(\s+)?\/?>/i', "\n", $values['previous']);
							$values['current'] = preg_replace('/<br(\s+)?\/?>/i', "\n", $values['current']);
							$values['previous'] = strip_tags($values['previous']);
							$values['current'] = strip_tags($values['current']);
						}

						$fieldname = $recordMeta[$fieldname]['label'];
						foreach ($values as $k => $val) {
							if ($status == 'updated') {
								$createCount = count($valueArray['values']);
								$new[$fieldname]['updateStatus'] = $status;
								$new[$fieldname][$k] = html_entity_decode((html_entity_decode($values[$k], ENT_QUOTES, 'utf-8')));
							} elseif ($status == 'created') {
								$new['id']['updateStatus'] = $status;
								$updateCount = count($valueArray['values']);
								$new['created']['user'] = $valueArray['modifieduser']['label'];
								$history['records'][] = $new;
								break;
							}
						}
						$new['count'] = $createCount + $updateCount;
					}
				}
				$history['records'][] = $new;
				$history['records']['count'] = $new['count'];
			}
		}

		return $history;
	}

}
