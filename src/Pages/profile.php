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

        require "../php/ligabd.php";
       

        if (!isset($_SESSION["username"])) {
            header("Location: login.php");
            exit();
        } else {
            
            include '../Components/layout.php';
        }

        $profile_id = $_GET["id"];


        $image_directory = '..\..\Server\ImageDatabase\ProfilePictures/';;


        $sql = "SELECT * FROM users WHERE userid=".$profile_id;
        $result = mysqli_query($con, $sql);

        $profileinfo = mysqli_fetch_array( $result);
        
        $pfp_file = $profileinfo["profile_icon"] != "" ? $profileinfo["profile_icon"] : "default.png";
        $pfp = $image_directory.$pfp_file;



        echo '
        <div class="profile-layout" id="profile-layout">
        <h1 style="margin-left:10px;">Profile</h1>

        <div class="profile-row" id="profile-row">
            <div class="pfp" style="height:90%; padding:10px; margin-right:20px; width:150px">
                <img src='.$pfp.'></img>
            </div>
            <div class="profile-collumn">
                <div style="margin-bottom:50px;" class="profile-collumn">
                    <div class="profile-row">
                        <h2  id="fullname" style="margin-bottom:2px;" editable>'.$profileinfo["fullname"].'</h2>
                        <img id="edit-profile" onclick=Edit() src="../Images/Icons/edit.svg" class="input-icon" manager-component></img>
                        <img id="deactivate-profile" onclick=Deactivate() src="../Images/Icons/deactivate.svg" class="input-icon" admin-component></img>
                    </div>
                    <label class="caption">@'.$profileinfo["username"].'</label>
                </div>


                <div class="profile-row" style="gap:20px">
                    <div class="profile-collumn">
                        <label class="smallh">Email</label>
                        <label id="email" class="lightweight" editable>'.$profileinfo["email"].'</label>
                    </div>

                    <div class="profile-collumn">
                        <label class="smallh">Phone Number</label>
                        <label id="phone" class="lightweight" editable>'.$profileinfo["phone"].'</label>
                    </div>
                    
                    <div class="profile-collumn">
                        <label class="smallh">Join Date</label>
                        <label class="lightweight">'.date("Y-m-d", strtotime($profileinfo["created"])).'</label>
                    </div>
                </div>

                <div class="separator" style="margin-top:40px;margin-bottom:20px"></div>
            </div>
        </div>
        
    </div>
        ';
    ?>

    


    
    </div>
    </div>
</body>

<script>
    
    
    var Editing = false;
    var EditCooldown = false;
    const OriginalStyles = []
    let edit_profile = document.getElementById("edit-profile") 
    let deactivate_profile = document.getElementById("deactivate-profile") 
    let profile_layout = document.getElementById("profile-layout") 
    let profile_row = document.getElementById("profile-row")
    let fullname 
    let email 
    let phone 

    let active = <?php echo $profileinfo["active"] ?>;

    console.log(active)
    if (!active){
        profile_row.style.opacity = 0.3
        deactivate_profile.src = "../Images/Icons/check.svg"
        edit_profile.remove()
    }
    
    const url = new URL(window.location.href);
    const getparams = new URLSearchParams(url.search);
    const userid = getparams.get('id'); 

    var AdminComponents = document.querySelectorAll("[editable]")
    AdminComponents.forEach(Comp => {
        OriginalStyles.push([
            Comp = Comp,
            OriginalStyle = window.getComputedStyle(Comp),
            Type = Comp.nodeName
        ])
    })
  

    function save_data() {
        
        
        fullname = document.getElementById("fullname")
        email = document.getElementById("email")
        phone = document.getElementById("phone")

        const senddata = new URLSearchParams({
            userid: userid,
            fullname: fullname.value,
            email: email.value,
            phone: phone.value,
        })


        var xmlhttp = new XMLHttpRequest();
        xmlhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
                var response = this.responseText;
                window.location.href = window.location.href;
            }
        }
        
        xmlhttp.open("POST", "../php/save-profile.php", true);
        xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xmlhttp.send(senddata);

    }

   
    function Edit(){
        if (!EditCooldown){
            EditCooldown =true
            if (!Editing){
                Editing =true;
                
                OriginalStyles.forEach(CompInfo => {
                
                        const input = document.createElement('input');
                        input.className  = "edit-input" 

                    
                        const Comp = CompInfo[0]
                        const OriginalStyle = CompInfo[1]
                        
                        
                        input.style.fontSize = OriginalStyle.getPropertyValue("font-size")
                        input.style.fontWeight = OriginalStyle.getPropertyValue("font-weight")
                        input.id = Comp.id

                        input.value =Comp.innerHTML
                        CompInfo[0] = input;

                        Comp.parentNode.replaceChild(input, Comp);

                        edit_profile.src = "../Images/Icons/check.svg"
                
                });

                EditCooldown =false
            }else{

                ShowLoader()
                save_data()
                

                /*
                OriginalStyles.forEach(CompInfo => {
                    edit_profile.src = "../Images/Icons/edit.svg"
                    const input = document.createElement(CompInfo[2]);
                    

                    const Comp = CompInfo[0]
                    const OriginalStyle = CompInfo[1]
                    
                            
                    input.style.fontSize = OriginalStyle.getPropertyValue("font-size")
                    input.style.fontWeight = OriginalStyle.getPropertyValue("font-weight")
                
                    input.innerHTML = Comp.value
                    CompInfo[0] = input;

                    Comp.parentNode.replaceChild(input, Comp)
                })
                */
                
            }
          
            
        }
    }
    
    function Deactivate(){

        var message
        if (active){
            message = "Are you sure you want to delete this profile?"
        }else{
            message = "Are you sure you want to re-activate this profile?"
        }

        ConfirmPrompt(message, function(Response) {
            if (Response){
                const senddata = new URLSearchParams({
                userid: userid,
                activate: !active
            })

            

                ShowLoader()

                var xmlhttp = new XMLHttpRequest();
                xmlhttp.onreadystatechange = function() {
                    if (this.readyState == 4 && this.status == 200) {
                        var response = this.responseText;
                        console.log(response)
                        window.location.href = window.location.href;
                    }
                }

                xmlhttp.open("POST", "../php/activate-user.php", true);
                xmlhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

                xmlhttp.send(senddata);
            }})
    }
</script>

</html>