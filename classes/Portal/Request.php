<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_Request {

	protected $data;

	protected function __construct($values = array(), $stripifgpc = true) {
		$this->data = $values;
		if ($stripifgpc && !empty($this->data) && get_magic_quotes_gpc()) {
			$this->data = $this->stripslashes_recursive($this->data);
		}
	}

	function stripslashes_recursive($value) {
		$value = is_array($value) ? array_map(array($this, 'stripslashes_recursive'), $value) : stripslashes($value);
		return $value;
	}

	function set($key, $newvalue) {
		$this->data[$key] = $newvalue;
	}

	function get($key, $defval = NULL) {
		$has = isset($this->data[$key]);
		if ($has)
			$has = !empty($this->data[$key]);

		if ($has) {
			$isJSON = false;
			$value = $this->data[$key];

			if (is_string($value)) {
				// NOTE: Zend_Json or json_decode gets confused with big-integers (when passed as string)
				// and convert them to ugly exponential format - to overcome this we are performin a pre-check
				if (strpos($value, "[") === 0 || strpos($value, "{") === 0) {
					$isJSON = true;
				}
			}
			if ($isJSON) {
				$decodedValue = json_decode($value, true);
				if (isset($decodedValue)) {
					$value = $decodedValue;
				}
			}
			return $value;
		}

		return $defval;
	}

	function has($key, $strict = true) {
		return isset($this->data[$key]) || ($strict && !empty($this->data[$key]));
	}

	function getAll() {
		return $this->data;
	}

	function isAjax() {
		if (!empty($_SERVER['HTTP_X_PJAX']) && $_SERVER['HTTP_X_PJAX'] == true) {
			return true;
		} elseif (!empty($_SERVER['HTTP_X_REQUESTED_WITH'])) {
			return true;
		}
		return false;
	}

	// Helpers
	function getModule($defval = NULL) {
		return $this->get('module', $defval);
	}

	function getView($defval = NULL) {
		return $this->get('view', $defval);
	}

	function getApi($defval = NULL) {
		return $this->get('api', $defval);
	}

	function getParentId($defval = NULL) {
		return $this->get('parentId', $defval);
	}

	function getLanguage($defval = 'en_us') {
		return $this->get('language', $defval);
	}

	/**
	 * Parse JSON POST request if available, else use $_REQUEST.
	 */
	public static function parseFormOrJSONRequest() {
		$parameters = NULL;

		if (isset($_SERVER['CONTENT_TYPE']) && stripos($_SERVER['CONTENT_TYPE'], 'application/json') !== false) {
			$body = file_get_contents('php://input');
			$parameters = json_decode($body, true);
			if (isset($_SERVER['QUERY_STRING'])) {
				parse_str($_SERVER['QUERY_STRING'], $qparameters);
				foreach ($qparameters as $key => $value) {
					$parameters[$key] = $value;
				}
			}
		} else {
			$parameters = & $_REQUEST;
		}

		return new self($parameters);
	}

}
