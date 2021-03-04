<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

global $result;
global $client;

function checkFileAccess($filepath) {
	$root_directory = '';

	// Set the base directory to compare with
	$use_root_directory = $root_directory;
	if (empty($use_root_directory)) {
		$use_root_directory = realpath(dirname(__FILE__).'/../../.');
	}

	$realfilepath = realpath($filepath);

	/** Replace all \\ with \ first */
	$realfilepath = str_replace('\\\\', '\\', $realfilepath);
	$rootdirpath = str_replace('\\\\', '\\', $use_root_directory);

	/** Replace all \ with / now */
	$realfilepath = str_replace('\\', '/', $realfilepath);
	$rootdirpath = str_replace('\\', '/', $rootdirpath);

	if (stripos($realfilepath, $rootdirpath) !== 0) {
		die("Sorry! Attempt to access restricted file.");
	}
	return true;
}

function checkFileAccessForInclusion($filepath) {
	$root_directory = '';

	// Set the base directory to compare with
	$use_root_directory = $root_directory;
	if (empty($use_root_directory)) {
		$use_root_directory = realpath(dirname(__FILE__).'/../../.');
	}

	$unsafeDirectories = array('storage', 'cache', 'test');

	$realfilepath = realpath($filepath);

	/** Replace all \\ with \ first */
	$realfilepath = str_replace('\\\\', '\\', $realfilepath);
	$rootdirpath = str_replace('\\\\', '\\', $use_root_directory);

	/** Replace all \ with / now */
	$realfilepath = str_replace('\\', '/', $realfilepath);
	$rootdirpath = str_replace('\\', '/', $rootdirpath);

	$relativeFilePath = str_replace($rootdirpath, '', $realfilepath);
	$filePathParts = explode('/', $relativeFilePath);

	if (stripos($realfilepath, $rootdirpath) !== 0 || in_array($filePathParts[0], $unsafeDirectories)) {
		die("Sorry! Attempt to access restricted file.");
	}
	return true;
}

function getblock_header($str, $headerspan = '4', $ticketcloselink = false) {

	if ($ticketcloselink == true) {
		$list .='<tr><td colspan="'.($headerspan - 1).'" class="detailedViewHeader"><b>'.getTranslatedString($str).'</b></td>';
		$list .='<td class="detailedViewHeader"><div align="right">'.$ticketcloselink.'</div></td></tr>';
	} else {
		$list .='<tr><td colspan="'.($headerspan).'" class="detailedViewHeader"><b>'.getTranslatedString($str).'</b></td></tr>';
	}
	return $list;
}

function getblock_fieldlist($block_array) {
	$list = '';
	$z = 0;
	$field_count = count($block_array);
	if ($field_count != 0) {
		for ($i = 0; $i < $field_count; $i++, $z++) {
			$blockname = $block_array[$i]['blockname'];
			$data = $block_array[$i]['fieldvalue'];
			if ($block_array[$i]['fieldlabel'] == 'Note') {
				$data = html_entity_decode($data);
			}
			if ($data == '')
				$data = '&nbsp;';
			if (strcmp($blockname, $block_array[$i - 1]['blockname'])) {
				if ($blockname != 'Ticket Information') //hardcoded for tickets information block so that it ll not be displayed
					$list .= getblock_header($blockname);
				$z = 0;
			}
			if ($z == 0 || $z % 2 == 0)
				$list .= '<tr>';
			$list .= '<td class="dvtCellLabel" width="20%" align="right">'.getTranslatedString($block_array[$i][fieldlabel]).'</td>';
			if (($z == 0 || $z % 2 == 0) && ($i == ($field_count - 1)))
				$list .= '<td colspan="3" width="20%" class="dvtCellInfo">'.$data.'</td>';
			else {
				if (stripos($block_array[$i]['fieldvalue'], 'download') != 0) {
					$list .= '<td width="20%" class="dvtCellInfo" onclick="downloadMisc(event,this);return false;">'.$data.'</td>';
				} else {
					$list .= '<td width="20%"  class="dvtCellInfo">'.$data.'</td>';
				}
			}
			if ($z % 2 == 1 || ($i == ($field_count - 1) ))
				$list .= '</tr>';
		}
	}
	$list.= '<tr><td colspan="4">&nbsp;</td></tr>';
	return $list;
}

function getTranslatedString($str) {
	global $app_strings;
	return (isset($app_strings[$str])) ? $app_strings[$str] : $str;
}

// The function to get html format list data
// input array
// output htmlsource list array
//only for product
function getblock_fieldlistview_product($block_array, $module) {

	$header = array();
	$header[0] = getTranslatedString($module);
	$header[1] = getTranslatedString('QUOTE_RELATED').getTranslatedString($module);
	$header[2] = getTranslatedString('INVOICE_RELATED').getTranslatedString($module);

	if ($block_array == '') {
		$list.='<tr><td>'.$module." ".getTranslatedString('LBL_NOT_AVAILABLE').'</td></tr>';
		return $list;
	}

	for ($k = 0; $k <= 2; $k++) {

		$header_arr = $block_array[$k][$module]['head'][0];
		$nooffields = count($header_arr);
		$data_arr = $block_array[$k][$module]['data'];
		$noofdata = count($data_arr);
		$list.=getblock_header($header[$k], $nooffields);
		if ($block_array[$k][$module]['data'] == '') {
			$list.='<tr><td>'.$header[$k]." ".getTranslatedString('LBL_NOT_AVAILABLE').'</td></tr>';
		}
		if ($nooffields != '') {

			$list .='<tr class="detailedViewHeader" align="center">';
			for ($i = 0; $i < $nooffields; $i++) {
				$list .= "<td>".getTranslatedString($header_arr[$i]['fielddata'])."</td>";
			}
			$list .='</tr>';
		}
		if ($noofdata != '') {
			for ($j = 0; $j < $noofdata; $j++) {
				if ($j == 0 || $j % 2 == 0)
					$list .='<tr class="dvtLabel">';
				else
					$list .='<tr class="dvtInfo">';

				for ($i = 0; $i < $nooffields; $i++) {
					$data = $data_arr[$j][$i]['fielddata'];
					if ($data == '')
						$data = '&nbsp;';
					$list .= "<td>".$data."</td>";
				}
				$list .='</tr>';
			}
		}
		$list .= '<tr><td colspan ="'.$nooffields.'">&nbsp;</td></tr>';
	}
	return $list;
}

// The function to get html format list data
// input array
// output htmlsource list array
//for quotes,notes and invoice

function getblock_fieldlistview($block_array, $block) {
	if ($block_array[0] == "#MODULE INACTIVE#") {
		$list.='<tr><td>'.getTranslatedString($block)." ".getTranslatedString('MODULE_INACTIVE').'</td></tr>';
		return $list;
	}
	if ($block_array == '') {
		$list.='<tr><td>'.getTranslatedString($block)." ".getTranslatedString('LBL_NOT_AVAILABLE').'</td></tr>';
		return $list;
	}
	$header_arr = $block_array[0][$block]['head'][0];
	$nooffields = count($header_arr);
	$data_arr = $block_array[1][$block]['data'];
	$noofdata = count($data_arr);
	if ($nooffields != '') {
		$list .='<tr align="center">';
		for ($i = 0; $i < $nooffields; $i++) {
			$list .= "<td  class='detailedViewHeader' >".getTranslatedString($header_arr[$i]['fielddata'])."</td>";
		}
		$list .='</tr>';
	}
	if ($noofdata != '') {
		for ($j = 0; $j < $noofdata; $j++) {
			if ($j == 0 || $j % 2 == 0)
				$list .='<tr class="dvtLabel">';
			else
				$list .='<tr class="dvtInfo">';

			for ($i = 0; $i < $nooffields; $i++) {
				$data = $data_arr[$j][$i]['fielddata'];
				if ($data == '')
					$data = '&nbsp;';
				if (stripos($data_arr[$j][$i]['fielddata'], 'download') != 0) {
					$list .= '<td onclick="downloadMisc(event,this)">'.$data."</td>";
				} else {
					$list .= "<td>".$data."</td>";
				}
			}
			$list .='</tr>';
		}

		$list .= '<tr><td colspan ="'.$nooffields.'">&nbsp;</td></tr>';
	}
	return $list;
}

// The function to get html format url_list data
// input array
// output htmlsource list array
function getblockurl_fieldlistview($block_array, $block) {
	$header_arr = $block_array[0][$block]['head'][0][0];
	$nooffields = count($header_arr);
	$data_arr = $block_array[1][$block]['data'];
	$noofdata = count($data_arr);
	if ($nooffields != '') {
		$list .='<tr class="detailedViewHeader" align="center">';
		for ($i = 0; $i < $nooffields; $i++) {
			$list .= "<td>".getTranslatedString($header_arr[$i]['fielddata'])."</td>";
		}
		$list .='</tr>';
	}
	if ($noofdata != '') {
		for ($j = 0; $j < $noofdata; $j++) {
			for ($j1 = 0; $j1 < count($data_arr[$j]); $j1++) {
				if ($j1 == '0' || $j1 % 2 == 0)
					$list .='<tr class="dvtLabel">';
				else
					$list .='<tr class="dvtInfo">';

				for ($i = 0; $i < $nooffields; $i++) {
					$data = $data_arr[$j][$j1][$i]['fielddata'];
					if ($data == '')
						$data = '&nbsp;';
					if ($i == '0' || $i == '1') {
						if ($j1 == '0')
							$list .= '<td rowspan="'.count($data_arr[$j]).'" >'.$data."</td>";
					} else
						$list .= "<td>".$data."</td>";
				}
				$list .='</tr>';
			}
		}
	}
	$list .= '<tr><td colspan ="'.$nooffields.'">&nbsp;</td></tr>';

	return $list;
}

/* 	Function to Show the languages in the Login page
 * 	Takes an array from PortalConfig.php file $language
 * 	Returns a list of available Language
 */

function getPortalLanguages() {
	global $languages, $default_language;
	foreach ($languages as $name => $label) {
		if (strcmp($default_language, $name) == 0) {
			$list .= '<option value='.$name.' selected>'.$label.'</option>';
		} else {
			$list .= '<option value='.$name.'>'.$label.'</option>';
		}
	}
	return $list;
}

/* 	Function to set the Current Language
 * 	Sets the Session with the Current Language
 */

function setPortalCurrentLanguage() {
	global $default_language;
	if (isset($_REQUEST['login_language']) && $_REQUEST['login_language'] != '') {
		$_SESSION['portal_login_language'] = $_REQUEST['login_language'];
	} else {
		$_SESSION['portal_login_language'] = $default_language;
	}
}

/* 	Function to get the Current Language
 * 	Returns the Current Language
 */

function getPortalCurrentLanguage() {
	global $default_language;
	if (isset($_SESSION['portal_login_language']) && $_SESSION['portal_login_language'] != '') {
		$default_language = $_SESSION['portal_login_language'];
	} else {
		$default_language = 'en_us';
	}
	return $default_language;
}

/** HTML Purifier global instance */
$__htmlpurifier_instance = false;

/*
 * Purify (Cleanup) malicious snippets of code from the input
 *
 * @param String $value
 * @param Boolean $ignore Skip cleaning of the input
 * @return String
 */

function portal_purify($input, $ignore = false) {
	global $default_charset, $__htmlpurifier_instance;

	$use_charset = $default_charset;
	$value = $input;
	if ($ignore === false) {
		// Initialize the instance if it has not yet done
		if (empty($use_charset))
			$use_charset = 'UTF-8';

		if ($__htmlpurifier_instance === false) {
			require_once('include/htmlpurify/library/HTMLPurifier.auto.php');
			$config = HTMLPurifier_Config::createDefault();
			$config->set('Core.Encoding', $use_charset);
			$config->set('Cache.SerializerPath', "test/cache");
			$config->set('HTML', 'ForbiddenAttributes', 'img@src');
			$__htmlpurifier_instance = new HTMLPurifier($config);
		}
		if ($__htmlpurifier_instance) {
			$value = $__htmlpurifier_instance->purify($value);
		}
	}
	$value = str_replace('&amp;', '&', $value);
	return $value;
}

?>