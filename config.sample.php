<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

version_compare(PHP_VERSION, '5.5.0') <= 0 ? error_reporting(E_WARNING & ~E_NOTICE & ~E_DEPRECATED) : error_reporting(E_WARNING & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT); // PRODUCTION
//ini_set('display_errors','on'); version_compare(PHP_VERSION, '5.5.0') <= 0 ? error_reporting(E_WARNING & ~E_NOTICE & ~E_DEPRECATED) : error_reporting(E_ALL & ~E_NOTICE & ~E_DEPRECATED & ~E_STRICT);   // DEBUGGING

if (file_exists('PortalConfig.php')) {
	include_once 'PortalConfig.php';
	global $crmUrlFromPC;
	if ($Server_Path) {
		$crmUrlFromPC = $Server_Path;
	}

	global $portalUrlFromPC;
	if ($Authenticate_Path) {
		$portalUrlFromPC = $Authenticate_Path;
	}
}

class Portal_Config_Data {

	protected static $data = array(
		//CRM URL without trialing/
		//Example: http://yourdomain.com/crm
		'crm.url' => 'http://localhost/frevocrm',

		//Portal URL without trialing/
		//Example: http://yourdomain.com/portal
		'portal.url' => 'http://example.co.jp/portal',

		'crm.version' => '7.1.0', // Framework version for API
		'language' => 'ja_jp', // Default Language for API. Note : Changing the language here will not change the default/login language for Portal user.
		'layout' => 'default',
	);

	protected static function getData() {
		global $crmUrlFromPC;

		$crmUrl = self::$data['crm.url'];
		if (!$crmUrl && $crmUrlFromPC) {
			$crmUrl = $crmUrlFromPC;
			self::$data['crm.url'] = $crmUrlFromPC;
		}
		if ($crmUrl) {
			self::$data['crm.connect.url'] = $crmUrl.'/modules/CustomerPortal/api.php';
		}

		global $portalUrlFromPC;
		$portalUrl = self::$data['portal.url'];
		if (!$portalUrl && $portalUrlFromPC) {
			self::$data['portal.url'] = $portalUrlFromPC;
		}

		self::$data['upload_max_filesize'] = '100 MB';
		//defaultUiLanguage is the ui language, should be one of the values from availableLanguages.
		self::$data['ui.Language'] = array('label' => 'US English', 'value' => 'en_us');

		//availableLanguages is the array containing all the label and value pair of all supported languages.
		self::$data['languages'] = array(
										array('label' => 'US English', 'value' => 'en_us'),
										array('label' => 'DE Deutsch', 'value' => 'de_de'),
										array('label' => 'PT Brasil', 'value' => 'pt_br'),
										array('label' => 'Francais', 'value' => 'fr_fr'),
										array('label' => 'Turkce Dil Paketi', 'value' => 'tr_tr')
									);
		return self::$data;
	}

}

//Give a temporary directory path which is used when we upload attachment
$upload_dir = '/tmp';

//The character set to be used as character encoding for all soap requests
$default_charset = 'UTF-8'; //'ISO-8859-1';

$default_language = 'en_us';
