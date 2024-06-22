<?php
/*
Template Name: Serve
*/

$txt1 = "Learn PHP";
$txt2 = "W3Schools.com";


// From URL to get webpage contents.
// $code = $_REQUEST['code']
$code = "Hello"
echo "<h2>$txt1</h2>";

$entityBody = file_get_contents('php://input');
// echo "link = ";
echo "<p>{\"code\":\"" + $entityBody + "\"}</p>";
echo "<p>Study PHP at $txt2</p>";

 
// $data = array("code" => $code , "grant_type" => "authorization_code");                                                                    
// $data_string = json_encode($data);     
// $result = CurlSendPostRequest("https://login.eveonline.com/oauth/token", $data_string);
// echo $result;

?>