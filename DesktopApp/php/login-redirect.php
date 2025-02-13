<?php
    include "DBService.php";

    session_start();
    $username = $_POST["username"];
    $password = $_POST["password"];
    

    
   
    $result = get("users", "username = '$username'");
    $result = mysqli_fetch_array($result);
  
    
    $erro = null;

    if (isset($result["username"])){
        if ($result["active"] == true){
            if ($result["password"] == $password){
                $_SESSION["username"] = $username;
                $_SESSION["access_level"] = $result["access_level"]; 
                $_SESSION["email"] = $result["email"]; 
                $_SESSION["userid"] = $result["userid"]; 
                header("Location: ../Pages/home.php");
                exit();
            }else{
              $erro  = "The password is incorrect";
            }
        }else{
            $erro = "This account is deactivated and cannot be accessed";
        }
        
    }else{
        $erro = "The user does not exist";
    }
   
    
    $_SESSION["current_error"] = $erro;
    header("Location: ../Pages/login.php");

    exit();
?>