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
    ?>

    
    </div>
    </div>
</body>

</html>
</html>