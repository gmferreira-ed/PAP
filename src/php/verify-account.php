<?php
    if(!isset($_SESSION)) 
    { 
        session_start(); 
    } 

    require "ligabd.php";
    include_once "DBService.php";

    $IsAdmin = isset($_SESSION["username"]) && $_SESSION["access_level"] == "admin";
    $verification_code = $_SESSION["verification_code"];
    $formdata = $_SESSION["RegisterForm"];

    $response = [
        "sucess" => true,
        "error" => "",
        "redirect" => null,
        "isadmin" => $IsAdmin,
    ];

    if (isset($_POST["code"]) && $_POST["code"] == $verification_code || $IsAdmin){


        $result = set("users", $formdata, null, true);
     
        unset($_SESSION["RegisterForm"]);

        $response['result'] = $result;
        if (!$IsAdmin){
            $_SESSION["userid"] = $result;
            $_SESSION["username"] = $formdata["username"];
            $_SESSION["email"] = $formdata["email"];
            $_SESSION["phone"] = $formdata["phone"];
            $_SESSION["active"] = $formdata["active"];
            $_SESSION["fullname"] = $formdata["fullname"];
            $_SESSION["birthdate"] = $formdata["birthdate"];
            $_SESSION["country"] = $formdata["country"];
            $_SESSION["city"] = $formdata["city"];
            $_SESSION["adress"] = $formdata["adress"];
            $_SESSION["postalcode"] = $formdata["postalcode"];
            $_SESSION["access_level"] = "admin";
        }
    
    

        if ($IsAdmin){
            $response['redirect'] = "users.php";
        }else{
            $response['redirect'] = "home.jsx";
        }

    }else{
        $response['error'] = "The code is incorrect";
        $response['sucess'] = false;
    }

    echo json_encode($response);

    exit;

   
?>