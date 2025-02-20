<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="stylesheet" href="../corestyles.css">
  <script src="../GlobalFunctions.js"></script>
</head>


<body>
  <?php
    session_start();
    

    $validlogin = isset($_SESSION["username"]);
    $IsAdmin = isset($_SESSION["username"]) && $_SESSION["access_level"] == "admin";

    if ($validlogin && $_SESSION["access_level"] != "admin"){
      header("Location: home.jsx");
      exit();
    }
   ?>
<div class = "container">
  <div class="login-container">

    <?php 
      if ($IsAdmin){
        echo '<label class="signup-header">ADD USER</label>
        <label class="smallcaption">Create a new account</label>';
      }else{
        echo '<label class="signup-header">SIGN UP</label>
    <label class="smallcaption">Create an account to continue</label>';
      }

    ?>



    <div class="separator"></div>

   <?php  if (isset($_SESSION["current_error"])){
        $erro = $_SESSION["current_error"];
        echo '<div class="error-text">'.$erro."</div>";
        unset($_SESSION['current_error']);
      } ?>

    <h3>Personal Info</h3>

    <div class="form-container" >

      

    
        <div class="form-col">
          <label class="field-header" for="fullname">Full Name</label>
          <div class="row-layout">
              <input class="login-input" type="text" id="fullname" name="fullname" placeholder="Full Name" required>
          </div>
          
        </div>
 


        <div class="form-row">
          <div class="form-col" style="width:45%">
            <label class="field-header" for="birthdate">Birthdate</label>
            <div class="row-layout">
              <input class="login-input" type="date" id="birthdate" name="birthdate" min="1900-01-01" required>
            </div>
          </div>
          <div class="form-col">
            <label class="field-header" maxlength="10" for="postalcode">Postal Code</label>
            <div class="row-layout">
                <input class="login-input" type="text" id="postalcode" name="postalcode" placeholder="Postal Code" required>
            </div>
          </div>
          
        </div>
      

        <div class="form-row">
          <div class="form-col">
            <label class="field-header" for="city">City</label>
            <div class="row-layout">
                <input class="login-input" type="text" id="city" name="city" placeholder="City" required>
            </div>
          </div>
          <div class="form-col">
            <label class="field-header" for="country">Country</label>
            <div class="row-layout">
              <input class="login-input" type="text" id="country" name="country" placeholder="Country" required>
            </div>
          </div>
        </div>

        <div class="form-col">
          <label class="field-header" for="adress">Adress</label>
          <div class="row-layout">
              <input class="login-input" type="text" id="adress" name="adress" placeholder="Home Adress" required>
          </div>
        </div>
        


        <div class="separator"></div>
      <h3>Account Info</h3>


        <div class="form-col">
          <label class="field-header" for="username">Username</label>
          <div class="row-layout">
              <input class="login-input" type="text" id="username" name="username" placeholder="Username" required>
          </div>
        </div>
     
      

        <div class="form-col">
          <label class="field-header" for="email">Email*</label>
          <div class="row-layout">
              <input class="login-input" type="email" id="email" name="email" placeholder="Email Adress *" required>
          </div>
        </div>
        <div class="form-col">
          <label class="field-header" for="phone">Phone Number*</label>
          <div class="row-layout">
              <input class="login-input" type="tel" maxlength="10" id="phone" name="phone" placeholder="Phone Number *" required>
          </div>
        </div>
   

    
        <div class="form-col">
          <label class="field-header" for="password">Password*</label>
         
          <div class="row-layout">
            <input class="login-input" type="password" id="password" name="password" placeholder="+8 characters*" required>
            <button type="button"  class="password-button" >
              <img id="PasswordVis" src="Images/Icons/notvisible.svg" style="width: 100%; height: 100fr;">
            </button>
          </div>
        </div>


      <button type= "button" id="submit-button" class="login-button">Register</button>
    </form>


    <div id="code-menu" class="verification-overlay">
        <div class="verification-container">
            <h2>Enter Verification Code</h2>
            <label class="smallcaption">A verification code was sent to your email. Please insert your verification code down below in order to create your account</label>
            <div id="code-container" class="code-input-layout">
              <input class="code-input" maxlength="1"/>
              <input class="code-input" maxlength="1"/>
              <input class="code-input" maxlength="1"/>
              <input class="code-input" maxlength="1"/>
              <input class="code-input" maxlength="1"/>
              <input class="code-input" maxlength="1"/>
            </div>
            <button type= "button" id="verify-button" class="login-button">VERIFY</button>
        </div>
    </div>
  </div>
  </div>
  </div>

  <script type="module">
    import InputVerifs from "../Modules/InputVerifs.js";

    const BoxPassword = document.getElementById('password');
    const BoxPasswordConfirm = document.getElementById('confirm-password');
    const Birth = document.getElementById('birthdate');
    const PasswordBox = document.getElementById("password")
    const SubmitButton =document.getElementById('submit-button')
    const CodeMenu =document.getElementById('code-menu')
    const CodeInputsContainer =document.getElementById('code-container')
    const PhoneInput =document.getElementById('phone')
    const VerifyButton =document.getElementById('verify-button')
    const T = new Date()
    const MinAge = new Date(T.getFullYear() - 13, T.getMonth(), T.getDate());
    const MinFin = MinAge.toISOString().split('T')[0];
    Birth.setAttribute('max', MinFin)

    PhoneInput.addEventListener("input", function(){
      var CurrentValue = PhoneInput.value
      let numbersOnly = CurrentValue.replace(/\D/g, '')
      PhoneInput.value = numbersOnly
    })

    var AllInputs = document.getElementsByClassName('login-input');
    var NumberInputs = document.getElementsByClassName('code-input');
    const N_NumberInputs =NumberInputs.length

    for(var i = 0; i < N_NumberInputs; i++) {
      const Input = NumberInputs[i]
      const NextInput =NumberInputs[i+1]
      const PreviousIndex = i-1
      const PreviousInput = NumberInputs[PreviousIndex]
     
      Input.addEventListener('input', function(event){
        let numbersOnly = Input.value.replace(/\D/g, '')
        Input.value =numbersOnly
      })
      Input.addEventListener('keydown', function(event){
          let IsBackspace = event.key == 'Backspace'
          const isNumber = /^[0-9]$/i.test(event.key)
          
          setTimeout(function(){
            if (isNumber){
              if (NextInput){
                NextInput.focus()
              }
            }else if (IsBackspace && PreviousInput){
              PreviousInput.focus()
            }
            
            
          }, 0);
          
          
      })
    }


    VerifyButton.addEventListener('click', function(){
      var FilledInputs = 0
      var FinalCode = ""

      for (var i = 0; i < N_NumberInputs; i++){
        let input = NumberInputs[i]
        if (input.value != ""){
          FilledInputs +=1
          FinalCode = FinalCode+input.value
        }
      }

 
      if (FilledInputs == N_NumberInputs){
        ShowLoader();
        var formData = new FormData();
        formData.append("code", FinalCode);

        var request = new XMLHttpRequest();
        request.open("POST", "../php/verify-account.php");
        request.send(formData);

        request.onreadystatechange = function () {
          if (request.readyState == XMLHttpRequest.DONE) {
            HideLoader();
            
            if (request.status >= 200 && request.status < 300) {
                console.log(response)
                var response = JSON.parse(request.responseText)
                if (!response['sucess']){
                  console.log(response.error)
                  alert(response.error)
                }
                if (response.redirect){
                   window.location.href = response.redirect;
                }
            } else {
                console.error("Request failed with status:", request.status, request.statusText);
            }
          } 
        };
      }
    })
    
    
    function VerificarNumero(textb){
      textb.value = textb.value.replace(/[^0-9]/g, '');
    }


    function ResetEffect(input){
      input.style.backgroundColor = "";
      input.style.borderColor = "" ;
      input.ErrorLabel.style.display = "none"
    }

    function VerifyField(input, IgnoreBlank){

      let IsBlank = input.value == ""
      let verificationfunction =  !IsBlank && InputVerifs[input.id] || !IgnoreBlank && InputVerifs.default ||function(){return true}

      let ErrorMessage = verificationfunction(input.value)
      let IsValid = typeof(ErrorMessage) != "string"
      let ErrorLabel =input.ErrorLabel


      if (!IsValid){
          input.style.backgroundColor = "rgb(255,100,100, 0.1)"
          input.style.borderColor = "rgb(255, 0, 0, 0.5)" ;
          ErrorLabel.style.display = "block"
          ErrorLabel.textContent =ErrorMessage
        }else{
            ResetEffect(input)
        }
      
      return (!IsBlank && IsValid)
    }

    function CheckFields(FocusedField){
      var ValidInputs = 0

      for(var i = 0; i < AllInputs.length; i++) {
        let input =AllInputs[i]
        
        let IgnoreBlank = input != FocusedField
        let IsValid = VerifyField(input, IgnoreBlank)
        if (IsValid){
          console.log()
          ValidInputs += 1
        }
      }

      

      SubmitButton.disabled = !(ValidInputs == AllInputs.length)
    }
  

    for(var i = 0; i < AllInputs.length; i++) {
      let input =AllInputs[i]

      var MessageError = document.createElement("label")
      MessageError.textContent = ""
      MessageError.className = "error-text"
      MessageError.style.display = "none"
      input.ErrorLabel =MessageError
      input.parentElement.parentElement.appendChild(MessageError)

      input.addEventListener('input', function(){
        CheckFields(input)
      })
      input.addEventListener('blur', function(){
        VerifyField(input, true)
      })
    }

    function Register(){
      var SendData = new FormData()

      for(var i = 0; i < AllInputs.length; i++) {
        let input =AllInputs[i]
      

        SendData.append(input.id, input.value)
      }

      ShowLoader();


      var request = new XMLHttpRequest();
      request.open("POST", "../php/register-redirect.php");
      request.send(SendData);

      request.onreadystatechange = function () {
        if (request.readyState == XMLHttpRequest.DONE) {
            HideLoader();
            
            if (request.status >= 200 && request.status < 300) {
               
                var response = JSON.parse(request.responseText)
               
                
                if (!response['sucess']){
                  console.log(response.error)
                }else if (!response.isadmin){
                  CodeMenu.style.display = "flex"
                }

                console.log(response)

                if (response.redirect){
                  window.location.href = response.redirect;
                }
                
            } else {
                console.error("Request failed with status:", request.status, request.statusText);
            }
          } 
      }
    }
    
    SubmitButton.disabled = true
    SubmitButton.addEventListener('click', Register)
  </script>
</body>

</html>