<?php
/* +**********************************************************************************
 * The contents of this file are subject to the vtiger CRM Public License Version 1.2
 * ("License.txt"); You may not use this file except in compliance with the License
 * The Original Code is: Vtiger CRM Open Source
 * The Initial Developer of the Original Code is Vtiger.
 * Portions created by Vtiger are Copyright (C) Vtiger.
 * All Rights Reserved.
 * ***********************************************************************************/

class Portal_FetchRecentRecords_API extends Portal_Default_API {

    public function process(Portal_Request $request) {
        $response = new Portal_Response();
        $result = Vtiger_Connector::getInstance()->fetchRecentRecords($language);
        $response->setResult($this->processRecentRecords($result));
        return $response;
    }

    public function processRecentRecords($result) {
        $recentRecords = array();
        foreach ($result as $key => $value) {
            foreach ($value as $module => $records) {
                foreach ($records as $labelid => $info) {
                    $records[$labelid]['label']=html_entity_decode($info['label'], ENT_QUOTES, 'utf-8');
                    $recentRecords['records'][$module][] = $records[$labelid];
                }
            }
        }
        return $recentRecords;
    }

}
