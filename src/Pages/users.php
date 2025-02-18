<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../corestyles.css">
</head>

<body>

        <?php
            session_start();

            if (!isset($_SESSION["username"])) {
                header("Location: login.php");
                exit();
            } else {
                include '../Components/layout.php';
            }

            require "../php/ligabd.php";

            $image_directory = '..\..\Server\ImageDatabase\ProfilePictures/';

            $sql = "SELECT * FROM users";


            $resultado = mysqli_query($con, $sql);
        
            if (!$resultado ) {
                $_SESSION["erro"] = "Failed to load users";
            }
        ?>



        <script>ShowLoader()</script>

        <label class="title">Users</label>
        <div class="separator" style="margin-bottom:20px"></div>

        
        <table>
            <thead>
                <tr>
                    <th></th>
                    <th>Name</th>
                    <th>ID</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Adress</th>
                    <th>Status</th>
                </tr>
            </thead>

            <tbody>

            <?php
                if (!isset($_SESSION["erro"])){
                    while ( $registo = mysqli_fetch_array( $resultado ) ) {
                
                        $targetcolor = $registo["active"] == 1 ? "green" : "red";
                        

                        $activecircle = '<div class="circle" style="background-color:'.($targetcolor).'">
                        </div>';

                        $pfp_file = $registo["profile_icon"] != "" ? $registo["profile_icon"] : "default.png";

                        $img = $image_directory.$pfp_file;
                        $userdata = "  'profile.php?id=".$registo["userid"]."'";
                    
                        
                        $pfp = '<div class="pfp"><img src='.$img.'>
                        </img></div>';

                        echo '
                        <tr class="profile" onclick="Redirect('.$userdata.')">
                            <td>'.$pfp.'</td>
                            <td>'.$registo["fullname"].'</td>
                            <td>'.$registo["userid"].'</td>
                            <td>'.$registo["email"].'</td>
                            <td>'.$registo["phone"].'</td>
                            <td>'.$registo["adress"].', '.$registo["city"].', '.$registo["country"].', '.$registo["postalcode"].'</td>
                            <td>'.$activecircle.'</td>
                        </tr>';
                    }
                }
                
            ?>
            <script>HideLoader()</script>
            
            
            
            </tbody>
        </table>
        <div class="separator" style="margin-top:20px"></div>

        <div class="button-container" admin-component>
            <button class="button1" onclick='Redirect("register.php")'>Add User</button>
        </div>
    </div>
    </div>
</body>
</html>