<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

define('PORTAL_APP_DIR', realpath(dirname(__FILE__).'/../..'));

class Portal_Loader {

	public static function autoLoad($className) {
		$parts = explode('_', $className);
		$noOfParts = count($parts);
		$filename = null;

		/**
		 * Class Format:
		 *
		 * Group_Class_Type => Group/types/Class.php
		 * Group_Class => Group/Class.php
		 */
		if ($noOfParts > 2) {
			$lastPart = array_pop($parts);
			$lastOnePart = array_pop($parts);
			array_push($parts, strtolower($lastPart).'s');
			array_push($parts, $lastOnePart);
			$filename = PORTAL_APP_DIR."/classes/".implode('/', $parts).'.php';
		} else if ($noOfParts > 1) {
			$filename = PORTAL_APP_DIR."/classes/".implode('/', $parts).'.php';
		}
		if ($filename && file_exists($filename)) {
			// TODO check if the file is within webdirectory.
			require_once $filename;
		}
	}

}

spl_autoload_register('Portal_Loader::autoLoad');
