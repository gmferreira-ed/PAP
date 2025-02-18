<?php
   include "DBService.php";

   session_start();

   $userid = $_POST["userid"];
   $acess_level = $_SESSION["access_level"];

   if ($acess_level != "admin" &&  $userid != $_SESSION["userid"]){
      echo "You don't have permission to perform this action";
      exit();
   }

   $formdata = [
      "userid" => $userid,
      "fullname" => $_POST["fullname"],
      "email" => $_POST["email"],
      "phone" => $_POST["phone"]
  ];

   $result = set("users", $formdata, "`userid`=".$userid);
   echo $result;
?>
