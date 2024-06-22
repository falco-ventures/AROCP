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

// $data = array("code" => $code , "grant_type" => "authorization_code");                                                                    
$data_string = $code; //json_encode($data);     
// $entityBody = file_get_contents('php://input');
// echo "link = ";
echo "<p>Body $entityBody</p>";
echo "<p>Study PHP at $data_string</p>";
echo "<p>Study PHP at $txt2</p>";

 
// $result = CurlSendPostRequest("https://login.eveonline.com/oauth/token", $data_string);
// echo $result;

?>
