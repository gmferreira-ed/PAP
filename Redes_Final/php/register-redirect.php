<?php
    include "DBService.php";
    include "ligabd.php";


    session_start();

    $IsAdmin = isset($_SESSION["username"]) && $_SESSION["access_level"] == "admin";

    $response = [
        "sucess" => true,
        "error" => "",
        "redirect" => null,
    ];

    $username = $_POST["username"];
    $active = true;
    $email = $_POST["email"];
    $phone = $_POST["phone"];
    $fullname = $_POST["fullname"];
    $birthdate = $_POST["birthdate"];
    $country = $_POST["country"];
    $city = $_POST["city"];
    $adress = $_POST["adress"];
    $postalcode = $_POST["postalcode"];
    $password = $_POST["password"];
    
    $SQL_function = "SELECT *
    FROM users
    WHERE email = '".$email."'
    OR phone = '".$phone."'
    OR username = '".$username."';";

    $result = mysqli_query($con, $SQL_function);
    $profileinfo = mysqli_fetch_array( $result);


    if (!$profileinfo){

        $formdata = [];
        $formdata["username"] = $username;
        $formdata["email"] = $email;
        $formdata["phone"] = $phone;
        $formdata["active"] = $active;
        $formdata["fullname"] = $fullname;
        $formdata["birthdate"] = $birthdate;
        $formdata["country"] = $country;
        $formdata["city"] = $city;
        $formdata["adress"] = $adress;
        $formdata["postalcode"] = $postalcode;
        $formdata["password"] = $password;
    
        $_SESSION["RegisterForm"] = $formdata;
        
        $code = str_pad(rand(0, 999999), 6, '0', STR_PAD_LEFT);
        $_SESSION["verification_code"] = $code;
    
        if ($IsAdmin){
            require "verify-account.php";
            exit;
        }else{
            
            $receiver = $_POST["email"]; 
            $sender = "From:gabrielmonteiroferreira@gmail.com"; 
            $subject = "Table Flow Verification Code";
           
            
        
            $body = "
                    Welcome,
                    
                    Thank you for choosing Table Flow. In order to use our services, you must verify your account.
                    
                    Here is your verification code:
                    $code
                    
        
        
                    TableFlow Team.
            ";
        
        
            if(mail($receiver, $subject, $body, $sender)){
               // echo "Email sent successfully to $receiver";
            }else{
               // echo "Sorry, failed while sending mail!";
            }
        }
    }else{

        $repeated_arguments = "";

          
        if ($profileinfo['username'] == $username) {
            $repeated_arguments = $repeated_arguments."username";
        }
        if ($profileinfo['phone'] == $phone) {
            $repeated_arguments = $repeated_arguments.", phone";
        }
        if ($profileinfo['email'] == $email) {
            $repeated_arguments = $repeated_arguments.", email";
        }

        $error = "An account with the same ".$repeated_arguments." already exists";
        $response['error'] = $error;
        $response['sucess'] = false;
        $_SESSION["current_error"] = $error;
        $response['redirect'] = "register.php";
    }


    echo json_encode($response);
    
    exit();
?>