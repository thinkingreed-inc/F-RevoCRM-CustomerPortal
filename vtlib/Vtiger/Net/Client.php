<?php
/*+***********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 *************************************************************************************/

include_once 'vtlib/thirdparty/network/Request.php';

/**
 * Provides API to work with HTTP Connection.
 * @package vtlib
 */
class Vtiger_Net_Client {
	var $client;
	var $url;
	var $response;

	/**
	 * Constructor
	 * @param String URL of the site
	 * Example: 
	 * $client = new Vtiger_New_Client('http://www.vtiger.com');
	 */
	function __construct($url) {
		$this->setURL($url);
	}

	/**
	 * Set another url for this instance
	 * @param String URL to use go forward
	 */
	function setURL($url) {
		$this->url = $url;
		$this->client = new HTTP_Request();
		$this->response = false;
		$this->setDefaultHeaders();
	}
	
	function setDefaultHeaders() {
		$headers = array();
		$crmUrl= Portal_Config::get('crm.url');
		if (isset($_SERVER)) {
			$headers['referer'] = isset($_SERVER['HTTP_REFERER'])? $_SERVER['HTTP_REFERER'] : ($crmUrl."?noreferer");
			
			if (isset($_SERVER['HTTP_USER_AGENT'])) {
				$headers['user-agent'] = $_SERVER['HTTP_USER_AGENT'];
			}
			
		} else {
			$headers['referer'] = ($crmUrl."?noreferer");
		}
		
		$this->setHeaders($headers);
	}

	/**
	 * Set custom HTTP Headers
	 * @param Map HTTP Header and Value Pairs
	 */
	function setHeaders($values) {
		foreach($values as $key=>$value) {
			$this->client->addHeader($key, $value);
		}
	}
	
	/**
	 * Perform a GET request
	 * @param Map key-value pair or false
	 * @param Integer timeout value
	 */
	function doGet($params=false, $timeout=null) {
		if($timeout) $this->client->_timeout = $timeout;
		$this->client->setURL($this->url);
		$this->client->setMethod(HTTP_REQUEST_METHOD_GET);

		if($params) {
			foreach($params as $key=>$value) 
				$this->client->addQueryString($key, $value);
		}
		$this->response = $this->client->sendRequest();

		$content = false;
		if(!$this->wasError()) {
			$content = $this->client->getResponseBody();
		}
		$this->disconnect();
		return $content;
	}

	/**
	 * Perform a POST request
	 * @param Map key-value pair or false
	 * @param Integer timeout value
	 */
	function doPost($params=false, $timeout=null) {
		if($timeout) $this->client->_timeout = $timeout;
		$this->client->setURL($this->url);
		$this->client->setMethod(HTTP_REQUEST_METHOD_POST);

		if($params) {
			if(is_string($params)) $this->client->addRawPostData($params);
			else {
				foreach($params as $key=>$value)
					$this->client->addPostData($key, $value);
			}
		}
		$this->response = $this->client->sendRequest();

		$content = false;
		if(!$this->wasError()) {
			$content = $this->client->getResponseBody();
		}
		$this->disconnect();

		return $content;
	}
    
    /**
	 * Add File to Send with a post
	 * @param String file upload fieldname
	 * @param Mixed path of file to add
     * @param Mixed file content type of file being uploaded(default : application/octet-stream)
	 */
    function addFiles($inputName, $filePath, $fileContentType = 'application/octet-stream') {
		$this->client->addFile($inputName, $filePath, $fileContentType);
	}

	/**
	 * Did last request resulted in error?
	 */
	function wasError() {
		return PEAR::isError($this->response);
	}

	/**
	 * Disconnect this instance
	 */
	function disconnect() {
		$this->client->disconnect();
	}
}
?>
