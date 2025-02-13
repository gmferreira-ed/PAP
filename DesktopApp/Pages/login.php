<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="../corestyles.css">
  <script src="../GlobalFunctions.js"></script>
</head>

<script type="module">
  import InputVerifs from "../Modules/InputVerifs.js";
</script>
<body >

  <?php
  session_start();


  
  if (isset($_SESSION["username"])){
    header("Location: home.php");
    exit();
  }else{
    
  }
  ?>
<div class = "container">
  <div class="login-container">
    <label class="title" style="margin-top: 45px;">Welcome back</label>
    <label style=" margin-bottom:30px" class="smallcaption">Log in to continue</label>

    <div class="separator" style=" width:60%"></div>
    <?php 
  
    if (isset($_SESSION["current_error"])){
        echo '<div class="error-text">'.$_SESSION["current_error"]."</div>";
        unset($_SESSION['current_error']);
      }
    ?>



    <form class="form-container" action="../php/login-redirect.php" method="POST" onsubmit="return VerificarValores()">

    
      <div class="form-col">
          <label class="field-header">Username</label>
          <div class="row-layout">
            <img src="../Images/Icons/profile.svg" class="input-icon">
            <input class="login-input" type="text" id="username" name="username" placeholder="Enter your username" required>
          </div>
      </div>

      <div class="form-col" style="margin-top:25px">
          <label class="field-header">Password*</label>
          <div class="row-layout">
            <img src="../Images/Icons/lock.svg" class="input-icon">
            <input  class="login-input"  type="password" id="password" name="password" placeholder="Enter your password" required>      
          </div>
      </div>

 
      <div style="width:100%; margin-bottom:30px">
        <div class="smallh" style="text-align:right; font-size: 12px; margin-right:10px">Forgot Password?</div>
      </div>


      <button type="submit" class="login-button">LOGIN</button>
    </form>

 

    <div class="separator" style="margin-top:50px; width:40%"></div>

    <label class="smallcaption" style="margin-top:5px">Don't an account?</label>
    <label style="margin-bottom:5px;margin-top:5px" class="link2" onclick='Redirect("register.php")'>SIGN UP</labe>

  </div>
</div>



</body>

</html>