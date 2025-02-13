<?php 

    include "../php/initializer.php";

    if (isset($_SESSION["userid"])){
        $userdata = "'profile.php?id=".$_SESSION["userid"]."'";
    }
?>





<head>
    <script src="../GlobalFunctions.js"></script>
    <script src="../initializer.js" defer></script>
    <link rel="icon" type="image/x-icon" href="../Images/favicon.ico">
    <title>Restro Link</title>
</head>






<div class="layout">
    <div class="navbar" id="side-navbar">
        <div class="navbar-icon">
            <img  src="../Images/RestroLink.png">
        </div>
        <button class="navbar-button"  page-link='home.php'>
            <img src="../Images/Icons/home.svg" class="nav-button-icon" ></img>
            <span class="nav-button-label">Home</span>
        </button>
        <span class="separator" style=""></span>
        <button class="navbar-button"  page-link='finances.php'>
            <img src="../Images/Icons/finances.svg" class="nav-button-icon"></img>
            <span class="nav-button-label">Finances</span>
        </button>

        
       
        <button class="navbar-button"  page-link='calendar.php'>
            <img src="../Images/Icons/calendar.svg" class="nav-button-icon"></img>
            <span class="nav-button-label">Calendar</span>
        </button>


        <button class="navbar-button"  page-link='menu.php'>
            <img src="../Images/Icons/menu.svg" class="nav-button-icon"></img>
            <span class="nav-button-label">Menu</span>
        </button>

        <button class="navbar-button"  page-link='stocks.php'>
            <img src="../Images/Icons/stocks.svg" class="nav-button-icon"></img>
            <span class="nav-button-label">Stocks</span>
        </button>

        <span class="separator"></span>
     
        <button class="navbar-button" page-link='users.php'>
            <img src="../Images/Icons/group.svg" class="nav-button-icon"></img>
            <span class="nav-button-label">Users</span>
        </button>
        
        <button class="navbar-button" page-link='settings.php'>
            <img src="../Images/Icons/settings.svg" class="nav-button-icon"></img>
            <span class="nav-button-label">Settings</span>
        </button>
    </div>

    <div class="container">

    <div>  
</div>



<script>

    // DEFAULT IMPORTS

    function Redirect(Page){
        window.location.href = Page
    }

</script>