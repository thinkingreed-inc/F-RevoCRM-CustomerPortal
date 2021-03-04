<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_Main_Controller {

	protected function initLogin($redirectUri) {
		if (!Vtiger_Connector::getInstance()->isAuthenticated()) {
			$portalUrl = Portal_Config::get('portal.url');
			if ($portalUrl) {
				if ($redirectUri) {
					header("Location: $portalUrl/index.php?$redirectUri");
					exit;
				}
			} else {
				throw new Exception('Authentication required');
			}
		}
	}

	public function dispatch(Portal_Request $request) {
		Portal_Session::init();

		$response = null;
		try {
			$module = $request->getModule('Portal');
			$view = $request->getView('Index');
			$api = $request->getApi();

			// Routing
			// module=Target&view=Index (try: Target_Index_View, Portal_Default_View - a generic handler)
			// module=Target&api=Context  (try: Target_Context_API,  Portal_Context_API - a fallback handler)

			$targetClass = $module."_".($api ? $api : $view)."_".($api ? "API" : "View");
			$fallbackClass = "Portal_".($api ? $api : 'Default')."_".($api ? "API" : "View");
			$target = class_exists($targetClass) ? new $targetClass() : new $fallbackClass();
			if (!$target) {
				throw new Exception('Unsupported request');
			}

			if ($target->requireLogin()) {
				$this->initLogin($api ? NULL : 'module=Portal&view=Login');
			}

			if (!$api && !$request->isAjax()) {
				$target->preProcess($request);
			}

			$response = $target->process($request);

			if (!$api && !$request->isAjax()) {
				$target->postProcess($request);
			}
		} catch (Exception $e) {
			$response = new Portal_Response();
			$response->setError($e->getMessage());
		}

		if ($response) {
			$response->emit();
		}
	}

}
