<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_DownloadFile_API extends Portal_Default_API {

	public function process(Portal_Request $request) {
		$module = $request->getModule();
		$parentId = $request->get('parentId');
		// Required attachment Id incase if module is modcomments
		// to support multiple attachment
		$attachmentId = $request->get('attachmentId');
		$parentModule = $request->get('parentModule');
		$result = Vtiger_Connector::getInstance()->downloadFile($module, $request->get('recordId', array()), $parentId, $parentModule, $attachmentId);
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Transfer-Encoding: binary');
		header('Cache-Control: must-revalidate');
		header('Content-type: '.$result['filetype']);
		header('Content-Disposition: attachment; filename='.$result['filename']);
		header('Expires: 0');
		header('Pragma: public');
		header('Content-Length: '.$result['filesize']);
		ob_clean();
		flush();
		echo base64_decode($result['filecontents']);
	}

}
