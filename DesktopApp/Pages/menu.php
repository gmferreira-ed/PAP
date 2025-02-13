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

    <script type="module">
        
        import config from "../../configurations.js"
        ShowLoader()
        
        const FinalLink = config.API+'/menu?page=1'
        try {
            var response = await fetch(FinalLink);
            var result = await response.json()
        } catch (error) {
            console.error('Fetch error:', error);
}


        HideLoader()
    </script>

    
    
    </div>
    </div>
</body>

</html>
</html>