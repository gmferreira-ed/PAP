<?php

$servername = "localhost";
$username = "root";
$password = "";

$con = mysqli_connect($servername, $username, $password);

if(!$con){
    die("Erro ao conectar ao MySQL: " . mysqli_connect_error());
}

$escolheBD = mysqli_select_db($con,"restaurante");

if(!$escolheBD){
    echo "Erro: não foi possível aceder à Base de Dados!";
    exit();
}

?>