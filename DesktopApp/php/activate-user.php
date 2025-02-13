<?php
    include "DBService.php";


    $userid = $_POST["userid"];
    $formdata = [
        "userid" => $userid,
        "active" => (int)filter_var($_POST["activate"], FILTER_VALIDATE_BOOLEAN),
    ];

    $result = set("users", $formdata);

    echo $result;
?>