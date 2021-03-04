<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

define('KB', 1024);
define('MB', 1048576);
define('GB', 1073741824);
define('TB', 1099511627776);

class Portal_UploadAttachment_API extends Portal_Default_API {

	public function process(Portal_Request $request) {
		set_time_limit(0);
		ini_set('memory_limit', '1024M');
		$maxUploadSize = Portal_Config::get('upload_max_filesize');
		$module = $request->getModule();
		$parentId = $request->getParentId();
		foreach ($_FILES as $file => $details) {
			if ($details['size'] > $maxUploadSize * MB) {
				unset($_FILES[$file]);
				$response = new Portal_Response();
				$response->setError('Filesize larger than $maxUploadSize');
				return $response;
			}
		}
		$values = array(
			'filelocationtype' => 'I', 'filestatus' => '1');
		$result = Vtiger_Connector::getInstance()->uploadAttachment($module, $parentId);
		$response = new Portal_Response();
		$response->setResult($result);
		return $response;
	}

}
