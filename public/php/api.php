<?php

/*
Eve Online character login
*/

function CurlSendPostRequest($url,$request)
    {
        $authentication = base64_encode("5fe7b21736e748c6a78d9e4f98ff536e:5e0tEfn1tNwFPvEz4EEcXcJIpSngdGQBc3cbdOgU");

        $ch = curl_init($url);
        $options = array(
                CURLOPT_RETURNTRANSFER => true,         // return web page
                CURLOPT_HEADER         => false,        // don't return headers
                CURLOPT_FOLLOWLOCATION => false,         // follow redirects
               // CURLOPT_ENCODING       => "utf-8",           // handle all encodings
                CURLOPT_AUTOREFERER    => true,         // set referer on redirect
                CURLOPT_CONNECTTIMEOUT => 20,          // timeout on connect
                CURLOPT_TIMEOUT        => 20,          // timeout on response
                CURLOPT_POST            => 1,            // i am sending post data
                CURLOPT_POSTFIELDS     => $request,    // this are my post vars
                CURLOPT_SSL_VERIFYHOST => 0,            // don't verify ssl
                CURLOPT_SSL_VERIFYPEER => false,        //
                CURLOPT_VERBOSE        => 1,
                CURLOPT_HTTPHEADER     => array(
                    "Authorization: Basic $authentication",
                    "Content-Type: application/json"
                )

        );

        curl_setopt_array($ch,$options);
        $data = curl_exec($ch);
        $curl_errno = curl_errno($ch);
        $curl_error = curl_error($ch);
        //echo $curl_errno;
        //echo $curl_error;
        curl_close($ch);
        return $data;
    }

$code = $_GET['code'];
$data = array("grant_type" => "authorization_code","code" => $code);                                                                    
$data_string = json_encode($data);     
$result = CurlSendPostRequest("https://login.eveonline.com/oauth/token", $data_string);
echo $result;

?>