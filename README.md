#Vtiger CRM Customer Portal

##Pre-requisites

* Enable php cURL extension.
* Write permission for webserver (Apache) process owner  on writeable folder.
* Vtiger CRM 7.1.0 with CustomerPortal module enabled.

##Installation

* Copy config.sample.php to config.php
* Update config.php variales
    * crm.url — Vtiger CRM URL fully qualified.
    * portal.url — URL of this application.
* Make sure crm.url is reachable from this server.