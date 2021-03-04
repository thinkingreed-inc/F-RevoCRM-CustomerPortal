<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

abstract class Vtiger_Connector {

	protected function __construct() {
		
	}

	abstract public function isAuthenticated();

	abstract public function authentication();

	abstract public function ping($username, $password);

	abstract public function describeModule($module, $language);

	abstract public function fetchModules();

	abstract public function fetchRecords($module, $label, $q, $filter, $pageNo, $pageLimit, $orderBy, $order);

	abstract public function fetchRecord($id, $module, $parentId = '');

	abstract public function fetchRelatedRecords($id, $relatedModule, $relatedModuleLabel, $parentId, $pageNo, $pageLimit, $module);

	abstract public function saveRecord($module, $record);

	abstract public function fetchHistory($module, $id, $pageNo, $pageLimit, $parentId);

	abstract public function downloadFile($module, $id, $parentId, $parentModule, $attachmentId);

	abstract public function changePassword($record);

	abstract public function uploadAttachment($module, $parentId);

	abstract public function forgotPassword($email);

	abstract public function fetchRelatedModules($module);

	abstract public function fetchAnnouncement();

	abstract public function fetchShortcuts();

	abstract public function fetchRecentRecords($language);

	abstract public function fetchReferenceRecords($module, $query);

	abstract public function fetchCompanyDetails();

	abstract public function exportRecords($module, $label, $q, $filter);

	abstract public function searchFaqs($module, $searchKey);

	abstract public function searchRecords($searchKey);

	abstract public function updateLoginDetails($status);

	public static function getInstance() {
		static $singleton = null;
		if ($singleton === null) {
			$singleton = new Vtiger_Portal_Connector();
		}

		return $singleton;
	}

}
